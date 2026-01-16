// controllers/workflowController.js
// تجميع كل قطع الكود اللازمة لتحديث ملف بناءً على أمر المستخدم
import { readFile } from 'node:fs/promises';
import { ExecutionContext, Status } from '../core/executionContext.js';
import { buildPrompt } from '../services/prompt.js';
import { generateUpdatedCode } from '../services/openaiPlanner.js';
import { Result } from '../core/result.js';
// ياخد أمر المستخدم ومسار الملف،
export async function updateCodeFromCommand(command, filePath) {
    const cmd = String(command || '').trim();
    const path = String(filePath || '').trim();
    let codeFileContent;
    let ctx;

    try {

        if (!cmd) throw new Error('Command must be a non-empty string.');
        if (!path) throw new Error('File path must be a non-empty string.');

        try {
            codeFileContent = await readFile(path, 'utf8');

        } catch (err) {
            throw new Error(`Failed to read file at ${path}: ${err.message}`);
        }

        ctx = new ExecutionContext(cmd, codeFileContent);
        ctx.status = Status.PROMPTING;

        const prompt = buildPrompt(cmd, codeFileContent);
        ctx.prompt = prompt;

        let updatedCode;
        try {
            updatedCode = await generateUpdatedCode(prompt);
        } catch (err) {
            throw new Error(`Failed to generate updated code: ${err.message}`);
        }

        ctx.generatedCode = updatedCode;
        ctx.status = Status.DONE;

        return Result.success({
            filePath: path,
            updatedCode,
            context: ctx
        });
    } catch (error) {
        if (!ctx) {
            ctx.status = Status.FAILED;
            ctx.error = error.message;
        }
        return Result.failed(error.message, { context: ctx });
    }
}

