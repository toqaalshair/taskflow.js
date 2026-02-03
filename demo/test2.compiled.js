// ================================
// DSL WITH DATA DEPENDENCY
// ================================

// Pipeline 1: Generate numbers and sum them

// taskflow:generated:start
const runPipelineWithLogging = async (pipelineName, fn) => {
  console.log(`▶ Starting ${pipelineName}`);
  try {
    await fn();
    console.log(`✔ ${pipelineName} completed`);
  } catch (error) {
    console.log(`✖ ${pipelineName} failed: ${error.message}`);
  }
};

const taskflow_run_mathFlow = async (ctx) => {
  const numbers = [1, 2, 3, 4, 5];
  const totalSum = numbers.reduce((acc, num) => acc + num, 0);
  console.log(totalSum);
};

const taskflow_run_multiplyFlow = async (ctx) => {
  const doubleSum = totalSum * 2;
  console.log(doubleSum);
};

const taskflow_run_textFlow = async (ctx) => {
  const finalText = doubleSum.toString() + ' units';
  console.log(finalText);
};

const taskflow_run_asyncFlow = async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Final value is ' + finalText);
};

const runAllTaskflowPipelines = async () => {
  await runPipelineWithLogging('mathFlow', taskflow_run_mathFlow);
  await runPipelineWithLogging('multiplyFlow', taskflow_run_multiplyFlow);
  await runPipelineWithLogging('textFlow', taskflow_run_textFlow);
  await runPipelineWithLogging('asyncFlow', taskflow_run_asyncFlow);
};

runAllTaskflowPipelines();
// taskflow:generated:end

// Pipeline 2: Use the sum from mathFlow


// Pipeline 3: Convert text using result from previous pipeline


// Pipeline 4: Async step depending on finalText
