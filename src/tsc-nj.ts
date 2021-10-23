import { transform } from "@babel/core";
import { not } from "logical-not";
import {
    createCompilerHost,
    createProgram,
    ModuleResolutionKind,
} from "typescript";

import { getCompilerOptions } from "./tools/get-compiler-options";

const babelOptions = {
    plugins: ["babel-plugin-njectty/typescript"],
};

const { compilerOptions, files } = getCompilerOptions();

compilerOptions.moduleResolution = ModuleResolutionKind.NodeJs;

if (not(compilerOptions.watch)) {
    const host = createCompilerHost(compilerOptions);

    host.readFile = function (filename: string): string | undefined {
        const file = files.resolve(filename);

        if (not(file)) return;

        return transform(file, babelOptions)!.code!;
    };

    const program = createProgram(files.get(), compilerOptions, host);

    program.emit();
}
