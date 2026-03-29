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
const a = 3;

// taskflow:generated:start
import axios from "axios";
const delay = ms => new Promise(res => setTimeout(res, ms));
async function createUserRecord() {
    for (let attempt = 0; attempt <= 3; attempt++) {
        try {
            await axios.post(crmApiUrl, newUser);
            break;
        } catch (error) {
            if (attempt === 3) throw error;
            await delay(1000 * attempt);
        }
    }
}
async function fetchUserGeoLocation() {
    console.log("Fetching user's geo-location based on their IP address");
}
async function sendUserRegisteredEvent() {
    for (let attempt = 0; attempt <= 3; attempt++) {
        try {
            await axios.post(analyticsApiUrl, {
                event: 'user_registered',
                data: a
            });
            break;
        } catch (error) {
            if (attempt === 3) throw error;
            await delay(2000 * attempt);
        }
    }
}
async function generateWelcomeEmail() {
    return createWelcomeEmail(newUser);
}
async function addGdprConsentLink(email) {
    email.body += "\n\nPlease click here to give your GDPR consent.";
    return email;
}
async function sendEmail(email) {
    for (let attempt = 0; attempt <= 2; attempt++) {
        try {
            console.log(`Sending email to ${email.to}`);
            break;
        } catch (error) {
            if (attempt === 2) throw error;
            await delay(1000 * attempt);
        }
    }
}
async function markUserOnboardingComplete() {
    console.log("Marking user onboarding as complete in the database");
}
async function run_userOnboarding() {
    try {
        console.log("▶ Starting User Onboarding");
        await Promise.all([createUserRecord(), fetchUserGeoLocation()]);
        await sendUserRegisteredEvent();
        if (config.enableEmailNotifications === true) {
            let email = await generateWelcomeEmail();
            if (newUser.region === 'EU') {
                email = await addGdprConsentLink(email);
            }
            await sendEmail(email);
        }
        await markUserOnboardingComplete();
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

