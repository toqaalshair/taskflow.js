// services/pipelineCompiler.js
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Result } from '../core/result.js';
import { buildPrompt } from './prompt.js';
import { generateUpdatedCode } from './openaiPlanner.js';
import { extractPipelineFromCode } from './pipelineExtractor.js';

// function لإزالة تعريفات const المكررة في الكود المولد، 
// لانه الai ممكن يغلط و يعيد التعريف حتى لو كاتبينله بالبرومبت ما تكرر
function removeDuplicateConstDeclarations(originalCode, generatedCode) {
  const declaredInOriginal = new Set();
  // استخراج جميع تعريفات const من الكود الأصلي
  const declRegex = /^\s*const\s+([A-Za-z_$][\w$]*)\s*=/gm;
  // exec عبارة عن حلقة للبحث عن جميع التطابقات
  let m;
  while ((m = declRegex.exec(originalCode)) !== null) {
    // لو وجد const يخزنه في ال set
    declaredInOriginal.add(m[1]);
  }

  if (declaredInOriginal.size === 0) return generatedCode;

  // الآن ننظف الكود المولد من أي تعريفات const مكررة

  const lines = generatedCode.split('\n');
  const cleaned = [];
  const genDeclRegex = /^\s*const\s+([A-Za-z_$][\w$]*)\s*=/;

  for (const line of lines) {
    const mm = line.match(genDeclRegex);
    if (mm && declaredInOriginal.has(mm[1])) {
      continue;
    }
    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}


function replacePipelineBlock(originalCode, generatedCode) {
  //  نبحث عمكان ال Pipeline و نستبدله بالكود المولد
  const pipelineRegex =
    /\b(?:const|let|var)\s+\w+\s*=\s*(?:task|Task)\s*\([\s\S]*?\)\s*(?:\.\s*then\s*\([\s\S]*?\)\s*)+;/m;


  // .test للتأكد من وجود البلوك
  if (!pipelineRegex.test(originalCode)) {
    throw new Error('Pipeline block not found to replace.');
  }

  return originalCode.replace(
    pipelineRegex,
    `// taskflow:generated:start\n${generatedCode}\n// taskflow:generated:end`
  );
}


export async function compilePipelineFromFile(filePath) {
  try {
    const inputPath = String(filePath || '').trim();
    if (!inputPath) return Result.failed('File path must be a non-empty string.');
    // تحويل المسار إلى مسار مطلق path.resolve
    // يعني لو المستخدم أعطى مسار نسبي زي `./script.js`، 
    // هنحوله لمسار كامل زي `/user/home/TaskFlow2/demo/script.js`
    // كيف بتشتغل بتدور على المسار الحالي للتنفيذ وتدمجه مع المسار النسبي
    const absPath = path.resolve(inputPath);
    const originalCode = await readFile(absPath, 'utf8');

    // 1) استخراج pipeline
    const extractResult = extractPipelineFromCode(originalCode);
    if (!extractResult.ok) return extractResult;
    const { title, tasks } = extractResult.data;


    // 2) نبني command واضح للـ AI
    const command =
      `Replace the existing pipeline chain with plain executable JavaScript statements (no Task() or .then() chaining). Execute steps sequentially using async/await if needed.\n` +
      (title ? `Workflow Title: ${title}\n` : '') +
      tasks.map((s, i) => `${i + 1}. ${s}`).join('\n') +
      `\n\nRules:\n` +
      `- Use inputs already defined in the file.\n` +
      `- Do not introduce new external libraries.\n` +
      `- Keep unrelated code unchanged.\n` +
      `- Use just existing variables from the file as inputs.\n` +
      `- Output only the updated JavaScript code.`;

    // 3) نبني prompt من command + code
    const prompt = buildPrompt(command, originalCode);

    // 4) نطلب من OpenAI تحديث الكود (يرجع Result)
    const aiResult = await generateUpdatedCode(prompt);
    if (!aiResult.ok) return Result.failed(aiResult.error);

    const generatedCode = aiResult.data.generatedCode;
    if (!generatedCode.trim()) return Result.failed('AI returned empty code.');
    const cleanedGeneratedCode = removeDuplicateConstDeclarations(originalCode, generatedCode);


    // 5) نستبدل pipeline داخل الملف
    const compiledCode = replacePipelineBlock(originalCode, cleanedGeneratedCode);

    // 6) نكتب ملف جديد compiled
    const compiledPath = absPath.replace(/\.js$/i, '.compiled.js');
    await writeFile(compiledPath, compiledCode, 'utf8');

    return Result.success({
      compiledPath,
      title,
      steps: tasks
    });
  } catch (error) {
    return Result.failed(error.message);
  }
}
