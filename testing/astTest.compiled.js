const projectName = "TaskFlow";
const apiUrl = "https://example.com/deploy";
const isProduction = true;
function notifyTeam(message) {
    console.log("Notify:", message);
}
const a = 1;

// taskflow:generated:start
import axios from "axios";
const delay = ms => new Promise(res => setTimeout(res, ms));
async function installDependencies(projectName) {
    console.log(`Installing dependencies for ${projectName}`);
}
async function runTests(projectName, retries = 2, delayTime = 1000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`Running tests for ${projectName}`);
            break;
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            await delay(delayTime * attempt);
        }
    }
}
async function bundleAssets() {
    console.log("Bundling assets");
}
async function optimizeImages() {
    console.log("Optimizing images");
}
async function deployToApiUrl(apiUrl) {
    await axios.post(apiUrl, {});
    console.log(`Deployed to ${apiUrl}`);
}
async function run_BuildPipeline() {
    try {
        console.log("▶ Starting Build Pipeline");
        await installDependencies(projectName);
        await runTests(projectName);
        await Promise.all([(async () => {
            await bundleAssets();
        })(), (async () => {
            await optimizeImages();
        })()]);
        if (isProduction) {
            await deployToApiUrl(apiUrl);
            notifyTeam(`Project ${projectName} has been deployed`);
        }
        console.log(a);
        console.log("✔ Build Pipeline completed");
    } catch (error) {
        console.log("✖ Build Pipeline failed:", error.message);
    }
}
async function runAllPipelines() {
    await run_BuildPipeline();
}
runAllPipelines();
// taskflow:generated:end

