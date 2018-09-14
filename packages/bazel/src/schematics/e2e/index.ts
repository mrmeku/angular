import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  mergeWith,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';

import { Schema } from './schema';

export default function(options: Schema): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    let newProjectRoot = workspace.newProjectRoot;

    let appDir = `${newProjectRoot}/${options.name}`;


    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = newProjectRoot;
    }

    const templateSource = apply(url('./files'), [template({
                                   utils: strings,
                                   ...options,
                                   'dot': '.',
                                   appDir,
                                 })]);

    return chain([
      externalSchematic('@schematics/angular', 'e2e', options),
      branchAndMerge(mergeWith(templateSource)),
    ]);
  }
}
