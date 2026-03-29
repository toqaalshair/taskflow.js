export function sanitizeGeneratedBlock(raw) {

    return String(raw || "")
        .trim()
        .replace(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/i, '$1')
        .trim();
}