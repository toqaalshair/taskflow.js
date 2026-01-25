
// services/prompt.js
// بناخد command و محتوى ملف الكود و بنرجع برومبت مخصص لتحديث كود جافاسكريبت
export function buildPrompt(command, codeFileContent) {
  const cmd = String(command || '').trim();
  const code = String(codeFileContent || '').trim();
  // نفحص وجود الكود و الأمر
  if (!cmd) throw new Error('Command must be a non-empty string.');
  if (!code) throw new Error('Code file content must be a non-empty string.');
  // نرجع البرومبت
  return `You are an AI that updates existing Node.js JavaScript code.

Task:
${cmd}

Existing Code File:
${code}

Environment:
- The project uses ES Modules ("type": "module").
- Do NOT use require().

Requirements:
- Output only the updated JavaScript code.
- Do not include explanations or markdown.
- Preserve unrelated parts of the existing code.
- Apply only changes required to satisfy the task.
- Do NOT create or call flow() or run().
- Do NOT output any unmatched braces or trailing };.
- The generated executable logic MUST be wrapped as a single IIFE exactly like:
  (async () => { /* your code */ })();
- Do NOT add any import statements inside the generated block.
- If file access is needed, use dynamic import inside the IIFE:
  const { readFile } = await import('node:fs/promises');
`;
}
// - The code must be self-contained.=> يعني ما يحتاج شغلة من برة يكون كامل منه و فيه كلشي لازم
// - Preserve unrelated parts of the existing code.=> يعني اذا في شغلة مش لها علاقة بالأمر ما تغيرها خليك بس عالأمر

