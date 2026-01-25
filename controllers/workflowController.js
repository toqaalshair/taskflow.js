// controllers/workflowController.js
import { readFile } from 'node:fs/promises';
import { ExecutionContext, Status } from '../core/executionContext.js';
import { buildPrompt } from '../services/prompt.js';
import { generateUpdatedCode } from '../services/openaiPlanner.js';
import { Result } from '../core/result.js';
import { compilePipelineFromFile } from '../services/pipelineCompiler.js';
import { runCompiledFile } from '../services/pipelineRunner.js';

// تحديث ملف بناءً على أمر المستخدم
// export async function updateCodeFromCommand(command, filePath) {
//   const cmd = String(command || '').trim();
//   const path = String(filePath || '').trim();
//   let ctx;

//   try {
//     if (!cmd) throw new Error('Command must be a non-empty string.');
//     if (!path) throw new Error('File path must be a non-empty string.');

//     const codeFileContent = await readFile(path, 'utf8');

//     ctx = new ExecutionContext(cmd, codeFileContent);
//     ctx.status = Status.PROMPTING;

//     const prompt = buildPrompt(cmd, codeFileContent);
//     ctx.prompt = prompt;

//     const aiResult = await generateUpdatedCode(prompt);
//     if (!aiResult.ok) throw new Error(aiResult.error);

//     const updatedCode = aiResult.data.generatedCode;

//     ctx.generatedCode = updatedCode;
//     ctx.status = Status.DONE;

//     return Result.success(
//       {
//         filePath: path,
//         updatedCode,
//         context: ctx
//       }
//     );
//   } catch (error) {
//     if (ctx) {
//       ctx.status = Status.FAILED;
//       ctx.error = error.message;
//     }
//     return Result.failed(error.message, { context: ctx });
//   }
// }

// دالة لتجميع الـ compile و الـ run داخل controller
export async function compileAndRunPipeline(filePath) {
    try {
        // أولاً نعمل compile للـ pipeline
        const compileResult = await compilePipelineFromFile(filePath);

        if (!compileResult.ok) return compileResult; // لو في فشل في compile نرجع نفس الـ Result

        const { compiledPath, title, steps } = compileResult.data;

        // بعد ما نعمل compile بنشغّل الملف المولّد
        const runResult = await runCompiledFile(compiledPath);

        if (!runResult.ok) return runResult; // لو في فشل أثناء التشغيل نرجع نفس الـ Result

        return Result.success({
            compiledPath,
            runOutput: runResult.data // يشتمل على stdout, stderr, exitCode
        });
    } catch (err) {
        return Result.failed(err.message);
    }
}