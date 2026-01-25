// taskflow:generated:start
(async () => {
  const currentDate = new Date();
  const previousDate = new Date(currentDate);
  previousDate.setDate(currentDate.getDate() - 1);
  const difference = currentDate - previousDate;
  console.log(`Difference in milliseconds: ${difference}`);
})();
// taskflow:generated:end




// const anything = Task("Number Processing Pipeline")
//     .then("Generate an array of numbers from 1 to 10")
//     .then("Filter out only even numbers")
//     .then("Calculate the sum of the even numbers")
//     .then("Print the sum to the console");





// const flow = Task("Text Transformation Pipeline")
//   .then("Extract the text 'Hello, World!'")
//   .then("Convert the text to uppercase")
//   .then("Print the result to the console");



// const flow = Task("JSON Data Parsing")
//   .then("Load the JSON data from 'users.json'")
//   .then("Extract the names and ages of users")
//   .then("Print the names and ages in a formatted list");

// const file = './sample.txt'
// const flow = Task("File Processing")
//     .then("Read the file contents")
//     .then("Count number of lines in the file")
//     .then("Print the result to the console");
