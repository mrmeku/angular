import { normalize, relative, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  schematic,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';

import { Schema as E2eOptions } from '../e2e/schema';
import { Schema } from './schema';

export default function(options: Schema): Rule {
  return (host: Tree) => {
    const prefix = options.prefix || 'app';
    const appRootSelector = `${prefix}-root`;

    const workspace = getWorkspace(host);
    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    let sourceRoot = `${appDir}/src`;
    let relativePathToWorkspaceRoot = appDir.split('/').map(x => '..').join('/');
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = `${newProjectRoot}/src`;
      sourceRoot = appDir;
      relativePathToWorkspaceRoot = relative(normalize('/' + sourceRoot), normalize('/'));
      if (relativePathToWorkspaceRoot === '') {
        relativePathToWorkspaceRoot = '.';
      }
    }

    const e2eOptions: E2eOptions = {
      name: `${options.name}-e2e`,
      relatedAppName: options.name,
      rootSelector: appRootSelector,
    };


    return chain([
      externalSchematic('@schematics/angular', 'application', {...options, directory: '.'}),
      branchAndMerge(schematic('e2e', e2eOptions), MergeStrategy.Overwrite),
      branchAndMerge(
          mergeWith(
              apply(
                  url('./files/root'),
                  [
                    template({
                      utils: strings,
                      ...options,
                      'dot': '.',
                      relativePathToWorkspaceRoot,
                    }),
                    move(sourceRoot),
                  ]),
              MergeStrategy.Overwrite),  // Overwrite main.ts
          MergeStrategy.Overwrite),
      (tree: Tree) => {
          // TODO(mrmeku): Un-comment line below when
          // https://github.com/angular/angular-cli/issues/11460 is fixed.
          // tree.delete(`bazel/e2e/protractor.conf.js`);
      },
    ]);
  }
}
