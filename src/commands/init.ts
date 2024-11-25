import { Command, AbstractCommand, DistinctQuestion } from '@falcon.io/cli';
import { IInitConfig, IProjectsConfig } from './';

export class Init extends AbstractCommand {
    public constructor(parentCommand: Command) {
        super(parentCommand, 'init', 'Initialize the CLI configuration');
        this.command.option('-f, --force', "Force initialization of the configuration");
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
        },
        {
            type: 'list',
            name: 'gitProvider',
            message: 'Choose your Git repository provider',
            choices: ['GitHub', 'Azure DevOps']
        },
        {
            type: 'list',
            name: 'workingProject',
            message: 'Select the working project/domain',
            choices: ["All"]
        }
    ];

    public override async run(option: { force: boolean }): Promise<void> {
        option.force && this.isConfigInitialized ? await this.forceInit() : await this.init();
    }

    private async init(): Promise<void> {
        let answers = await this.prompt<IInitConfig>(this.questions);
        this.initConfig<IInitConfig>(answers);
    }

    private async forceInit(): Promise<void> {
        let questions = this.prepareQuestions();
        let answers = await this.prompt<IInitConfig>(questions);
        this.updateConfig<IInitConfig>(answers);
    }

    private prepareQuestions(): DistinctQuestion[] {
        let projects = this.config<IProjectsConfig>().projects ?? [];
        let workingProjectQuestion = this.questions.find(q => q.name === 'workingProject');
        if (workingProjectQuestion) {
            workingProjectQuestion.choices = projects.map(p => p.name);
        }
        return this.questions;
    }
}
