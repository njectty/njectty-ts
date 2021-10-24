import { dirname as getDirectoryFrom } from "path";
import {
    CompilerOptions,
    parseCommandLine,
    parseConfigFileTextToJson,
    parseJsonConfigFileContent,
    readJsonConfigFile,
    sys as system,
} from "typescript";

export class Environment {
    static create(): Environment {
        const { options: cliOptions, fileNames: cliFiles } = parseCommandLine(
            process.argv,
            system.readFile,
        );

        const { compilerOptions, files } = readTsConfig(
            cliOptions.project || "tsconfig.json",
            cliOptions,
        );

        files.unshift(...cliFiles.slice(2));

        return new Environment(compilerOptions, files);
    }

    private constructor(
        public readonly compilerOptions: CompilerOptions,
        public readonly files: string[],
    ) {}
}

function readTsConfig(
    file: string,
    existingOptions: CompilerOptions,
): { compilerOptions: CompilerOptions; files: string[] } {
    file = system.resolvePath(file);

    const tsConfigSourceFile = readJsonConfigFile(file, system.readFile);

    const { config: tsConfig } = parseConfigFileTextToJson(
        file,
        tsConfigSourceFile.text,
    );

    const basePath = getDirectoryFrom(file);

    const tsConfigSource = parseJsonConfigFileContent(
        tsConfig,
        system,
        basePath,
        existingOptions,
    );

    return {
        compilerOptions: tsConfigSource.options,
        files: tsConfigSource.fileNames,
    };
}
