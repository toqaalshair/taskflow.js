const userEmail = "toqaj.sh@gmail.com";
const subject = "Welcome!";
const messageText = "Hello from TaskFlow.js 👋";
const logFilePath = "./demo/app.log";
const user = {
    email: "toqaj.sh@gmail.com",
    status: "premium"
};
function formatEmail(to, subject, body) {
    return `TO: ${to}\nSUBJECT: ${subject}\n\n${body}`;
}

// taskflow:generated:start
import {appendFile} from "node:fs/promises";
const delay = ms => new Promise(res => setTimeout(res, ms));
async function run_emailNotification() {
    try {
        console.log("▶ Starting Email Notification");
        let emailContent = "Dear User,";
        if (user.status === 'premium') {
            emailContent += "\n\nAs a premium user, you are eligible for our special offers.";
        }
        if (user.status !== 'premium') {
            emailContent += "\n\nUpgrade to premium to enjoy exclusive benefits.";
        }
        const finalEmail = formatEmail(userEmail, subject, emailContent);
        console.log(finalEmail);
        console.log("✔ Email Notification completed");
    } catch (error) {
        console.log("✖ Email Notification failed:", error.message);
    }
}
async function run_logging() {
    try {
        console.log("▶ Starting Logging");
        const logLine = `${new Date().toISOString()} - ${userEmail}`;
        let attempts = 0;
        let success = false;
        while (!success && attempts < 4) {
            try {
                await appendFile(logFilePath, logLine + '\n');
                success = true;
            } catch (error) {
                attempts++;
                if (attempts < 4) {
                    await delay(1500 * attempts);
                } else {
                    throw error;
                }
            }
        }
        console.log(logFilePath);
        console.log("✔ Logging completed");
    } catch (error) {
        console.log("✖ Logging failed:", error.message);
    }
}
async function runAllPipelines() {
    await run_emailNotification();
    await run_logging();
}
runAllPipelines();
// taskflow:generated:end

console.log("\n--- After pipelines: Normal code continues ---");
console.log("User email is:", userEmail);
const preview = formatEmail(userEmail, subject, messageText);
console.log("\nEmail Preview (from normal code):\n" + preview);
const stats = {
    emailLength: messageText.length,
    timestamp: new Date().toISOString()
};
console.log("\nStats:", stats);