// demo/runPipeline.js
import { compileAndRunPipeline } from '../src/controllers/workflowController.js';

const filePath = './sample.js';

const result = await compileAndRunPipeline(filePath);

console.log('STATUS:', result.status);

if (!result.ok) {
    console.log('ERROR:', result.error);
} else {
    console.log('COMPILED FILE:', result.data.compiledPath);
    console.log('RUN OUTPUT:\n', result.data.runOutput.stdout);
    if (result.data.runOutput.stderr) {
        console.log('ERROR OUTPUT:\n', result.data.runOutput.stderr);
    }
}