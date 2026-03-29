// // test.js
// import { compileAndRunFromIr } from "taskflow.js";
import { compileAndRunFromIr } from "../src/index.js";

const result = await compileAndRunFromIr("./astTest.js");

if (!result.ok) {
    console.error("Error:", result.error);
} else {
    console.log("Success:", result.data.runOutput.stdout);
}

// import { generateIRFromDSL, compileAndRunFromIr } from "../src/index.js";

// const filePath = "./fullTest.js";

// console.log("========== IR TEST ==========");
// const irResult = await generateIRFromDSL(filePath);
// console.dir(irResult, { depth: null });

// console.log("\n========== COMPILE + RUN TEST ==========");
// const runResult = await compileAndRunFromIr(filePath);
// console.dir(runResult, { depth: null });