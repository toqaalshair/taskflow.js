// services/pipelineRunner.js
import { spawn } from 'node:child_process';
import path from 'node:path';
import { Result } from '../core/result.js';

export async function runCompiledFile(compiledPath) {
  try {
    const p = String(compiledPath || '').trim();
    if (!p) return Result.failed('Compiled file path must be a non-empty string.');

    const abs = path.resolve(p);

    return await new Promise((resolve) => {
      // spawn عبارة عن child_process من خلاله بنشغل ملف تاني كانه moule مستقل
      // سواء كان جافا سكريبت او بايثون او غيره
      // process.execPath قيمته بتكون مسار تنفيذ نود الحالي
      // [abs] هو المصفوفة اللي بنمررها كـ arguments للسكريبت
      /* stdio  بنحدد كيف نتعامل مع المدخلات و المخرجات والاخطاءstdin,stdout,stderr
      'ignore' معناها ما في مدخلات من المستخدم
      'pipe' يعني بنسحب المخرجات و نقدر نتعامل معها، مثلا بدنا نلتقط console.log
      'pipe' نفس الشيء بس للأخطاء، زي console.error
          طريقة العمل:
          بنسحب المخرجات من stdout و stderr
          بنجمعهم في متغيرات
          لما السكريبت يخلص بنشيك على كود الخروج
          لو كان 0 بنرجع نجاح مع المخرجات
          لو غير هيك بنرجع فشل مع رسالة خطأ
*/

      const child = spawn(process.execPath, [abs], { stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';
      // .on عشان نلتقط المخرجات و الأخطاء
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => {
        (stderr += d.toString())
      }
      );

      child.on('error', (err) => {
        resolve(Result.failed(`Failed to start node process: ${err.message}`));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(Result.success({ exitCode: code, stdout, stderr }));
        } else {
          resolve(Result.failed(`Process exited with code ${code}\n${stderr.trim()}.`));
        }
      });
    });
  } catch (error) {
    return Result.failed(error.message);
  }
}
