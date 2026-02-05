// services/openaiPlanner.js
// هذا الملف الوحيد المسؤول عن التفاعل مع OpenAI API لتوليد تحديثات الكود بناءً على المطالبات المقدمة.
try {
  await import("dotenv/config");
} catch {
    Result.failed('Failed to load environment variables. Make sure .env file is present and dotenv package is installed.');
}




import OpenAI from 'openai';
import { Result } from '../core/result.js';


const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';


let client = null;
if (apiKey) {
    client = new OpenAI({ apiKey });
}

function buildMockCode(prompt) {

    const safePrompt = JSON.stringify(String(prompt || ""));
    return `
console.log("=== TASKFLOW MOCK MODE ===");
console.log("OpenAI unavailable, so mock code was used.");
console.log("Prompt received:");
console.log(${safePrompt});
console.log("=== DONE ===");
`;
}


export async function generateUpdatedCode(prompt) {
    try {
        const p = String(prompt || '').trim();
        if (!p) return Result.failed('Prompt must be a non-empty string.');
        if (!client) {
            const mockCode = buildMockCode(p);
            return Result.success({ generatedCode: mockCode, usedMock: true });
        }


        // completions => انشاء ردود من النموذج بناءً على البرومبت المقدم    
        /* * .completions
            •	طلب واحد
            •	جواب واحد
            •	مناسب جدًا للتوليد البرمجي
    */
        const completion = await client.chat.completions.create({
            model,
            // Temperature =>  بيتحكم بمدى عشوائية الردود، قيمة منخفضة تعني ردود أكثر تحفظًا، قيمة عالية تعني ردود أكثر إبداعًا.
            temperature: 0.2,
            // messages => المحادثة بين المستخدم الشات بنعطيه مين رح يحكي و شو بيحكي
            messages: [
                { role: 'developer', content: 'Return only executable JavaScript code.' },
                { role: 'user', content: p }
            ]
        });

        const code = completion?.choices?.[0]?.message?.content?.trim() || '';
        if (code) {
            return Result.success({ generatedCode: code });
        } else {
            throw new Error('No code generated.');
        }
    } catch (error) {
        console.error("Error generating code from OpenAI:", error?.message || error);

        const mockCode = buildMockCode(prompt);
        return Result.success({
            generatedCode: mockCode,
            usedMock: true,
            mockReason: error?.message || "OpenAI error"
        });
    }
}
