export { SimpleGit } from 'simple-git';
export * from './git';

const GitHubToken = process.env.GITHUB_TOKEN;
if (!GitHubToken) {
    throw new Error('GitHub Token is not defined. Please set the GITHUB_TOKEN environment variable.');
}
export { GitHubToken };