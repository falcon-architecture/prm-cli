#!/usr/bin/env node

import { CommandBuilder } from '@falcon.io/cli';
import { commands } from './commands';

CommandBuilder.new()
    .name("prm")
    .description("Ploy Repository Manager")
    .version("1.0.0")
    .subCommands(...commands)
    .build()
    .parse(process.argv);