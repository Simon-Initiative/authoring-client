import * as Immutable from 'immutable';
import { augment } from 'data/content/common';


export type TitledContentParams = {
  guid? : string,
  title?: string;
  message?: string;
};

const defaultContent = {
  guid: '',
  title: 'An error has occurred.',
  message: '',
};

export class TitledContent extends Immutable.Record(defaultContent) {

  guid: string;
  title: string;
  message: string;

  constructor(params?: TitledContentParams) {
    super(augment(params));
  }

  with(values: TitledContentParams) {
    return this.merge(values) as this;
  }

}
