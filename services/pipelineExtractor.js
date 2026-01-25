// services/pipelineExtractor.js
import { Result } from '../core/result.js';
import { Task } from '../core/task.js';

export function extractPipelineFromCode(codeText) {
  try {
    const code = String(codeText || '');
    if (!code.trim()) return Result.failed('Code file is empty.');
    // بيدور على عنوان ال Pipeline و الخطوات
    // العنوان بيكون في task("title")
    const taskMatch = code.match(/(?:task|Task)\s*\(\s*["']([^"']+)["']\s*\)/);
    const title = taskMatch ? taskMatch[1].trim() : null;
    // الخطوات بتكون في then("step description")
    const stepMatches = [...code.matchAll(/\.then\s*\(\s*["']([\s\S]*?)["']\s*\)/g)];
    const steps = stepMatches.map(m => String(m[1] || '').trim()).filter(Boolean);
    // لو مش مكتوب Pipeline ما رح نتعامل معه
    if (steps.length === 0) {
      return Result.failed('No pipeline steps found. Expected .then("...") chain.');
    }
    //  بنحول الخطوات  Task objects، و بنسمي كل تاسك و نعطيها رقم 
    const tasks = steps.map((s, i) => new Task(s, i + 1));

    return Result.success({ title, tasks });
  } catch (error) {
    return Result.failed(error.message);
  }
}
