import { Command, AbstractCommand } from '@falcon.io/cli';

export class Domain extends AbstractCommand {
    public constructor(parentCommand: Command) {
        super(parentCommand, 'domain <name>', 'Checkout domain repositories');
        this.command.option('-b, --branch <name>', 'Checkout branch name');
    }
    public override run(name: string, option: any): void {
        console.log(`checking out domain ${name} repositories...`);
        console.log('Branch:', option);
    }
}
