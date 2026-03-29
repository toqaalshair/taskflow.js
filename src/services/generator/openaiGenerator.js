import OpenAI from "openai";
import { Result } from "../../core/result.js";
import { buildPromptFromIR } from "./promptBuilder.js";

try {
    await import("dotenv/config");
} catch (e) {
    console.warn(
        "dotenv/config not found, proceeding without it. Make sure environment variables are set."
    );
}

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client = null;

if (apiKey) {
    client = new OpenAI({ apiKey });
} else {
    console.warn("OPENAI_API_KEY not found. The application will run in MOCK MODE.");
}

function sanitizeModelOutput(raw) {
    let text = String(raw || "").trim();

    text = text.replace(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/i, "$1").trim();

    const lines = text.split("\n");

    const blockedStarts = [
        "Please note",
        "Note:",
        "Explanation:",
        "Here is",
        "This code",
        "The tasks are not implemented",
        "I could not",
        "I cannot",
        "Sorry"
    ];

    const cleaned = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (blockedStarts.some(prefix => trimmed.startsWith(prefix))) {
            break;
        }

        cleaned.push(line);
    }

    return cleaned.join("\n").trim();
}

function toSafeFunctionName(name) {
    return String(name || "pipeline")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .map((part, index) => {
            const lower = part.toLowerCase();
            if (index === 0) return lower;
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("");
}

function generateMockTaskCode(node, indent = 2) {
    const pad = "    ".repeat(indent);

    if (!node) {
        return `${pad}console.log("MOCK: Unknown task");`;
    }

    if (node.type === "task") {
        const description = JSON.stringify(node.description || "Unnamed task");

        // في الـ mock: لا نعيد التنفيذ فعلياً
        if (node.options?.retries) {
            const retries = Number(node.options.retries) || 0;
            const baseDelay = Number(node.options.delay) || 1000;

            return `
${pad}console.log("MOCK TASK:", ${description});
${pad}console.log("MOCK RETRY POLICY: would retry", ${retries}, "times with base delay", ${baseDelay}, "ms if needed");
`.trim();
        }

        return `${pad}console.log("MOCK TASK:", ${description});`;
    }

    if (node.type === "parallel") {
        const inner = (node.tasks || [])
            .map(child => {
                const childCode = generateMockTaskCode(child, indent + 2);
                return `${pad}    (async () => {\n${childCode}\n${pad}    })()`;
            })
            .join(",\n");

        return `
${pad}await Promise.all([
${inner}
${pad}]);
`.trim();
    }

    if (node.type === "conditional") {
        const branches = node.branches || [];

        return branches
            .map((branch, index) => {
                const keyword = index === 0 ? "if" : "else if";
                const branchTasks = (branch.tasks || [])
                    .map(child => generateMockTaskCode(child, indent + 1))
                    .join("\n");

                return `
${pad}${keyword} (${branch.condition || "false"}) {
${branchTasks}
${pad}}`.trim();
            })
            .join("\n");
    }

    return `${pad}console.log("MOCK: Unsupported node type");`;
}

function buildMockCodeFromIR(ir) {
    const pipelineFunctions = (ir?.pipelines || [])
        .map(pipeline => {
            const safeName = toSafeFunctionName(pipeline.name) || "pipeline";
            const functionName = `run_${safeName}`;

            const body = (pipeline.tasks || [])
                .map(task => generateMockTaskCode(task, 2))
                .join("\n");

            return `
async function ${functionName}() {
    try {
        console.log("▶ Starting ${pipeline.name}");
${body}
        console.log("✔ ${pipeline.name} completed");
    } catch (error) {
        console.log("✖ ${pipeline.name} failed:", error.message);
    }
}
`.trim();
        })
        .join("\n\n");

    const runAllCalls = (ir?.pipelines || [])
        .map(pipeline => {
            const safeName = toSafeFunctionName(pipeline.name) || "pipeline";
            return `    await run_${safeName}();`;
        })
        .join("\n");

    return `
${pipelineFunctions}

async function runAllPipelines() {
${runAllCalls}
}

await runAllPipelines();
`.trim();
}

function buildFallbackMockCode(reason = "Unknown reason") {
    const safeReason = JSON.stringify(String(reason || "Unknown reason"));

    return `
console.log("▶ Starting Mock Pipeline");
console.log("MOCK fallback reason:", ${safeReason});
console.log("✔ Mock Pipeline completed");

async function runAllPipelines() {
    console.log("No valid IR pipelines were available.");
}

await runAllPipelines();
`.trim();
}

export async function generateCodeFromIR(ir) {
    try {
        if (!ir || !ir.pipelines || ir.pipelines.length === 0) {
            return Result.failed(
                "IR object must be valid and contain at least one pipeline."
            );
        }

        const prompt = buildPromptFromIR(ir);

        if (!client) {
            const mockCode = buildMockCodeFromIR(ir);
            return Result.success({
                generatedCode: mockCode,
                usedMock: true,
                mockReason: "OpenAI client not configured."
            });
        }

        const completion = await client.chat.completions.create({
            model,
            temperature: 0.1,
            messages: [
                {
                    role: "system",
                    content: `
You generate executable Node.js ES module code from structured workflow IR.

Rules:
- Return ONLY valid JavaScript
- No markdown
- No backticks
- No explanations
- No notes
- No text before or after the code
- Do not leave tasks as comments
- If task details are unclear, still generate valid executable fallback logic
`
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const rawCode = completion?.choices?.[0]?.message?.content?.trim() || "";
        const generatedCode = sanitizeModelOutput(rawCode);

        if (!generatedCode) {
            throw new Error("OpenAI returned an empty or unusable response.");
        }

        return Result.success({
            generatedCode,
            usedMock: false,
            mockReason: null
        });
    } catch (error) {
        console.error("Error generating code from OpenAI:", error?.message || error);

        const mockCode =
            ir && ir.pipelines && ir.pipelines.length > 0
                ? buildMockCodeFromIR(ir)
                : buildFallbackMockCode(error?.message || "Invalid IR provided");

        return Result.success({
            generatedCode: mockCode,
            usedMock: true,
            mockReason: error?.message || "An unknown OpenAI error occurred."
        });
    }
}

export async function generateUpdatedCode(prompt) {
    try {
        const p = String(prompt || "").trim();

        if (!p) {
            return Result.failed("Prompt must be a non-empty string.");
        }

        if (!client) {
            const mockCode = buildFallbackMockCode("OpenAI client not configured.");
            return Result.success({
                generatedCode: mockCode,
                usedMock: true,
                mockReason: "OpenAI client not configured."
            });
        }

        const completion = await client.chat.completions.create({
            model,
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
You update existing Node.js ES module code.

Rules:
- Return ONLY executable JavaScript
- No markdown
- No backticks
- No explanations
- No notes
- No text before or after the code
`
                },
                {
                    role: "user",
                    content: p
                }
            ]
        });

        const rawCode = completion?.choices?.[0]?.message?.content?.trim() || "";
        const generatedCode = sanitizeModelOutput(rawCode);

        if (!generatedCode) {
            throw new Error("No usable code generated.");
        }

        return Result.success({
            generatedCode,
            usedMock: false,
            mockReason: null
        });
    } catch (error) {
        console.error("Error generating code from OpenAI:", error?.message || error);

        const mockCode = buildFallbackMockCode(error?.message || "OpenAI error");

        return Result.success({
            generatedCode: mockCode,
            usedMock: true,
            mockReason: error?.message || "OpenAI error"
        });
    }
}