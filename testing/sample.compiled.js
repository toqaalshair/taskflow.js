// testing/sample.js



// ===== Inputs (موجودة قبل pipelines عشان الـ AI يستخدمها) =====
const userEmail = "toqaj.sh@gmail.com";
const subject = "Welcome!";
const messageText = "Hello from TaskFlow.js 👋";
const logFilePath = "./demo/app.log";

// دالة مساعدة (كود عادي) ممكن الـ AI يستخدمها أو يتركها
function formatEmail(to, subject, body) {
    return `TO: ${to}\nSUBJECT: ${subject}\n\n${body}`;
}

// ===== Pipeline 1: Email Notification Flow =====

// taskflow:generated:start
console.log("=== TASKFLOW MOCK MODE ===");
console.log("OpenAI unavailable, so mock code was used.");
console.log("Prompt received:");
console.log("You are an AI that updates an existing Node.js JavaScript file.\n\nTask:\nGenerate executable JavaScript ONLY for the following pipelines.\n\nRules (VERY IMPORTANT):\n1. Wrap EACH pipeline function inside a wrapper that logs:\n   - \"▶ Starting <pipelineName>\" at start\n   - \"✔ <pipelineName> completed\" if success\n   - \"✖ <pipelineName> failed: <error message>\" if it throws\n2. Use a single helper function \"runPipelineWithLogging(pipelineName, fn)\" to handle the try/catch and logging.\n3.All messages, including error messages, must be printed using console.log (do NOT use console.error).\n4. Output ONLY async functions for the pipelines and a single function \"runAllTaskflowPipelines\" that calls all pipelines sequentially using await.\n5. Do NOT output the full file.\n6. Do NOT include any existing code.\n7. Do NOT repeat variable declarations.\n8. Do NOT modify unrelated code.\n9. Use ES Modules syntax only.\n10. No markdown, no backticks.\n11.Output ONLY functions and execution logic for the pipelines.\n\n\nPipelines:\nPipelineName: emailFlow\nTitle: Email Notification\nSteps:\n1. Create an email content using userEmail, subject, and messageText\n2. Print the email content to the console\n3. Print a confirmation message that the email is 'sent' (simulation only)\n\nPipelineName: loggingFlow\nTitle: Logging\nSteps:\n1. Create a log line that contains current date and userEmail\n2. Append the log line to logFilePath using node:fs/promises\n3. Print the log file path to the console\n\nExisting Code File:\n// testing/sample.js\r\n\r\n\r\n\r\n// ===== Inputs (موجودة قبل pipelines عشان الـ AI يستخدمها) =====\r\nconst userEmail = \"toqaj.sh@gmail.com\";\r\nconst subject = \"Welcome!\";\r\nconst messageText = \"Hello from TaskFlow.js 👋\";\r\nconst logFilePath = \"./demo/app.log\";\r\n\r\n// دالة مساعدة (كود عادي) ممكن الـ AI يستخدمها أو يتركها\r\nfunction formatEmail(to, subject, body) {\r\n    return `TO: ${to}\\nSUBJECT: ${subject}\\n\\n${body}`;\r\n}\r\n\r\n// ===== Pipeline 1: Email Notification Flow =====\r\nconst emailFlow = Task(\"Email Notification\")\r\n    .then(\"Create an email content using userEmail, subject, and messageText\")\r\n    .then(\"Print the email content to the console\")\r\n    .then(\"Print a confirmation message that the email is 'sent' (simulation only)\");\r\n\r\n\r\n// ===== Code after pipelines (كود عادي لازم يظل ويشتغل) =====\r\n// هذا جزء واقعي: المستخدم بده يكمل شغله بعد الـ pipelines\r\nconsole.log(\"\\n--- After pipelines: Normal code continues ---\");\r\nconsole.log(\"User email is:\", userEmail);\r\n\r\n// مثال: تجهيز نص بريدي يدوي (عادي) — لازم يضل بدون تغيير\r\nconst preview = formatEmail(userEmail, subject, messageText);\r\nconsole.log(\"\\nEmail Preview (from normal code):\\n\" + preview);\r\n\r\n// ===== Pipeline 2: Logging Flow =====\r\nconst loggingFlow = Task(\"Logging\")\r\n    .then(\"Create a log line that contains current date and userEmail\")\r\n    .then(\"Append the log line to logFilePath using node:fs/promises\")\r\n    .then(\"Print the log file path to the console\");\r\n\r\nconst stats = {\r\n    emailLength: messageText.length,\r\n    timestamp: new Date().toISOString()\r\n};\r\nconsole.log(\"\\nStats:\", stats);\r\n\r\n\r\n\r\n\r\n\r\n\r\n// const image = \"../assets/a.png\";\r\n\r\n// const flow1 = Task(\"Image Flow\")\r\n//   .then(\"Print image path\")\r\n//   .then(\"Print done message\");\r\n\r\n// // const flow2 = Task(\"Math Flow\")\r\n// //   .then(\"Compute 2+3 and print it\")\r\n// //   .then(\"Print finished\");\n\nEnvironment:\n- The project uses ES Modules (\"type\": \"module\").\n- Do NOT use require().\n- Use ES module imports only.\n\nCRITICAL RULES (MUST FOLLOW EXACTLY):\n- You MUST preserve ALL code outside TaskFlow pipelines EXACTLY as-is.\n- Preserve original formatting, spacing, line breaks, and variable declarations.\n- DO NOT rewrite, reformat, shorten, or restructure normal JavaScript code.\n- DO NOT remove variable names, assignments, or object wrappers.\n- DO NOT transform:\n  - \"const x = { ... }\" into \"{ ... }\"\n  -variable assignments into their direct values, even it's object/array literals, like: const status={msg:\"ok\",code:200} don't forget the variable name \"status\"\n  - variable declarations into expressions\n  - object literals into fragments\n- Any code NOT related to Task()/task() pipelines must remain byte-for-byte identical.\n\nPipeline rules:\n- Replace ALL Task()/task() pipeline chains with executable JavaScript code.\n- Remove Task()/task() and .then(...) completely.\n- Generate async functions named taskflow_run_<pipelineName>(ctx).\n- Generate ONE async function runAllTaskflowPipelines().\n- Call runAllTaskflowPipelines() exactly once at the end of the file.\n\nOther rules:\n- Do NOT introduce new top-level variables.\n- Use ONLY variables and functions already defined in the file.\n- Do NOT add unmatched braces or stray '}'.\n- Output valid ES Module JavaScript only.\n- No markdown, no explanations, no backticks.\n- Don't include any code that appears after pipelines.\n\nReturn ONLY the updated the generated JavaScript block.");
console.log("=== DONE ===");
// taskflow:generated:end

// ===== Code after pipelines (كود عادي لازم يظل ويشتغل) =====
// هذا جزء واقعي: المستخدم بده يكمل شغله بعد الـ pipelines
console.log("\n--- After pipelines: Normal code continues ---");
console.log("User email is:", userEmail);

// مثال: تجهيز نص بريدي يدوي (عادي) — لازم يضل بدون تغيير
const preview = formatEmail(userEmail, subject, messageText);
console.log("\nEmail Preview (from normal code):\n" + preview);

// ===== Pipeline 2: Logging Flow =====


const stats = {
    emailLength: messageText.length,
    timestamp: new Date().toISOString()
};
console.log("\nStats:", stats);






// const image = "../assets/a.png";

// const flow1 = Task("Image Flow")
//   .then("Print image path")
//   .then("Print done message");

// // const flow2 = Task("Math Flow")
// //   .then("Compute 2+3 and print it")
// //   .then("Print finished");
