import * as acorn from "acorn";

const ast = acorn.parse("const x = 5 + 3;", {
    ecmaVersion: 2020
});

console.log(ast);