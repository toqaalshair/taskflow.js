#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { compileAndRunPipeline } from "../src/index.js";

function printHelp() {
    console.log(`
TaskFlow CLI

Usage:
  taskflow run <file>

Examples:
  taskflow run demo/sample.js
  taskflow run ./pipelines/emailFlow.js
`.trim());
}

function toAbs(p) {
    // دعم مسارات نسبية
    return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
        printHelp();
        process.exit(0);
    }

    const command = args[0];

    if (command !== "run") {
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }

    const fileArg = args[1];
    if (!fileArg) {
        console.error("Missing <file>.");
        printHelp();
        process.exit(1);
    }

    const filePath = toAbs(fileArg);

    const result = await compileAndRunPipeline(filePath);

    if (!result?.ok) {
        // حسب Result عندكم: إمّا error أو message
        const errMsg = result?.error || result?.message || "Unknown error";
        console.error(errMsg);
        process.exit(1);
    }

    const { compiledPath, runOutput } = result.data || {};
    console.log(`Compiled: ${compiledPath}`);

    // اطبع stdout/stderr لو موجودين
    if (runOutput?.stdout) process.stdout.write(runOutput.stdout);
    if (runOutput?.stderr) process.stderr.write(runOutput.stderr);

    // exitCode لو بدكم تعكسوه
    const exitCode = Number.isInteger(runOutput?.exitCode) ? runOutput.exitCode : 0;
    process.exit(exitCode);
}

main().catch((err) => {
    console.error(err?.message || String(err));
    process.exit(1);
});
