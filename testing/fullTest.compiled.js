import {Task} from "taskflow.js";
const projectName = "TaskFlow";
const apiUrl = "https://jsonplaceholder.typicode.com/posts";
const isProduction = true;
const user = {
    name: "Ahmad",
    email: "ahmad@test.com",
    role: "admin"
};
function notifyTeam(message) {
    console.log("Notify:", message);
}
function formatReport(name) {
    return `Report generated for ${name}`;
}

// taskflow:generated:start
import axios from "axios";
const delay = ms => new Promise(res => setTimeout(res, ms));
async function initializeProject() {
    console.log(`Initializing project for ${projectName}`);
}
async function runTests(options) {
    for (let attempt = 0; attempt <= options.retries; attempt++) {
        try {
            console.log(`Running tests for ${projectName}`);
            break;
        } catch (error) {
            if (attempt === options.retries) {
                throw error;
            }
            await delay(options.delay * attempt);
        }
    }
}
async function buildFrontendAssets() {
    console.log("Building frontend assets");
}
async function buildBackendServices() {
    console.log("Building backend services");
}
async function optimizeImages() {
    console.log("Optimizing images");
}
async function deployProject() {
    console.log(`Deploying project to ${apiUrl}`);
}
async function generateAdminReport() {
    const report = formatReport('admin');
    console.log(report);
}
async function sendAdminReport(options) {
    for (let attempt = 0; attempt <= options.retries; attempt++) {
        try {
            await axios.post(apiUrl, {
                report: formatReport('admin')
            });
            break;
        } catch (error) {
            if (attempt === options.retries) {
                throw error;
            }
            await delay(options.delay * attempt);
        }
    }
}
async function skipDeployment() {
    console.log("Skipping deployment");
}
async function printProjectName() {
    console.log(projectName);
}
async function printUserEmail() {
    console.log(user.email);
}
async function finalizePipeline() {
    console.log("Pipeline finalized");
}
async function run_fullSystemTest() {
    try {
        console.log("▶ Starting Full System Test");
        await initializeProject();
        await runTests({
            retries: 2,
            delay: 1000
        });
        await Promise.all([buildFrontendAssets(), buildBackendServices(), optimizeImages()]);
        if (isProduction) {
            await deployProject();
            if (user.role === 'admin') {
                await generateAdminReport();
                await sendAdminReport({
                    retries: 1
                });
            }
            await notifyTeam();
        } else {
            await skipDeployment();
        }
        await printProjectName();
        await printUserEmail();
        await finalizePipeline();
        console.log("✔ Full System Test completed");
    } catch (error) {
        console.log("✖ Full System Test failed:", error.message);
    }
}
async function runAllPipelines() {
    await run_fullSystemTest();
}
runAllPipelines();
// taskflow:generated:end

