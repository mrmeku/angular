import { strings } from '@angular-devkit/core';
import { apply, branchAndMerge, chain, externalSchematic, mergeWith, Rule, template, url } from '@angular-devkit/schematics';

import { Schema } from './schema';

export default function(options: Schema): Rule {
  const templateSource = apply(
      url('./files'),
      [template({utils: strings, dot: '.', tmpl: '', directory: '', ...(options as object)})]);

  return chain([
    branchAndMerge(mergeWith(templateSource)),
    externalSchematic('@schematics/angular', 'module', options)
  ]);
}
