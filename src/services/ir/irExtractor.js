import { parseCodeToAst } from "../parser/astParser.js";

function getRootCalleeName(callExpression) {
    let current = callExpression;

    while (current?.callee?.type === "MemberExpression") {

        current = current.callee.object;
    }

    return current?.callee?.name || null;
}

function isTaskPipelineInit(initNode) {
    return (
        initNode &&
        initNode.type === "CallExpression" &&
        getRootCalleeName(initNode) === "Task"
    );
}

function extractTaskFromThenArgument(argument) {
    let description = "";
    let options = {};

    if (!argument) {
        return { description, options };
    }

    if (argument.type === "Literal") {
        description = String(argument.value ?? "");
    } else if (argument.type === "ObjectExpression") {
        for (const prop of argument.properties || []) {
            const keyName =
                prop.key?.name ??
                (prop.key?.type === "Literal" ? prop.key.value : undefined);

            if (keyName === "description") {
                if (prop.value?.type === "Literal") {
                    description = String(prop.value.value ?? "");
                }
            }

            if (keyName === "options" && prop.value?.type === "ObjectExpression") {
                for (const optProp of prop.value.properties || []) {
                    const optKey =
                        optProp.key?.name ??
                        (optProp.key?.type === "Literal" ? optProp.key.value : undefined);

                    if (optProp.value?.type === "Literal") {
                        options[optKey] = optProp.value.value;
                    }
                }
            }
        }
    }

    return { description, options };
}

function findUsedVariablesInText(text, knownNames) {
    const str = String(text || "");
    if (!str.trim()) return [];

    return knownNames.filter(name => {
        const safeName = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${safeName}\\b`).test(str);
    });
}

function extractTaskChainFromExpression(expression, code, knownNames) {
    if (!expression || expression.type !== "CallExpression") {
        return [];
    }

    const tasks = [];
    let current = expression;

    while (
        current &&
        current.type === "CallExpression" &&
        current.callee?.type === "MemberExpression"
    ) {
        const calleeName = current.callee.property?.name;
        const argument = current.arguments?.[0];

        if (calleeName === "then") {
            const { description, options } = extractTaskFromThenArgument(argument);

            tasks.unshift({
                type: "task",
                description,
                options,
                usedVariables: findUsedVariablesInText(description, knownNames)
            });
        }

        else if (calleeName === "parallel") {
            const parallelTasks = [];

            if (argument?.type === "ArrayExpression") {
                for (const element of argument.elements || []) {
                    // 1) إذا العنصر نص عادي
                    if (element?.type === "Literal") {
                        const description = String(element.value ?? "");

                        parallelTasks.push({
                            type: "task",
                            description,
                            options: {},
                            usedVariables: findUsedVariablesInText(description, knownNames)
                        });
                    }

                    // 2) إذا العنصر object فيه description/options
                    else if (element?.type === "ObjectExpression") {
                        const { description, options } = extractTaskFromThenArgument(element);

                        parallelTasks.push({
                            type: "task",
                            description,
                            options,
                            usedVariables: findUsedVariablesInText(description, knownNames)
                        });
                    }
                }
            }

            tasks.unshift({
                type: "parallel",
                tasks: parallelTasks
            });
        }

        else if (calleeName === "when") {
            const conditionNode = current.arguments?.[0];
            const callback = current.arguments?.[1];

            let condition = "";
            if (conditionNode) {
                if (conditionNode.type === "Literal") {
                    condition = String(conditionNode.value ?? "");
                } else {
                    condition = code.substring(conditionNode.start, conditionNode.end);
                }
            }

            const branchTasks = extractTasksFromWhenCallback(callback, code, knownNames);

            tasks.unshift({
                type: "conditional",
                branches: [
                    {
                        condition,
                        tasks: branchTasks
                    }
                ]
            });
        }

        current = current.callee.object;
    }

    return tasks;
}

function extractTasksFromWhenCallback(callback, code, knownNames) {
    if (!callback) return [];

    let bodyStatements = [];

    if (callback.type === "ArrowFunctionExpression") {
        if (callback.body?.type === "BlockStatement") {
            bodyStatements = callback.body.body || [];
        } else {
            // حالة arrow function المختصرة بدون block
            return extractTaskChainFromExpression(callback.body, code, knownNames);
        }
    } else if (callback.type === "FunctionExpression") {
        bodyStatements = callback.body?.body || [];
    }

    const collected = [];

    for (const stmt of bodyStatements) {
        // مثال:
        // task.then("...")
        // task.when(...)
        // task.then(...).when(...).then(...)
        if (
            stmt.type === "ExpressionStatement" &&
            stmt.expression?.type === "CallExpression"
        ) {
            const extracted = extractTaskChainFromExpression(
                stmt.expression,
                code,
                knownNames
            );

            if (extracted.length > 0) {
                collected.push(...extracted);
            }
        }

        // إذا لاحقاً أردتِ دعم متغيرات داخل callback:
        // const x = task.then(...)
        else if (
            stmt.type === "VariableDeclaration"
        ) {
            for (const declaration of stmt.declarations || []) {
                if (declaration.init?.type === "CallExpression") {
                    const extracted = extractTaskChainFromExpression(
                        declaration.init,
                        code,
                        knownNames
                    );

                    if (extracted.length > 0) {
                        collected.push(...extracted);
                    }
                }
            }
        }
    }

    return collected;
}

function assignIdsToTasks(pipelines) {
    pipelines.forEach((pipeline, pipelineIndex) => {
        let taskCounter = 1;

        const visit = node => {
            if (!node) return;

            if (node.type === "task") {
                node.id = `task-${pipelineIndex + 1}-${taskCounter++}`;
            } else if (node.type === "parallel") {
                for (const child of node.tasks || []) {
                    visit(child);
                }
            } else if (node.type === "conditional") {
                for (const branch of node.branches || []) {
                    for (const child of branch.tasks || []) {
                        visit(child);
                    }
                }
            }
        };

        for (const task of pipeline.tasks || []) {
            visit(task);
        }
    });
}

export function extractIrWithAst(code) {
    const ast = parseCodeToAst(code);

    const globalVariables = [];
    const helperFunctions = [];
    const pipelines = [];

    // نجمع أسماء معروفة من الأعلى فقط كبداية
    const knownNames = [];

    for (const node of ast.body || []) {
        if (node.type === "VariableDeclaration") {
            for (const declaration of node.declarations || []) {
                if (declaration.id?.name) {
                    knownNames.push(declaration.id.name);
                }
            }
        } else if (node.type === "FunctionDeclaration") {
            if (node.id?.name) {
                knownNames.push(node.id.name);
            }
        }
    }

    for (const node of ast.body || []) {
        if (node.type === "VariableDeclaration") {
            for (const declaration of node.declarations || []) {
                if (!declaration?.init) {
                    if (declaration.id?.name) {
                        globalVariables.push(declaration.id.name);
                    }
                    continue;
                }

                if (isTaskPipelineInit(declaration.init)) {
                    const variableName = declaration.id?.name ?? "unnamedPipeline";
                    const tasks = extractTaskChainFromExpression(
                        declaration.init,
                        code,
                        knownNames
                    );

                    let current = declaration.init;
                    while (
                        current &&
                        current.type === "CallExpression" &&
                        current.callee?.type === "MemberExpression"
                    ) {
                        current = current.callee.object;
                    }

                    const pipelineName =
                        current?.arguments?.[0]?.type === "Literal"
                            ? String(current.arguments[0].value ?? "UnnamedPipeline")
                            : "UnnamedPipeline";

                    pipelines.push({
                        variableName,
                        name: pipelineName,
                        tasks
                    });
                } else {
                    if (declaration.id?.name) {
                        globalVariables.push(declaration.id.name);
                    }
                }
            }
        }

        else if (node.type === "FunctionDeclaration") {
            helperFunctions.push({
                name: node.id?.name ?? "anonymousFunction",
                code: code.substring(node.start, node.end)
            });
        }
    }

    assignIdsToTasks(pipelines);

    return {
        globalVariables,
        helperFunctions,
        pipelines
    };
}