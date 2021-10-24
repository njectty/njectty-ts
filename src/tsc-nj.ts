import { transform } from "@babel/core";
import { not } from "logical-not";
import { createCompilerHost, createProgram, sys as system } from "typescript";

import { Environment } from "./tools/environment";
import { isTs, isDTs } from "./tools/reg-exp";

const environment = Environment.create();
const babelOptions = {
    plugins: ["babel-plugin-njectty/typescript"],
};

if (not(environment.compilerOptions.watch)) {
    const { compilerOptions, files } = environment;

    const host = createCompilerHost(compilerOptions);

    host.readFile = function (path: string): string | undefined {
        if (isTs.test(path) && not(isDTs.test(path))) {
            const file = system.readFile(path)!;

            return transform(file, babelOptions)!.code!;
        }

        return system.readFile(path);
    };

    const program = createProgram(files, compilerOptions, host);

    program.emit();
}
