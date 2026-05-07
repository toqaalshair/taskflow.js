# TaskFlow

TaskFlow is a Node.js tool for defining and executing **high-level workflow pipelines** using a simple, readable API.

Instead of writing execution logic manually, developers describe **what should happen**, and TaskFlow handles:
- parsing the workflow
- generating executable JavaScript
- running it automatically

This makes it easier to build automation flows, prototypes, and structured task pipelines.

It supports both:
- 📦 **Library usage** (from JavaScript code)
- 🧰 **CLI usage** (from the terminal)

TaskFlow is designed for automation, experimentation, and educational purposes.

---

## Features

- Define pipelines using readable `.then("step description")` chains
- 🔀 **Parallel execution** with `.parallel([...])`
- 🔁 **Conditional logic** with `.when(condition, callback)`
- ⚙️ Automatic code generation and execution
- 🧠 Internal processing via parsing → IR → code generation
- Preserve all non-pipeline code exactly as-is
- CLI support (`taskflow run <file>`)
- 🧪 Mock Mode fallback when OpenAI is unavailable
- ES Modules support

---

## Installation

### Local / Project Install
```bash
npm install taskflow.js
```
### Global Install (CLI)
```bash
npm install -g taskflow.js
```
---

**Quick Example: userApp.js**
```js
import { Task } from "taskflow.js";

const isProduction = true;

const pipeline = Task("Build Pipeline")
  .then("Install dependencies")

  .parallel([
    "Build frontend",
    "Build backend"
  ])

  .when(isProduction, (flow) => {
    flow.then("Deploy application");
  })

  .then("Print build summary");
  ```
## Usage

### Run the file using the CLI:
```bash
taskflow run userApp.js
```

### Run the file Library Usage
You can also use TaskFlow programmatically from another script.
**Example: run.js**
```js
import { compileAndRunFromIr } from "taskflow.js";

const result = await compileAndRunFromIr("./userApp.js");

if (!result.ok) {
  console.error(result.error);
  process.exit(1);
}

console.log("Compiled file:", result.data.compiledPath);
console.log(result.data.runOutput.stdout);
```

### Run it with:
```bash
node run.js
```
### How It Works

TaskFlow processes workflows in multiple stages:

1. Parsing
Extracts pipeline definitions from your code
2. IR Transformation
Converts workflows into an intermediate representation (IR)
3. Code Generation
Generates executable JavaScript (AI-assisted or mock)
4. Execution
Runs the generated pipeline inside Node.js


## Output

After execution, TaskFlow provides detailed results about the compiled and executed pipeline:

- **Compiled File Path**  
  The location of the generated `.compiled.js` file that contains the executable pipeline.

- **Standard Output (`stdout`)**  
  The console output produced during pipeline execution (e.g., task logs, results).

- **Standard Error (`stderr`)**  
  Any error messages generated during execution.

- **Exit Code (`exitCode`)**  
  Indicates whether execution succeeded (`0`) or failed (non-zero).

This structured output allows developers to inspect execution behavior, debug workflows, and integrate TaskFlow results into other systems.

---

## Mock Mode (OpenAI Fallback)

If OpenAI is unavailable (missing API key, quota exceeded, or network issues), TaskFlow automatically switches to Mock Mode.

In Mock Mode:

- No external API is required
- A deterministic JavaScript pipeline is generated
- Each task is represented as a clear log (MOCK TASK)
- Retry behavior and execution flow are still simulated
- The full compile → run pipeline remains unchanged

This allows you to:

Test workflows without API access
Debug pipeline structure
Demonstrate system behavior reliably

---

## Environment Variables

TaskFlow uses the following environment variables:
- OPENAI_API_KEY – Your OpenAI API key
- OPENAI_MODEL – Optional model name (default: gpt-4o-mini)
These can be defined in a .env file or directly in the system environment.

---
## Requirements

-Node.js 18+
-ES Modules

## Notes
- .env is not included in the package




