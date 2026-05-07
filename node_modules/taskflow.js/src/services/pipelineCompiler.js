// services/pipelineCompiler.js
import * as acorn from "acorn"
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { Result } from "../core/result.js";

import { extractIrWithAst } from "./ir/irExtractor.js";
import { mergeGeneratedCode } from "./compiler/astMerger.js";

import {
    extractDependencies,
    getMissingDependencies,
    installDependencies
} from "./dependencies/dependencyManager.js";

import { sanitizeGeneratedBlock, generateCodeFromIR } from "./generator/codeGenerator.js";


export async function parseDslToIr(filePath) {
    try {
        const absPath = path.resolve(filePath);
        const code = await readFile(absPath, "utf8");

        const ir = extractIrWithAst(code);

        if (!ir.pipelines || !ir.pipelines.length) {
            return Result.failed("No pipelines found");
        }

        return Result.success(ir);
    }
    catch (error) {
        return Result.failed(error.message);
    }
}

export async function compileFromIr(filePath) {
    try {
        const irResult = await parseDslToIr(filePath);
        if (!irResult.ok) return irResult;

        const ir = irResult.data;

        // طلب توليد الكود من الذكاء الاصطناعي بناءً على الـ IR
        const codeGenResult = await generateCodeFromIR(ir);
        if (!codeGenResult.ok) return codeGenResult;

        const { generatedCode, usedMock, mockReason } = codeGenResult.data;

        // تنظيف الكود المولد (إزالة علامات ```javascript مثلاً)
        const generatedBlock = sanitizeGeneratedBlock(generatedCode);


        const originalCode = await readFile(path.resolve(filePath), "utf8");

        // دمج الكود المولد مع الكود الأصلي باستخدام الـ AST Merger المعدل
        const finalCode = mergeGeneratedCode(originalCode, generatedBlock);

        const compiledPath = filePath.replace(/(\.js)$/i, ".compiled$1");
        await writeFile(compiledPath, finalCode, "utf8");

        // إدارة المكتبات المطلوبة تلقائياً
        const requiredDeps = extractDependencies(finalCode);
        const missingDeps = await getMissingDependencies(requiredDeps);

        if (missingDeps.length > 0) {
            await installDependencies(missingDeps);
        }

        return Result.success({
            compiledPath,
            ir,
            usedMock,
            mockReason
        });
    }
    catch (error) {
        return Result.failed(error.message);
    }
}