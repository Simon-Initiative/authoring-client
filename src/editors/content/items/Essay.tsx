import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { AppServices } from '../../common/AppServices';
import {
  AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
import { Choice } from './Choice';
import { ExplanationEditor } from '../part/ExplanationEditor';
import { TabularFeedback } from '../part/TabularFeedback';
import { Hints } from '../part/Hints';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { ItemLabel } from './ItemLabel';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from 'utils/guid';
import ConceptsEditor from '../concepts/ConceptsEditor';
import { Question, QuestionProps, QuestionState } from './Question';

export interface EssayProps extends QuestionProps<contentTypes.Essay> {

}

export interface EssayState extends QuestionState {

}

/**
 * The content editor for HtmlContent.
 */
export class Essay
  extends Question<EssayProps, EssayState> {

  constructor(props) {
    super(props);

    this.setClassname('essay');
  }
}
