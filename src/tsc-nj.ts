import { transform } from "@babel/core";
import { not } from "logical-not";
import {
    CompilerHost,
    createCompilerHost,
    createProgram,
    createWatchCompilerHost,
    createWatchProgram,
    sys as system,
    WatchCompilerHostOfFilesAndCompilerOptions,
} from "typescript";

import { Environment } from "./tools/environment";
import { isTs, isDTs } from "./tools/reg-exp";

const babelOptions = {
    plugins: ["babel-plugin-njectty/typescript"],
};

const { compilerOptions, files } = Environment.create();
const { watch } = compilerOptions;

const host = not(watch)
    ? createCompilerHost(compilerOptions)
    : createWatchCompilerHost(files, compilerOptions, system);

host.readFile = function (path: string): string | undefined {
    if (isTs.test(path) && not(isDTs.test(path))) {
        const file = system.readFile(path)!;

        return transform(file, babelOptions)!.code!;
    }

    return system.readFile(path);
};

if (not(watch)) {
    const program = createProgram(files, compilerOptions, host as CompilerHost);

    program.emit();
} else {
    createWatchProgram(host as WatchCompilerHostOfFilesAndCompilerOptions<any>);
}
