import simpleGit, { SimpleGit } from "simple-git";

export class GitBuilder {
    private _baseDir: string = process.cwd();
    private _maxConcurrentProcesses: number = 2;

    public static new(): GitBuilder {
        return new GitBuilder();
    }

    public baseDir(baseDir: string): this {
        this._baseDir = baseDir;
        return this;
    }

    public maxConcurrentProcesses(maxConcurrentProcesses: number): this {
        this._maxConcurrentProcesses = maxConcurrentProcesses;
        return this;
    }

    public build(): SimpleGit {
        return simpleGit({
            baseDir: this._baseDir,
            binary: 'git',
            maxConcurrentProcesses: this._maxConcurrentProcesses
        });
    }
}
