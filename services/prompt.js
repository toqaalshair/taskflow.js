
// services/prompt.js
// بناخد command و محتوى ملف الكود و بنرجع برومبت مخصص لتحديث كود جافاسكريبت
export function buildPrompt(command, codeFileContent) {
    const cmd = String(command || '').trim();
    const code = String(codeFileContent || '').trim();
    // نفحص وجود الكود و الأمر
    if (!cmd) throw new Error('Command must be a non-empty string.');
    if (!code) throw new Error('Code file content must be a non-empty string.');
    // نرجع البرومبت
    // بهاي المرحلة مش مطلوب نحدد شو الشكل يلي رح يرجع فبلاش كتر شطارة 
    return `You are an AI that updates existing Node.js JavaScript code.

Task:
${cmd}

Existing Code File:
${code}

Requirements:
- Output only the updated JavaScript code.
- Do not include explanations or markdown.
- The code must be self-contained.
- Preserve unrelated parts of the existing code.
- Apply only changes required to satisfy the task.`;
}
// - The code must be self-contained.=> يعني ما يحتاج شغلة من برة يكون كامل منه و فيه كلشي لازم
// - Preserve unrelated parts of the existing code.=> يعني اذا في شغلة مش لها علاقة بالأمر ما تغيرها خليك بس عالأمر

