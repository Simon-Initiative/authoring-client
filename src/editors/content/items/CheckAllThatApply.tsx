import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
// import * as Immutable from 'immutable';
// import { AppServices } from '../../common/AppServices';
import {
//   AbstractItemPartEditor,
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
// import { Choice } from './Choice';
// import { ExplanationEditor } from '../part/ExplanationEditor';
// import { TabularFeedback } from '../part/TabularFeedback';
// import { Hints } from '../part/Hints';
// import { ItemLabel } from './ItemLabel';
// import { CriteriaEditor } from '../question/CriteriaEditor';
// import ConceptsEditor from '../concepts/ConceptsEditor.controller';
// import { TextInput, InlineForm, InputLabel, Button, Checkbox, Collapse }
// from '../common/controls';
import { Select } from '../common/controls';
// import guid from 'utils/guid';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { CommandProcessor } from '../common/command';
import { EditorState } from 'draft-js';

import './QuestionBody.scss';

export interface CheckAllThatApplyProps
  extends AbstractItemPartEditorProps<contentTypes.MultipleChoice> {
  onBodyEdit: (...args: any[]) => any;
  body: any;

  grading: any;
  onGradingChange: (value) => void;
  onToggleAdvancedMode: () => void;
  onToggleShuffleChoices: () => void;
  hideGradingCriteria: boolean;
}

let htmlEditor: CommandProcessor<EditorState>;

/**
 * The content editor for HtmlContent.
 */
export const CheckAllThatApply: React.SFC<CheckAllThatApplyProps> = ({
  itemModel,
  onFocus,
  onBlur,

  partModel,

  onEdit,

  context,

  services,

  editMode,

  onRemove,

  onBodyEdit,
  body,

  // --------

  grading,
  onGradingChange,
  onToggleAdvancedMode,
  onToggleShuffleChoices,
}) => {
  const bodyStyle = {
    minHeight: '30px',
    borderStyle: 'none',
    borderWith: '1px',
    borderColor: '#AAAAAA',
  };

  return (
    <div
      className="check-all-that-apply item-content-tab"
      onFocus={() => onFocus(itemModel.id)}
      onBlur={() => onBlur(itemModel.id)}>
      <div className="options">
        <div className="control grading">
          <div className="control-label">Grading</div>
          <select
            disabled={!editMode}
            value={grading}
            onChange={e => onGradingChange(e.target.value)}
            className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0">
            <option value="automatic">Automatic</option>
            <option value="instructor">Instructor</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="flex-spacer"/>
        <div className="control advanced-mode clickable" onClick={() => onToggleAdvancedMode()}>
          <div className="control-label">Advanced</div>
          <div className="control">
            <input className="toggle toggle-light" type="checkbox" checked={false} />
            <label className="toggle-btn"></label>
          </div>
        </div>
      </div>

      <div className="section question">
        <div className="section-header">
          <h3>Question</h3>
        </div>
        <div className="section-content">
          <HtmlContentEditor
            ref={c => htmlEditor = c}
            editMode={editMode}
            services={services}
            context={context}
            editorStyles={bodyStyle}
            inlineToolbar={<InlineToolbar/>}
            inlineInsertionToolbar={<InlineInsertionToolbar/>}
            blockToolbar={<BlockToolbar/>}
            model={body}
            onEdit={onBodyEdit} />
          </div>
      </div>

      <div className="section choices">
        <div className="section-header">
          <h3>Choices</h3>
          <div className="flex-spacer"/>
          <div className="controls">
            <div className="control shuffle-choices" onClick={() => onToggleShuffleChoices()}>
              <div className="control-label">Shuffle</div>
              <div className="control">
                <input className="toggle toggle-light" type="checkbox" checked={true} />
                <label className="toggle-btn"></label>
              </div>
            </div>
          </div>
        </div>
        <div className="section-content">
        </div>
      </div>

      <div className="section feedback">
        <div className="section-header">
          <h3>Feedback</h3>
        </div>
        <div className="section-content">
        </div>
      </div>
    </div>
  );

};
