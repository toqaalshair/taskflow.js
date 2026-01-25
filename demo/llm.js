// import { updateCodeFromCommand } from '../controllers/workflowController.js';

// const command = 'Add input validation to the function and keep the rest of the file unchanged.';
// const filePath = './demo/sample.js';
// const result = await updateCodeFromCommand(command, filePath);

// console.log('STATUS:', result.status);

// if (result.ok) {
//   console.log('FILE:', result.data.filePath);
//   console.log('UPDATED CODE:\n');
//   console.log(result.data.updatedCode);
// } else {
//   console.log('ERROR:', result.error);
// }

import { updateCodeFromCommand } from '../controllers/workflowController.js';

const result = await updateCodeFromCommand('./demo/sample.js');

if (!result.ok) {
  console.error('FAILED:', result);
  process.exit(1);
}

console.log('SUCCESS');
console.log('COMPILED:', result.data.compiledPath);
console.log('PIPELINE:', result.data.pipeline);
