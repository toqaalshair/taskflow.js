export function buildPromptFromIR(ir) {
    // ===== Global Variables =====
    const variablesText = (ir.globalVariables || [])
        .map(v => (typeof v === "string" ? v : v.name))
        .join(", ");

    // ===== Helper Functions =====
    const functionsText = (ir.helperFunctions || [])
        .map(f => `// Helper function '${f.name}' is already available\n${f.code}`)
        .join("\n\n");

    function formatTaskNode(node, indentLevel = 1, indexLabel = null) {
        const indent = "  ".repeat(indentLevel);
        const prefix = indexLabel ? `${indent}${indexLabel}. ` : `${indent}- `;

        if (!node) {
            return `${prefix}Unknown node`;
        }

        // ===== NORMAL TASK =====
        if (node.type === "task") {
            const vars = (node.usedVariables || []).join(", ") || "none";
            let line = `${prefix}${node.description} (Uses: ${vars})`;

            if (node.options && Object.keys(node.options).length > 0) {
                line += ` (Options: ${JSON.stringify(node.options)})`;
            }

            return line;
        }

        // ===== PARALLEL =====
        if (node.type === "parallel") {
            const header = `${prefix}PARALLEL:`;

            const inner = (node.tasks || [])
                .map(child => formatTaskNode(child, indentLevel + 1))
                .join("\n");

            return inner ? `${header}\n${inner}` : header;
        }

        // ===== CONDITIONAL =====
        if (node.type === "conditional") {
            const header = `${prefix}CONDITIONAL:`;

            const branchesText = (node.branches || [])
                .map(branch => {
                    const branchHeader = `${"  ".repeat(indentLevel + 1)}IF ${branch.condition}`;
                    const branchTasks = (branch.tasks || [])
                        .map(child => formatTaskNode(child, indentLevel + 2))
                        .join("\n");

                    return branchTasks ? `${branchHeader}\n${branchTasks}` : branchHeader;
                })
                .join("\n");

            return branchesText ? `${header}\n${branchesText}` : header;
        }

        return `${prefix}Unknown task type`;
    }

    // ===== Pipelines =====
    const pipelinesText = (ir.pipelines || [])
        .map(p => {
            const tasksText = (p.tasks || [])
                .map((t, i) => formatTaskNode(t, 1, i + 1))
                .join("\n");

            return `Pipeline: "${p.name}"\nTasks:\n${tasksText}`;
        })
        .join("\n\n");

    // ===== FINAL PROMPT =====
    return `
You are an expert AI programmer that generates executable Node.js ES module code.

Your job is to convert the following workflow IR into valid, executable JavaScript.

---

### GLOBAL VARIABLES
[${variablesText}]

These variables are already defined.
DO NOT redeclare them.

---

### HELPER FUNCTIONS
${functionsText || "// No helper functions available."}

These helper functions are already defined.
DO NOT redefine them.

---

### PIPELINES
${pipelinesText}

---

### CRITICAL OUTPUT CONSTRAINTS

- Output ONLY valid executable JavaScript
- Do NOT output markdown
- Do NOT output backticks
- Do NOT output explanations
- Do NOT output notes
- Do NOT output apologies
- Do NOT output any text before or after the JavaScript code
- Do NOT leave tasks as comments like "// Task 1"
- Do NOT output "unknown task"
- Your output will be parsed automatically by a JavaScript parser
- Any non-JavaScript text will cause the process to fail

If task details are unclear, you MUST still generate valid JavaScript using:
- helper functions if available
- built-in Node.js APIs
- fetch or axios for obvious HTTP/API tasks
- console.log as a safe fallback

---

### TASK SEMANTICS

- task = execute sequentially
- parallel = execute all child tasks concurrently using Promise.all
- conditional = generate if / else if / else logic
- conditional tasks may contain nested conditionals and nested parallel groups

You MUST preserve the exact task order.

---

### TASK IMPLEMENTATION RULES

For each task:
- Implement the task in real executable JavaScript
- Use the task description as the source of intent
- Use referenced global variables if mentioned in the task description
- Use helper functions when the task description explicitly refers to them
- Never skip a task
- Never replace a task with a placeholder comment

Examples:
- If a task says "call helper X", call helper X
- If a task mentions an API URL variable, use fetch or axios
- If a task is unclear, use a simple executable fallback such as console.log

---

### RETRY LOGIC

If a task has options.retries:
- Retry the task (retries + 1) total attempts
- Use options.delay as the base delay
- If delay is missing, use 1000ms
- Delay formula: baseDelay * attempt
- Apply retry ONLY to that specific task

You may define:

const delay = ms => new Promise(res => setTimeout(res, ms));

---

### PARALLEL EXECUTION

For parallel nodes, use this pattern:

await Promise.all([
  (async () => {
    // task 1
  })(),
  (async () => {
    // task 2
  })()
]);

---

### CONDITIONAL EXECUTION

For conditional nodes:
- Use if / else if / else when appropriate
- Use the provided branch condition exactly as given
- Support nested conditionals correctly

---

### VARIABLES RULES

- DO NOT modify const variables
- DO NOT redeclare existing global variables
- Only read and use them

---

### IMPORT RULES

- Use ONLY ES module imports
- DO NOT use require()
- Add imports only when actually needed
- Prefer built-in Node.js APIs when possible
- For Node.js built-in modules, ALWAYS use the node: prefix.

Correct examples:
import { appendFile } from "node:fs/promises"
import path from "node:path"

Wrong:
import { appendFile } from "fs/promises"
import path from "path"

---

### HTTP RULES

For obvious HTTP or API tasks:
- Use fetch or axios
- If using axios, import it with ES modules

Example:

import axios from "axios";

await axios.post(apiUrl, data);

---

### CODE STRUCTURE

For each pipeline, create one async function:

async function run_<pipelineNameInCamelCase>() {
  try {
    console.log("▶ Starting <Pipeline Name>");
    // pipeline logic
    console.log("✔ <Pipeline Name> completed");
  } catch (error) {
    console.log("✖ <Pipeline Name> failed:", error.message);
  }
}

Then create:

async function runAllPipelines()

Inside it:
- call all pipeline functions sequentially using await

Finally call:

runAllPipelines();

---

Return ONLY valid JavaScript code.
`;
}