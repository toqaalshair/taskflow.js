import { Task } from "taskflow.js";

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

const pipeline = Task("Full System Test")
  .then("Initialize project for projectName")
  .then({
    description: "Run tests for projectName",
    options: { retries: 2, delay: 1000 }
  })
  .parallel([
    "Build frontend assets",
    "Build backend services",
    "Optimize images"
  ])
  .when(isProduction, (flow) => {
    flow.then("Deploy project to apiUrl");

    flow.when(user.role === 'admin', (adminFlow) => {
      adminFlow.then("Generate admin report using formatReport");
      adminFlow.then({
        description: "Send admin report to apiUrl",
        options: { retries: 1 }
      });
    })

    flow.then("Notify team about projectName using notifyTeam");
  })
  .when(isProduction === false, (flow) => {
    flow.then("Skip deployment and log warning");
  })
  .then("print projectName")
  .then("print user.email")
  .then("Finalize pipeline and print summary");