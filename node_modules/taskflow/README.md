# TaskFlow

TaskFlow is a Node.js tool that allows developers to define **high-level task pipelines** using simple, readable steps, then automatically **compile and execute** them as real JavaScript code.

It supports both:
- 📦 **Library usage** (from JavaScript code)
- 🧰 **CLI usage** (from the terminal)

TaskFlow is designed for automation, experimentation, and educational purposes.

---

## Features

- Define pipelines using readable `.then("step description")` chains
- Automatically generate executable JavaScript code
- Preserve all non-pipeline code exactly as-is
- Run pipelines sequentially with clear logging
- CLI support (`taskflow run <file>`)
- Graceful fallback when OpenAI is unavailable (Mock Mode)
- ES Modules support

---

## Installation

### Local / Project Install
```bash
npm install taskflow
```
### Global Install (CLI)
```bash
npm install -g taskflow
```
---

## CLI Usage
Create a JavaScript file that contains TaskFlow pipelines.
**Example: userApp.js**
```js
import { Task } from "taskflow";

const userEmail = "user@example.com";
const subject = "Welcome!";
const messageText = "Hello from TaskFlow 👋";

const emailFlow = Task("Email Notification")
  .then("Create an email content using userEmail, subject, and messageText")
  .then("Print the email content to the console")
  .then("Print a confirmation message that the email is 'sent'");
  ```

### Run the file using the CLI:
```bash
taskflow run userApp.js
```

#### TaskFlow will:
- Analyze the pipelines
- Generate executable JavaScript code
- Compile the file into a .compiled.js file
- Execute the compiled output

## Library Usage
You can also use TaskFlow programmatically from another script.
**Example: run.js**
```js
import { compileAndRunPipeline } from "taskflow";

const result = await compileAndRunPipeline("./userApp.js");

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

## Output
After execution, TaskFlow returns:
- The path to the compiled file
- The runtime output (stdout, stderr, exitCode)

---

## Mock Mode (OpenAI Fallback)

If OpenAI is unavailable (missing API key, quota exceeded, or connection issues), TaskFlow automatically switches to Mock Mode.

In Mock Mode:

- A deterministic JavaScript block is generated
- The full compile → run flow is preserved
- The system continues to work for demos and testing
- The CLI indicates when Mock Mode is used.

---

## Environment Variables

TaskFlow uses the following environment variables:
- OPENAI_API_KEY – Your OpenAI API key
- OPENAI_MODEL – Optional model name (default: gpt-4o-mini)
These can be defined in a .env file or directly in the system environment.




