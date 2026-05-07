// controllers/workflowController.js
import { Result } from '../core/result.js';
import { compileFromIr, parseDslToIr } from '../services/pipelineCompiler.js';
import { runCompiledFile } from '../services/runner/pipelineRunner.js';


export async function compileAndRunFromIr(filePath) {
    try {
        const compileResult = await compileFromIr(filePath);

        if (!compileResult.ok) {
            return compileResult;
        }

        const { compiledPath } = compileResult.data;

        const runResult = await runCompiledFile(compiledPath);

        if (!runResult.ok) {
            return runResult;
        }

        return Result.success({
            compiledPath,
            runOutput: runResult.data,
            ir: compileResult.data.ir,
            usedMock: compileResult.data.usedMock,
            mockReason: compileResult.data.mockReason
        });
    } catch (err) {
        return Result.failed(err.message);
    }
}


/**
 * للاختبار فقط:
 * يولد الـ IR من ملف DSL بدون تنفيذ.
 */
export async function generateIRFromDSL(filePath) {
    try {
        const irResult = await parseDslToIr(filePath);

        if (!irResult.ok) {
            return irResult;
        }

        return Result.success(irResult.data);
    } catch (err) {
        return Result.failed(err.message);
    }
}