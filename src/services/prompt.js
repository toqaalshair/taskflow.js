
//  
// بناخد command و محتوى ملف الكود و بنرجع برومبت مخصص لتحديث كود جافاسكريبت
export function buildPrompt(command, codeFileContent) {
  const cmd = String(command || '').trim();
  const code = String(codeFileContent || '').trim();
  // نفحص وجود الكود و الأمر
  if (!cmd) throw new Error('Command must be a non-empty string.');
  if (!code) throw new Error('Code file content must be a non-empty string.');
  // نرجع البرومبت
  return `
You are an AI that updates an existing Node.js JavaScript file.

Task:
${cmd}

Existing Code File:
${code}

Environment:
- The project uses ES Modules ("type": "module").
- Do NOT use require().
- Use ES module imports only.

CRITICAL RULES (MUST FOLLOW EXACTLY):
- You MUST preserve ALL code outside TaskFlow pipelines EXACTLY as-is.
- Preserve original formatting, spacing, line breaks, and variable declarations.
- DO NOT rewrite, reformat, shorten, or restructure normal JavaScript code.
- DO NOT remove variable names, assignments, or object wrappers.
- DO NOT transform:
  - "const x = { ... }" into "{ ... }"
  -variable assignments into their direct values, even it's object/array literals, like: const status={msg:"ok",code:200} don't forget the variable name "status"
  - variable declarations into expressions
  - object literals into fragments
- Any code NOT related to Task()/task() pipelines must remain byte-for-byte identical.

Pipeline rules:
- Replace ALL Task()/task() pipeline chains with executable JavaScript code.
- Remove Task()/task() and .then(...) completely.
- Generate async functions named taskflow_run_<pipelineName>(ctx).
- Generate ONE async function runAllTaskflowPipelines().
- Call runAllTaskflowPipelines() exactly once at the end of the file.

Other rules:
- Do NOT introduce new top-level variables.
- Use ONLY variables and functions already defined in the file.
- Do NOT add unmatched braces or stray '}'.
- Output valid ES Module JavaScript only.
- No markdown, no explanations, no backticks.
- Don't include any code that appears after pipelines.

Return ONLY the updated the generated JavaScript block.
`;
  // - The code must be self-contained.=> يعني ما يحتاج شغلة من برة يكون كامل منه و فيه كلشي لازم
  // - Preserve unrelated parts of the existing code.=> يعني اذا في شغلة مش لها علاقة بالأمر ما تغيرها خليك بس عالأمر

}