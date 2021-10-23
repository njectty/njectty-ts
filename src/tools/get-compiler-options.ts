import { readFileSync as read } from "fs";
import { resolve } from "path";
import { CompilerOptions, parseCommandLine } from "typescript";

import { Files, FilesParams } from "./files";

export function getCompilerOptions(): {
    compilerOptions: CompilerOptions;
    files: Files;
} {
    const compilerOptions: CompilerOptions = {};
    const compilerOptionsStack: CompilerOptions[] = [];

    const filesParams: FilesParams = {
        files: [],
        include: [],
        exclude: [],
    };

    const { options, fileNames } = parseCommandLine(process.argv, (path) =>
        read(path).toString()
    );

    filesParams.files.push(...fileNames.slice(2));
    compilerOptionsStack.push(options);

    if (options.project)
        readTsConfig(options.project, compilerOptionsStack, filesParams);
    else readTsConfig("tsconfig.json", compilerOptionsStack, filesParams);

    for (let i = compilerOptionsStack.length - 1; i >= 0; i--) {
        Object.assign(compilerOptions, compilerOptionsStack[i]);
    }

    return { compilerOptions, files: new Files(filesParams) };
}

interface TsConfig {
    compilerOptions?: CompilerOptions;
    files?: string[];
    include?: string[];
    exclude?: string[];
    extends?: string;
}

function readTsConfig(
    path: string,
    compilerOptionsStack: CompilerOptions[],
    filesParams: FilesParams
): void {
    path = resolve(path);

    const {
        compilerOptions = {},
        files = [],
        include = [],
        exclude = [],
        extends: extendsTsConfigPath,
    } = require(path) as TsConfig;

    compilerOptionsStack.push(compilerOptions);

    filesParams.files.push(...files);
    filesParams.include.push(...include);
    filesParams.exclude.push(...exclude);

    if (extendsTsConfigPath)
        readTsConfig(extendsTsConfigPath, compilerOptionsStack, filesParams);
}
