import { DistinctQuestion } from 'inquirer';
import { Command, AbstractCommand } from '@falcon.io/cli';
import { IInitConfig, IProjectsConfig } from './';

export class Repo extends AbstractCommand {
    public constructor(parentCommand: Command) {
        super(parentCommand, 'repo', 'Get all repository names for the owner');
    }
    private readonly questions: DistinctQuestion[] = [
        {
            type: 'input',
            name: 'owner',
            message: "What's Github repository owner name?",
        },
        {
            type: 'input',
            name: 'checkoutPath',
            message: "What is the repository's checkout directory name?",
            default: '.'
        }
        // {
        //     type: 'password',
        //     name: 'password',
        //     message: 'Enter your password:',
        //     mask: '*',
        // },
        // {
        //     type: 'list',
        //     name: 'color',
        //     message: 'Choose your favorite color:',
        //     choices: ['Red', 'Green', 'Blue', 'Yellow'],
        // },
        // {
        //     type: 'checkbox',
        //     name: 'hobbies',
        //     message: 'Select your hobbies:',
        //     choices: ['Reading', 'Traveling', 'Cooking', 'Gaming', 'Sports'],
        // },
        // {
        //     type: 'confirm',
        //     name: 'confirmation',
        //     message: 'Do you confirm the above information?',
        // },
    ];

    public override async run(): Promise<void> {
        let answers = this.config<IInitConfig>();
        let repos = await this.getReposByOwner(answers.owner);
        let config = { ...this.config<IInitConfig>(), projects: [{ name: 'all', repos }] };
        this.updateConfig<IProjectsConfig>(config);
    }

    public async getReposByOwner(owner: string): Promise<string[]> {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GitHub Token is not defined. Please set the GITHUB_TOKEN environment variable.');
        }
        const repoNames: string[] = [];
        let page = 1;
        try {
            while (true) {
                let url = `https://api.github.com/orgs/${owner}/repos`;
                let params = {
                    per_page: 100,
                    page,
                };
                let headers = {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                };
                let repos = await this.request<{ name: string }[]>({ url, headers, params });
                this.logger.info(`Page: ${page}, Repo Count: ${repos.length}`);
                if (repos.length === 0) {
                    break;
                }
                let names = repos.map(repo => repo.name);
                repoNames.push(...names);
                page++;
            }
        } catch (error) {
            this.logger.error(error);
            return Promise.reject(new Error('Failed to fetch repositories'));
        }
        return repoNames;
    }
}
