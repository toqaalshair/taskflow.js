// services/pipelineCompiler.js
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Result } from '../core/result.js';
import { buildPrompt } from './prompt.js';
import { generateUpdatedCode } from './openaiPlanner.js';
import { extractPipelinesFromCode } from './pipelineExtractor.js';

function removeDuplicateConstDeclarations(originalCode, generatedCode) {
  const declaredInOriginal = new Set();
  const declRegex = /^\s*const\s+([A-Za-z_$][\w$]*)\s*=/gm;

  let m;
  while ((m = declRegex.exec(originalCode)) !== null) {
    declaredInOriginal.add(m[1]);
  }

  if (declaredInOriginal.size === 0) return generatedCode;

  const lines = generatedCode.split('\n');
  const cleaned = [];
  const genDeclRegex = /^\s*const\s+([A-Za-z_$][\w$]*)\s*=/;

  for (const line of lines) {
    const mm = line.match(genDeclRegex);
    if (mm && declaredInOriginal.has(mm[1])) continue;
    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}

// 1) نلاقي أول pipeline ونرجع مكانه (index) عشان نحقن هناك
function findFirstPipelineIndex(code) {
  const pipelineRegex =
    /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:task|Task)\s*\([\s\S]*?\)\s*(?:\.\s*then\s*\([\s\S]*?\)\s*)+;/m;

  const match = code.match(pipelineRegex);
  if (!match) return -1;
  return match.index ?? -1;
}

// 2) نحذف كل pipelines من الملف
function removeAllPipelines(code) {
  const pipelineRegexGlobal =
    /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:task|Task)\s*\([\s\S]*?\)\s*(?:\.\s*then\s*\([\s\S]*?\)\s*)+;/gm;

  return code.replace(pipelineRegexGlobal, '').trim();
}

// 3) نحقن الكود المولد بمكان أول pipeline (قبل الحذف كان موجود)
function injectAtFirstPipeline(originalCode, generatedBlock) {
  const idx = findFirstPipelineIndex(originalCode);
  if (idx < 0) throw new Error('No pipeline found to inject.');

  // نحذف كل pipelines أولاً
  const noPipelines = removeAllPipelines(originalCode);

  // بما إننا حذفنا pipelines، ما عاد idx صالح على النص الجديد
  // فالأضمن: نحقن بدل “marker” ثابت.
  // طريقة بسيطة: نحقن عند أول مكان كان فيه pipeline عبر split من original:
  const before = originalCode.slice(0, idx);
  // console.log("before:\n", before);
  // console.log('--/////////////////////////////////////////////////////////////////////\n/////////////////////////////////////////////////-');
  const afterOriginal = originalCode.slice(idx);
  // console.log("afterOriginal:\n", afterOriginal);
  // console.log('--/////////////////////////////////////////////////////////////////////\n/////////////////////////////////////////////////-');


  // بعد ما نحدد before، نحذف pipelines من after ونرجع "after clean"
  const afterClean = removeAllPipelines(afterOriginal);
  // console.log("afterClean:\n", afterClean);
  //   console.log('--/////////////////////////////////////////////////////////////////////\n/////////////////////////////////////////////////-');
  // console.log("generatedBlock:\n", generatedBlock);


  const injected =
    `${before.trimEnd()}\n\n` +
    `// taskflow:generated:start\n` +
    `${generatedBlock.trim()}\n` +
    `// taskflow:generated:end\n\n` +
    `${afterClean.trimStart()}\n`;

  return injected;
}

export async function compilePipelineFromFile(filePath) {
  try {
    const inputPath = String(filePath || '').trim();
    if (!inputPath) return Result.failed('File path must be a non-empty string.');

    const absPath = path.resolve(inputPath);
    const originalCode = await readFile(absPath, 'utf8');

    // استخراج pipelines
    const extractResult = extractPipelinesFromCode(originalCode);
    if (!extractResult.ok) return extractResult;

    const { pipelines } = extractResult.data;

    const pipelinesText = pipelines
      .map(p => {
        const steps = p.tasks.map((t, i) => `${i + 1}. ${t.label}`).join('\n');
        return `PipelineName: ${p.name}\nTitle: ${p.title || ''}\nSteps:\n${steps}\n`;
      })
      .join('\n');

    // IMPORTANT: بدنا AI يرجع فقط block بديل (مش الملف كامل)

    //     const command = `
    // Generate executable JavaScript ONLY for the following pipelines.

    // Rules (VERY IMPORTANT):
    // - DO NOT output the full file.
    // - DO NOT include any existing code.
    // - DO NOT repeat variable declarations.
    // - DO NOT modify unrelated code.
    // - Output ONLY functions and execution logic for the pipelines.
    // - Use ES Modules syntax only.
    // - No markdown, no backticks.

    // Pipelines:
    // ${pipelinesText}
    // `;
    const command = `
Generate executable JavaScript ONLY for the following pipelines.

Rules (VERY IMPORTANT):
1. Wrap EACH pipeline function inside a wrapper that logs:
   - "▶ Starting <pipelineName>" at start
   - "✔ <pipelineName> completed" if success
   - "✖ <pipelineName> failed: <error message>" if it throws
2. Use a single helper function "runPipelineWithLogging(pipelineName, fn)" to handle the try/catch and logging.
3.All messages, including error messages, must be printed using console.log (do NOT use console.error).
4. Output ONLY async functions for the pipelines and a single function "runAllTaskflowPipelines" that calls all pipelines sequentially using await.
5. Do NOT output the full file.
6. Do NOT include any existing code.
7. Do NOT repeat variable declarations.
8. Do NOT modify unrelated code.
9. Use ES Modules syntax only.
10. No markdown, no backticks.
11.Output ONLY functions and execution logic for the pipelines.


Pipelines:
${pipelinesText}
`;

    const prompt = buildPrompt(command, originalCode);

    const aiResult = await generateUpdatedCode(prompt);

    if (!aiResult.ok) return Result.failed(aiResult.error);
    const usedMock = Boolean(aiResult.data?.usedMock);
    const mockReason = aiResult.data?.mockReason;


    const generatedBlock = aiResult.data.generatedCode;
    if (!generatedBlock || !generatedBlock.trim()) {
      return Result.failed('AI returned empty code.');
    }

    const cleanedBlock = removeDuplicateConstDeclarations(originalCode, generatedBlock);

    // حقن داخل الملف
    const compiledCode = injectAtFirstPipeline(originalCode, cleanedBlock);

    const compiledPath = absPath.replace(/\.js$/i, '.compiled.js');
    await writeFile(compiledPath, compiledCode, 'utf8');

    return Result.success({
      compiledPath,
      pipelines: pipelines.map(p => ({
        name: p.name,
        title: p.title,
        steps: p.tasks.map(t => t.label),

      })),
      usedMock,
      mockReason

    });
  } catch (error) {
    return Result.failed(error.message);
  }
}