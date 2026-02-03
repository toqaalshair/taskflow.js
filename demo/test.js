const mathFlow = Task("Math")
  .then("Generate numbers from 1 to 5")
  .then("Sum the numbers")
  .then("Print result");
  
const fileFlow =  Task("File")
  .then("Read file sample2.txt")
  .then("Count lines")
  .then("Print result");

const dateFlow = Task("Date")
  .then("Get current date")
  .then("Subtract one day")
  .then("Print difference");

const flow = Task("Text")
  .then("Convert 'hello' to uppercase")
  .then("Print result");



  