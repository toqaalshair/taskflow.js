// services/compiler/astMerger.js
import { generate as astring } from "astring";
import * as acorn from "acorn";

export function mergeGeneratedCode(originalCode, generatedBlock) {
  const originalAst = acorn.parse(originalCode, {
    ecmaVersion: "latest",
    sourceType: "module"
  });

  const generatedAst = acorn.parse(generatedBlock, {
    ecmaVersion: "latest",
    sourceType: "module"
  });

  const nodesBefore = [];
  const nodesAfter = [];
  let firstPipelineFound = false;

  function isPipeline(declaration) {
    if (!declaration?.init) return false;
    let current = declaration.init;
    while (current && current.type === "CallExpression" && current.callee.type === "MemberExpression") {
      current = current.callee.object;
    }
    return current && current.type === "CallExpression" && current.callee.name === "Task";
  }

  for (const node of originalAst.body) {
    if (node.type === "VariableDeclaration") {
      const normalVars = node.declarations.filter(d => !isPipeline(d));
      const pipelineVars = node.declarations.filter(d => isPipeline(d));

      if (pipelineVars.length > 0) {
        // إذا وجدنا بايبلاين، نضع المتغيرات العادية التي معه في nodesBefore قبل تفعيل العلم
        if (normalVars.length > 0) {
          nodesBefore.push({ ...node, declarations: normalVars });
        }
        firstPipelineFound = true;
      } else {
        if (!firstPipelineFound) nodesBefore.push(node);
        else nodesAfter.push(node);
      }
    } else {
      if (!firstPipelineFound) nodesBefore.push(node);
      else nodesAfter.push(node);
    }
  }

  // تجميع كل الأسماء الموجودة مسبقاً (متغيرات ودوال)
  const existingNames = new Set();
  nodesBefore.forEach(node => {
    if (node.type === "VariableDeclaration") {
      node.declarations.forEach(d => existingNames.add(d.id.name));
    } else if (node.type === "FunctionDeclaration") {
      existingNames.add(node.id.name);
    }
  });

  // تصفية الكود المولد من أي شيء موجود مسبقاً
  const filteredGeneratedBody = generatedAst.body.filter(node => {
    if (node.type === "VariableDeclaration") {
      node.declarations = node.declarations.filter(d => !existingNames.has(d.id.name));
      return node.declarations.length > 0;
    }
    if (node.type === "FunctionDeclaration") {
      // إذا كانت الدالة موجودة مسبقاً، نحذفها من الكود المولد
      return !existingNames.has(node.id.name);
    }
    return true;
  });

  const options = { indent: "    ", lineEnd: "\n" };
  const beforeCode = astring({ type: "Program", body: nodesBefore }, options);
  const generatedCodeFormatted = astring({ type: "Program", body: filteredGeneratedBody }, options);
  const afterCode = astring({ type: "Program", body: nodesAfter }, options);

  return [
    beforeCode.trim(),
    "\n// taskflow:generated:start",
    generatedCodeFormatted.trim(),
    "// taskflow:generated:end\n",
    afterCode.trim()
  ].join("\n");
}
