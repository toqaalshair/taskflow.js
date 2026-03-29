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
import axios from 'axios';
async function run_fullSystemTest() {
    console.log(`Initialize project for ${projectName}`);
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            console.log(`Run tests for ${projectName}`);
            break;
        } catch (error) {
            if (attempt < 2) {
                console.log(`Retrying tests for ${projectName}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.error('Tests failed after retries');
                throw error;
            }
        }
    }
    await Promise.all([(async () => console.log('Build frontend assets'))(), (async () => console.log('Build backend services'))(), (async () => console.log('Optimize images'))()]);
    if (isProduction) {
        console.log(`Deploy project to ${apiUrl}`);
        if (user.role === 'admin') {
            const report = formatReport(projectName);
            console.log(`Generate admin report using formatReport: ${report}`);
            try {
                await axios.post(`${apiUrl}/admin/report`, {
                    report
                });
                console.log(`Send admin report to ${apiUrl}`);
            } catch (error) {
                console.error('Failed to send admin report');
            }
        }
        notifyTeam(`Project ${projectName} has been deployed.`);
    } else {
        console.log('Skip deployment and log warning');
    }
    console.log(projectName);
    console.log(user.email);
    console.log('Finalize pipeline and print summary');
}
run_fullSystemTest().catch(error => console.error('Pipeline failed:', error));
// taskflow:generated:end

