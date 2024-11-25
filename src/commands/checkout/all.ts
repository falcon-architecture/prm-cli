import { Command, AbstractCommand } from '@falcon.io/cli';

export class All extends AbstractCommand {
    public constructor(parentCommand: Command) {
        super(parentCommand, 'all', 'Checkout all repositories');
    }
    public override run(): void {
        let currentCommand = this.command;
        console.log(currentCommand.parent?.parent?.name());
        const cwd = super.cwd;
        console.log('All repositories checked out');
    }
}
