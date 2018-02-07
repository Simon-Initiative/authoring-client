import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentState, convertFromRaw } from 'draft-js';
import * as common from './common';
import guid from '../../../utils/guid';
import { augment } from '../common';
import { cloneContent } from '../common/clone';
import { toDraft } from './draft/todraft';

import { getEntities, removeInputRef as removeInputRefDraft,
  Changes, detectChanges } from './draft/changes';
import { EntityTypes } from '../learning/common';
import { fromDraft } from './draft/topersistence';

const emptyContent = ContentState.createFromText(' ');

export type ContiguousTextParams = {
  content?: ContentState,
  guid?: string,
};

const defaultContent = {
  contentType: 'ContiguousText',
  content: emptyContent,
  guid: '',
};

export class ContiguousText extends Immutable.Record(defaultContent) {

  contentType: 'ContiguousText';
  content: ContentState;
  guid: string;

  constructor(params?: ContiguousTextParams) {
    super(augment(params));
  }

  with(values: ContiguousTextParams) {
    return this.merge(values) as this;
  }

  removeInputRef(id: string) {
    return this.with({
      content: removeInputRefDraft(this.content, id),
    });
  }

  detectInputRefChanges(previous: ContiguousText) : Changes {
    return detectChanges(EntityTypes.input_ref, '@input', previous.content, this.content);
  }

  tagInputRefsWithType(byId: Object) {

    const content = getEntities(EntityTypes.input_ref, this.content)
      .reduce(
        (contentState, info) => {
          if (byId[info.entity.data['@input']] !== undefined) {
            const type = byId[info.entity.data['@input']].contentType;
            return contentState.mergeEntityData(info.entityKey, { $type: type });
          }

          return contentState;
        },
        this.content);

    return this.with({ content });
  }

  extractPlainText() : Maybe<string> {

    const blocks = this.content.getBlocksAsArray();
    const unstyled = blocks.filter(b => b.type === 'unstyled');

    if (unstyled.length > 0) {
      return Maybe.just(unstyled[0].text);
    }
    return Maybe.nothing();
  }

  clone() : ContiguousText {
    return this.with({
      content: cloneContent(this.content),
    });
  }

  static fromPersistence(root: Object[], guid: string) : ContiguousText {
    return new ContiguousText({ guid, content: toDraft(root) });
  }

  static fromText(text: string, guid: string) : ContiguousText {
    return new ContiguousText({ guid, content: ContentState.createFromText(text) });
  }



  toPersistence() : Object {
    return fromDraft(this.content);
  }
}


