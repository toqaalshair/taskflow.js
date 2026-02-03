// controllers/workflowController.js

import { Result } from '../core/result.js';
import { compilePipelineFromFile } from '../services/pipelineCompiler.js';
import { runCompiledFile } from '../services/pipelineRunner.js';

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
            runOutput: runResult.data,// يشتمل على stdout, stderr, exitCode
            usedMock: compileResult.data.usedMock,
            mockReason: compileResult.data.mockReason
        });
    } catch (err) {
        return Result.failed(err.message);
    }
}