import { readFileSync as read } from "fs";
import { not } from "logical-not";
import { IMinimatch, Minimatch } from "minimatch";
import { resolve } from "path";

export interface FilesParams {
    files: string[];
    include: string[];
    exclude: string[];
}

export class Files {
    private files: string[];
    private include: IMinimatch[];
    private exclude: IMinimatch[];

    private matched: { [file: string]: boolean } = Object.create(null);

    constructor({ files, include, exclude }: FilesParams) {
        this.files = files;
        this.include = include.map(
            (pattern) => new Minimatch(resolve(pattern))
        );
        this.exclude = exclude.map(
            (pattern) => new Minimatch(resolve(pattern))
        );
    }

    get(): string[] {
        return this.files;
    }

    resolve(file: string): string | undefined {
        file = resolve(file);
        // console.log("try to resolve", file);

        if (not(file in this.matched)) {
            this.matched[file] = false;

            const included = this.include.some((glob) => glob.match(file));

            if (not(included)) return;

            const excluded = this.exclude.some((glob) => glob.match(file));

            if (excluded) return;

            this.matched[file] = true;
        }

        if (not(this.matched[file])) return;

        // console.log("read", file);

        return read(file).toString();
    }
}
