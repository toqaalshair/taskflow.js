

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
  const numbers = Array.from({ length: 5 }, (_, i) => i + 1);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  console.log(`Result: ${sum}`);
};

const taskflow_run_fileFlow = async (ctx) => {
  const fs = await import('fs/promises');
  const data = await fs.readFile('sample2.txt', 'utf8');
  const lines = data.split('\n').length;
  console.log(`Line count: ${lines}`);
};

const taskflow_run_dateFlow = async (ctx) => {
  const currentDate = new Date();
  const previousDate = new Date(currentDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const difference = currentDate - previousDate;
  console.log(`Difference in milliseconds: ${difference}`);
};

const taskflow_run_flow = async (ctx) => {
  const result = 'hello'.toUpperCase();
  console.log(`Result: ${result}`);
};

const runAllTaskflowPipelines = async () => {
  await runPipelineWithLogging('mathFlow', taskflow_run_mathFlow);
  await runPipelineWithLogging('fileFlow', taskflow_run_fileFlow);
  await runPipelineWithLogging('dateFlow', taskflow_run_dateFlow);
  await runPipelineWithLogging('flow', taskflow_run_flow);
};

runAllTaskflowPipelines();
// taskflow:generated:end


