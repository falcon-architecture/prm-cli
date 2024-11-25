import { Command, AbstractCommand } from '@falcon.io/cli';
import { All } from './all';
import { Domain } from './domain';

export class Checkout extends AbstractCommand {
    public constructor(parent: Command) {
        super(parent, 'checkout', 'checkout repositories');
        this.addSubCommands(All, Domain);
    }
    public override run(): void {
        this.help();
    }
}
