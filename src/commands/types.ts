import { ICliConfig, } from '@falcon.io/cli';
import { Answers } from 'inquirer';

export interface IInitConfig extends ICliConfig, Answers {
    owner: string;
    checkoutPath: string;
    gitProvider: string;
    workingProject: string;
    [key: string]: any;
}
export interface IProjectsConfig extends IInitConfig {
    projects: IProjectConfig[]
}

export interface IProjectConfig {
    name: string;
    repos: string[];
    pullRequestUrls?: string[];
    pipelineUrls?: string[];
}