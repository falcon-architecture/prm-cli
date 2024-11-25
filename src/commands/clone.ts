import { Command, AbstractCommand } from '@falcon.io/cli';
import { join } from 'path';
import { GitBuilder, SimpleGit } from '../shared';
import { IProjectsConfig, IProjectConfig, IInitConfig } from './';

export class Clone extends AbstractCommand {
    public constructor(parentCommand: Command) {
        super(parentCommand, 'clone <project>', 'Clone a Git repository');
    }

    public async run(project: string): Promise<void> {
        try {
            const projectConfig = this.getProjectConfig(project);
            this.logRepoDetails(projectConfig);
            const clonePromises = this.createClonePromises(projectConfig);
            await Promise.all(clonePromises);
        } catch (error: any) {
            this.logger.error(error.message);
            throw error;
        }
    }

    private getProjectConfig(project: string): IProjectConfig {
        const repoConfig = this.config<IProjectsConfig>();
        const projectConfig = repoConfig.projects
            ?.find(d => d.name?.toLowerCase() === project?.toLowerCase());
        if (!projectConfig || projectConfig.repos.length === 0) {
            throw new Error(`Project ${project} is not found or no repositories in the configuration.`);
        }
        return projectConfig;
    }

    private logRepoDetails(projectConfig: IProjectConfig): void {
        console.table(projectConfig.repos);
        this.logger.info(`Cloning repositories for project ${projectConfig.name}...`);
    }

    private createClonePromises(projectConfig: IProjectConfig): Promise<void>[] {
        const { owner, checkoutPath } = this.config<IInitConfig>();
        const { name, repos } = projectConfig;
        return repos.map(repoName => this.cloneRepo(owner, name, repoName, checkoutPath));
    }

    private async cloneRepo(owner: string, project: string, repoName: string, checkoutPath: string) {
        try {
            this.logger.info(`Cloning ${repoName}...`);
            const startTime = Date.now();
            const checkoutLocation = this.getCheckokutLocation(checkoutPath, project);
            if (this.repoExists(checkoutLocation, repoName)) {
                this.logger.warn(`Repository ${repoName} already exists at ${checkoutLocation}. Skipping...`);
                return;
            }
            const git: SimpleGit = this.git(checkoutLocation);
            const url = this.getRepoUrl(owner, repoName);
            this.logger.debug(`Cloning ${url} to ${checkoutLocation}...`);
            await git.clone(url);
            const endTime = Date.now();
            const cloneDurationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
            this.logger.info(`Cloned ${repoName} to ${checkoutLocation} in ${cloneDurationInSeconds} seconds.`);
        } catch (error: any) {
            this.logger.error(`Failed to clone ${repoName}: ${error.message}`);
            throw error;
        }
    }

    private getCheckokutLocation(checkoutPath: string, project: string): string {
        const checkoutLocation = join(checkoutPath, project);
        return checkoutLocation;
    }

    private repoExists(checkoutLocation: string, repoName: string): boolean {
        return this.exists(join(checkoutLocation, repoName, '.git'));
    }

    private git(repoBaseDir: string): SimpleGit {
        this.mkdir(repoBaseDir);
        let git = GitBuilder.new().baseDir(repoBaseDir).build();
        return git;
    }
    
    private getRepoUrl(owner: string, repoName: string): string {
        const GitHubToken = process.env.GITHUB_TOKEN;
        return `https://${GitHubToken}@github.com/${owner}/${repoName}.git`;
    }
}
