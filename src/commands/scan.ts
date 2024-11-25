import { Command, AbstractCommand } from '@falcon.io/cli';
import { IProjectsConfig, IProjectConfig, IInitConfig } from './types';

export class Scan extends AbstractCommand {
    private readonly token = process.env.GITHUB_TOKEN;
    public constructor(parentCommand: Command) {
        super(parentCommand, 'scan <project>', 'Pull security code scan results');
        this.command.option('-b, --branch <name>', 'branch name to get the scan result', 'develop');
        this.command.option('-f, --force', 'pull the scan result forcefully from the git provider');
    }
    public override async run(project:string, option: { branch: string, force: boolean }): Promise<void> {
        this.logger.info(`Scanning branch ${option.branch} for security vulnerabilities`);
        let projectConfig = this.getProjects(project);
        if (!projectConfig) {
            throw new Error(`Project ${project} is not found in the configuration.`);
        }
        let vulnerabilities = await this.getProjectScanResults(projectConfig, option.branch);
        this.logVulnerabilities(vulnerabilities);
    }

    private getProjects(project: string): IProjectConfig | undefined {
        let projectConfig = this.config<IProjectsConfig>().projects.find((x) => x.name === project);
        return projectConfig;
    }

    private async getProjectScanResults(project: IProjectConfig, branch: string): Promise<{ name: string, result: any[] }[]> {
        let scanResults: { name: string, result: any[] }[] = [];
        let owner = this.config<IInitConfig>().owner;
        for (let repo of project.repos) {
            let results = await this.getRepositoryScanResults(owner, repo, branch);
            scanResults.push(results);
        }
        return scanResults;
    }

    private async getRepositoryScanResults(owner: string, repo: string, branch: string): Promise<{ name: string, result: any[] }> {
        try {
            this.logger.info(`Getting scan results for repository ${repo} and branch ${branch}`);
            let url = `https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts`;
            let params = {
                per_page: 100,
                ref: branch,
            };
            let headers = {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
            };
            let result = await this.request<any[]>({ url, headers, params });
            this.logger.info(`Found ${result.length} vulnerabilities in repository ${repo} and branch ${branch}`);
            return { name: repo, result };
        } catch (error: any) {
            this.logger.error(`Failed to get scan results for repository ${repo} and branch ${branch}: ${error.message}`);
            return { name: repo, result: [] };
        }
    }

    private logVulnerabilities(vulnerabilities: { name: string, result: any[] }[]): void {
        vulnerabilities.forEach(vulnerability => {
            for (let result of vulnerability.result) {
                this.logger.warn(`Repository: ${vulnerability.name}: Vulnerability Id: ${result.number} url: ${result.url}, created at: ${result.created_at}`);
            }
        });
    }
}
