import * as Immutable from 'immutable';
import { augment } from '../common';
import * as types from './types';

export type LabelsParams = {
  sequence?: string,
  unit?: string,
  module?: string,
  section?: string,
  guid?: string,
};

const defaultContent = {
  contentType: types.ContentTypes.Labels,
  elementType: 'labels',
  sequence: 'Sequence',
  unit: 'Unit',
  module: 'Module',
  section: 'Section',
  guid: '',
};

export class Labels extends Immutable.Record(defaultContent) {

  contentType: types.ContentTypes.Labels;
  elementType: 'labels';
  sequence: string;
  unit: string;
  module: string;
  section: string;
  guid: string;

  constructor(params?: LabelsParams) {
    super(augment(params));
  }

  with(values: LabelsParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string, notify?: () => void) {

    const s = (root as any).labels;
    let model = new Labels({ guid });

    if (s['@sequence'] !== undefined) {
      model = model.with({ sequence: s['@sequence'] });
    }
    if (s['@unit'] !== undefined) {
      model = model.with({ unit: s['@unit'] });
    }
    if (s['@module'] !== undefined) {
      model = model.with({ module: s['@module'] });
    }
    if (s['@section'] !== undefined) {
      model = model.with({ section: s['@section'] });
    }

    return model;
  }

  toPersistence() : Object {

    return {
      labels: {
        '@sequence': this.sequence,
        '@unit': this.unit,
        '@module': this.module,
        '@section': this.section,
      },
    };

  }
}
