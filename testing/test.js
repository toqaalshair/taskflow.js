import { compileAndRunPipeline } from "taskflow";

const result = await compileAndRunPipeline("../demo/sample.js");

if (!result.ok) {
    console.error("Error:", result.error);
} else {
    console.log("Success:", result.data.runOutput.stdout);
}
