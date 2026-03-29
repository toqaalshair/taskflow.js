const newUser = {
    id: "user-123",
    email: "new.user@example.com",
    plan: "free",
    region: "EU"
};
const config = {
    enableEmailNotifications: true,
    defaultLanguage: "en"
};
const analyticsApiUrl = "https://jsonplaceholder.typicode.com/posts";
const crmApiUrl = "https://jsonplaceholder.typicode.com/posts";
function createWelcomeEmail(user) {
    let body = `Welcome, ${user.email}!\n`;
    if (user.plan === 'premium') {
        body += "Thank you for being a premium member.";
    } else {
        body += "Consider upgrading to our premium plan for more features.";
    }
    return {
        to: user.email,
        subject: "Welcome to TaskFlow!",
        body: body
    };
}

// taskflow:generated:start
import axios from "axios";
const delay = ms => new Promise(res => setTimeout(res, ms));
async function run_userOnboarding() {
    console.log("▶ Starting User Onboarding");
    try {
        await Promise.all([console.log("Creating user record in CRM via API call to crmApiUrl..."), console.log("Fetching user's geo-location based on their IP address...")]);
        let retries = 3;
        let delayTime = 2000;
        let attempt = 0;
        while (attempt <= retries) {
            try {
                console.log(`Sending 'user_registered' event to analyticsApiUrl... Attempt: ${attempt + 1}`);
                break;
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                } else {
                    await delay(delayTime * (attempt + 1));
                    attempt++;
                }
            }
        }
        if (config.enableEmailNotifications === true) {
            console.log("Sending the final email to the user...");
            const email = createWelcomeEmail(newUser);
        }
        console.log("Marking user onboarding as complete in the database...");
        console.log("✔ User Onboarding completed");
    } catch (error) {
        console.log("✖ User Onboarding failed:", error.message);
    }
}
async function runAllPipelines() {
    await run_userOnboarding();
}
runAllPipelines();
// taskflow:generated:end

