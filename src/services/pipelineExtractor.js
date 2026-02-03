// services/pipelineExtractor.js
import { Result } from '../core/result.js';
import { Task } from '../core/task.js';

export function extractPipelinesFromCode(codeText) {
  try {
    const code = String(codeText || '');
    if (!code.trim()) return Result.failed('Code file is empty.');

    // يلقط كل pipeline بالشكل:
    // const flow1 = Task("Title").then("Step 1").then("Step 2");
    // ويطلع: name, title, thenChain
    const pipelineRegex =
      /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:task|Task)\s*\(\s*["']([^"']+)["']\s*\)\s*((?:\.\s*then\s*\(\s*["'][\s\S]*?["']\s*\)\s*)+);/g;

    const pipelines = [];
    let m;

    while ((m = pipelineRegex.exec(code)) !== null) {
      const name = String(m[1] || '').trim();
      const title = String(m[2] || '').trim() || null;
      const thenChain = String(m[3] || '');

      const stepMatches = [...thenChain.matchAll(/\.then\s*\(\s*["']([\s\S]*?)["']\s*\)/g)];
      const steps = stepMatches.map(x => String(x[1] || '').trim()).filter(Boolean);

      if (steps.length === 0) continue;

      const tasks = steps.map((s, i) => new Task(s, i + 1));
      pipelines.push({ name, title, tasks });
    }

    if (pipelines.length === 0) {
      return Result.failed('No pipelines found. Expected: const x = Task("...").then("...");');
    }

    return Result.success({ pipelines });
  } catch (error) {
    return Result.failed(error.message);
  }
}