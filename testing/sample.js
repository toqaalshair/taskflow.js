// testing/sample.js

// ===== Inputs (موجودة قبل pipelines عشان الـ AI يستخدمها) =====
const userEmail = "toqaj.sh@gmail.com";
const subject = "Welcome!";
const messageText = "Hello from TaskFlow.js 👋";
const logFilePath = "./demo/app.log";
const user = {
    email: "toqaj.sh@gmail.com",
    status: "premium"
};

// دالة مساعدة (كود عادي) ممكن الـ AI يستخدمها أو يتركها
function formatEmail(to, subject, body) {
    return `TO: ${to}\nSUBJECT: ${subject}\n\n${body}`;
}

// ===== Pipeline 1: Email Notification Flow =====
const emailFlow = Task("Email Notification")
    .then("Create a generic email content")
    // ==> هنا التعديل <==
    .when("user.status === 'premium'", () => {
        Task.then("Append a special offer for premium users");
    })
    .when("user.status !== 'premium'", () => {
        Task.then("Append a standard upgrade message");
    })
    .then("Send the final email");


// ===== Code after pipelines (كود عادي لازم يظل ويشتغل) =====
// هذا جزء واقعي: المستخدم بده يكمل شغله بعد الـ pipelines
console.log("\n--- After pipelines: Normal code continues ---");
console.log("User email is:", userEmail);

// مثال: تجهيز نص بريدي يدوي (عادي) — لازم يضل بدون تغيير
const preview = formatEmail(userEmail, subject, messageText);
console.log("\nEmail Preview (from normal code):\n" + preview);

// ===== Pipeline 2: Logging Flow =====
const loggingFlow = Task("Logging")
    .then("Create a log line that contains current date and userEmail")
    .then({
        description: "Append the log line to logFilePath using node:fs/promises",
        options: {
            retries: 3,
            delay: 1500 // 1.5 ثانية
        }
    })
    .then("Print the log file path to the console");

const stats = {
    emailLength: messageText.length,
    timestamp: new Date().toISOString()
};
console.log("\nStats:", stats);






// const image = "../assets/a.png";

// const flow1 = Task("Image Flow")
//   .then("Print image path")
//   .then("Print done message");

// // const flow2 = Task("Math Flow")
// //   .then("Compute 2+3 and print it")
// //   .then("Print finished");







