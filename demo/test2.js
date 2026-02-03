// ================================
// DSL WITH DATA DEPENDENCY
// ================================

// Pipeline 1: Generate numbers and sum them
const mathFlow = Task("Math")
  .then("Generate numbers from 1 to 5")     // [1,2,3,4,5]
  .then("Sum the numbers")                   // 15
  .then("Store result in variable totalSum") // totalSum = 15
  .then("Print result");

// Pipeline 2: Use the sum from mathFlow
const multiplyFlow = Task("Multiply")
  .then("Use variable totalSum")          // 15
  .then("Multiply totalSum by 2")         // 30
  .then("Store result in variable doubleSum") // doubleSum = 30
  .then("Print result");

// Pipeline 3: Convert text using result from previous pipeline
const textFlow = Task("Text")
  .then("Take variable doubleSum")        // 30
  .then("Convert to string")              // "30"
  .then("Append ' units'")                // "30 units"
  .then("Store result in variable finalText")
  .then("Print result");

// Pipeline 4: Async step depending on finalText
const asyncFlow = Task("Async")
  .then("Take variable finalText")        // "30 units"
  .then("Wait for 1 second")
  .then("Print 'Final value is ' + finalText");
