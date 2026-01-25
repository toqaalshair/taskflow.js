// services/openaiPlanner.js
// هذا الملف الوحيد المسؤول عن التفاعل مع OpenAI API لتوليد تحديثات الكود بناءً على المطالبات المقدمة.
import OpenAI from 'openai';
import { Result } from '../core/result.js';


const apiKey = process.env.OPENAI_API_KEY || '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';
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Add it to your .env file.');
}
// انشاء connection مع OpenAI API
const client = new OpenAI({ apiKey });

export async function generateUpdatedCode(prompt) {
    try {
        const p = String(prompt || '').trim();
        if (!p) throw new Error('Prompt must be a non-empty string.');


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
        // هنا هندلة الأخطاء اللي ممكن تصير خلال التفاعل مع OpenAI API  
        console.error("Error generating code from OpenAI:", error.message);
        return Result.failed(error.message);
    }
}
