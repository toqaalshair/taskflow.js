import { runCompiledFile } from '../src/services/pipelineRunner.js';

const compiledPath = './sample.compiled.js';

const r = await runCompiledFile(compiledPath);

console.log('STATUS:', r.status);

if (!r.ok) {
    console.log('ERROR:', r.error);
    console.log('EXIT CODE:', r.data?.exitCode);
    console.log('STDOUT:\n', r.data?.stdout);
    console.log('STDERR:\n', r.data?.stderr);
} else {
    console.log('EXIT:', r.data.exitCode);
    console.log('STDOUT:\n', r.data.stdout);
}
