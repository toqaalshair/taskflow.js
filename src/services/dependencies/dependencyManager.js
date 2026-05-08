import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { findUp } from "find-up";
import { builtinModules } from "node:module";

const execPromise = promisify(exec);

// مجموعة built-ins من Node
const builtInSet = new Set([
  ...builtinModules,
  ...builtinModules.map(m => m.replace(/^node:/, ""))
]);

function isBuiltInDependency(dep) {
  if (!dep) return false;

  // إذا مكتوب node:fs أو node:fs/promises
  if (dep.startsWith("node:")) return true;

  // إذا مطابق builtins مباشرة
  if (builtInSet.has(dep)) return true;

  // إذا كان subpath مثل fs/promises أو timers/promises
  const root = dep.split("/")[0];
  if (builtInSet.has(root)) return true;

  return false;
}

export function extractDependencies(code) {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const dependencies = new Set();

  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const dep = match[1];

    // تجاهل المحلي والـ absolute والـ built-ins
    if (
      dep.startsWith(".") ||
      dep.startsWith("/") ||
      isBuiltInDependency(dep)
    ) {
      continue;
    }

    dependencies.add(dep);
  }

  return Array.from(dependencies);
}

export async function getMissingDependencies(deps) {
  const packageJsonPath = await findUp("package.json");

  if (!packageJsonPath) return deps;

  const packageJsonContent = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageJsonContent);

  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  return deps.filter(dep => !Object.prototype.hasOwnProperty.call(allDependencies, dep));
}

export async function installDependencies(deps) {
  if (deps.length === 0) {
    console.log("All dependencies already installed");
    return;
  }

  const command = `npm install ${deps.join(" ")}`;
  console.log("Installing missing dependencies:", deps.join(", "));
  await execPromise(command);
}