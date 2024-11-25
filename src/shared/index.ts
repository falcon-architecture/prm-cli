export { SimpleGit } from 'simple-git';
export * from './git';

const config = {
    get GitHubToken(): string {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GitHub Token is not defined. Please set the GITHUB_TOKEN environment variable.');
        }
        return token;
    }
};

export { config };

