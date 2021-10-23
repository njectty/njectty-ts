import { writeFileSync as write } from "fs";
import { not } from "logical-not";
import { join } from "path";
import { chmod, cp, exec, exit, mkdir, rm, test } from "shelljs";
import { parseCommandLine } from "typescript";

if (process.cwd() !== join(__dirname, "..")) exit(1);

if (test("-d", "package")) rm("-rf", "package");

mkdir("package");

createPackageJSON: {
    const packageJSON = require("../package.json");

    delete packageJSON.scripts;
    delete packageJSON.devDependencies;

    packageJSON.bin = {
        "tsc-nj": "cli.js",
    };
    packageJSON.peerDependencies = {
        typescript: "*",
    };

    const file = JSON.stringify(packageJSON, null, "  ");

    write("package/package.json", file);
}

cp("LICENSE", "README.md", "package");

const {
    options: { watch },
} = parseCommandLine(process.argv);

if (not(watch)) exec("tsc");
else runWatchMode();

function runWatchMode(): void {
    cp("src/cli.ts", "package/cli.js");
    chmod(744, "package/cli.js");

    exec("tsc --watch --excludeFiles src/cli.ts");
}
