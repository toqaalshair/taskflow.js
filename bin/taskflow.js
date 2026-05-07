#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { compileAndRunFromIr } from "../src/index.js";


function printHelp() {
    console.log(`
TaskFlow    

Usage:
  taskflow run <file>

Examples:
  taskflow run demo/sample.js
  taskflow run ./pipelines/emailFlow.js
`.trim());
}

function toAbs(p) {
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

    const result = await compileAndRunFromIr(filePath);

    if (!result?.ok) {
        // حسب Result عندكم: إمّا error أو message
        const errMsg = result?.error || result?.message || "Unknown error";
        console.error(errMsg);
        process.exit(1);
    }

    const { compiledPath, runOutput } = result.data || {};

    if (compiledPath) {
        console.log(`Compiled: ${compiledPath}`);
    }

    if (runOutput?.stdout) {
        process.stdout.write(runOutput.stdout);
    }

    if (!runOutput?.stdout && runOutput?.stderr) {
        process.stderr.write(runOutput.stderr);
        process.exit(1);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err?.message || String(err));
    process.exit(1);
});
