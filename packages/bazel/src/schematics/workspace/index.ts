import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';

import { Schema } from './schema';

export default function(options: Schema): Rule {
  const templateSource = apply(
      url('./files'),
      [template({utils: strings, dot: '.', tmpl: '', directory: '', ...(options as object)})]);

  return chain([
    externalSchematic('@schematics/angular', 'workspace', options),
    branchAndMerge(
        mergeWith(templateSource, MergeStrategy.Overwrite),  // Overwrite README.md
        MergeStrategy.Overwrite),
  ]);
}
