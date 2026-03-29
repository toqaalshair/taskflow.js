const projectName = "TaskFlow";
const apiUrl = "https://example.com/deploy";
const isProduction = true;

function notifyTeam(message) {
    console.log("Notify:", message);
}

const a = 1,
    buildPipeline = Task("Build Pipeline").then("Install dependencies for projectName")
        .then({
            description: "Run tests for projectName",
            options: {
                retries: 2,
                delay: 1000
            }
        })
        .parallel([
            "Bundle assets",
            "Optimize images"
        ])
        .when(isProduction, (t) => {
            t.then("Deploy to apiUrl");
            t.then("Notify team about projectName");
        })
        .then("print a")
        .then("Finish pipeline");