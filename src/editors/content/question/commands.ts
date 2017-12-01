import { EditorState } from 'draft-js';
import { AbstractCommand } from '../common/command';
import { EntityTypes } from '../../../data/content/html/common';
import { InsertInlineEntityCommand } from '../common/draft/commands/insert';
import guid from '../../../utils/guid';

export class InsertInputRefCommand extends AbstractCommand<EditorState> {

  question: any;
  itemBuilder:  () => any;
  typeLabel: string;

  constructor(question: any, itemBuilder: () => any, typeLabel: string) {
    super();

    this.question = question;
    this.itemBuilder = itemBuilder;
    this.typeLabel = typeLabel;
  }

  execute(state: EditorState, context, services) : Promise<EditorState> {

    this.question.itemToAdd = this.itemBuilder();

    const input = guid();
    const data = {};
    data['@input'] = input;
    data['$type'] = this.typeLabel;

    const delegate = new InsertInlineEntityCommand(EntityTypes.input_ref, 'IMMUTABLE', data);

    return delegate.execute(state, context, services);
  }
}

