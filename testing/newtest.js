
// ===== Inputs =====
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
// ===== Helper Functions =====
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

// ===== Pipeline =====
const a=3,userOnboardingFlow = Task("User Onboarding")

    // الخطوة 1: تنفيذ مهمتين بالتوازي
    .parallel([
        "Create user record in CRM via API call to crmApiUrl",
        "Fetch user's geo-location based on their IP address"
    ])

    // الخطوة 2: مهمة متسلسلة مع إعادة محاولة
    .then({
        description: "Send a 'user_registered' event to analyticsApiUrl",
        options: { retries: 3, delay: 2000 } // <-- إعادة محاولة مع تأخير
    })

    // الخطوة 3: منطق شرطي معقد
    .when("config.enableEmailNotifications === true", (task) => {
        task
            .then("Generate welcome email content using createWelcomeEmail helper")
            .when("newUser.region === 'EU'", (subTask) => { // <-- شرط متداخل
                subTask.then("Add GDPR consent link to the email");
            })
            .then({
                description: "Send the final email to the user",
                options: { retries: 2 } // <-- إعادة محاولة (باستخدام التأخير الافتراضي)
            });
    })

    // الخطوة 4: مهمة أخيرة
    .then("Mark user onboarding as complete in the database");
