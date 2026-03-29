// src\services\parser\astParser.js
import * as acorn from "acorn"

export function parseCodeToAst(code) {

  return acorn.parse(code, {
    ecmaVersion: "latest",
    sourceType: "module"

  })

}   