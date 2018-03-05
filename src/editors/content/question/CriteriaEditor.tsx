import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { TextInput } from '../common/controls';
import { RemovableContent } from '../common/RemovableContent';

type IdTypes = {
  score: string,
};

export interface CriteriaEditorProps
  extends AbstractContentEditorProps<contentTypes.GradingCriteria> {
  onRemove: (guid: string) => void;
}

export interface CriteriaEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class CriteriaEditor
  extends AbstractContentEditor<contentTypes.GradingCriteria,
  CriteriaEditorProps, CriteriaEditorState> {
  ids: IdTypes;

  constructor(props) {
    super(props);

    this.ids = {
      score: guid(),
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onScore = this.onScore.bind(this);
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept);
  }

  onScore(score) {
    this.props.onEdit(this.props.model.with({ score }));
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const controls = (
      <form className="form-inline">
        Score:&nbsp;&nbsp;&nbsp;
        <TextInput
          editMode={this.props.editMode}
          width="75px"
          label=""
          value={this.props.model.score}
          type="number"
          onEdit={this.onScore}
        />
      </form>
    );

    return (
      <RemovableContent
        editMode={this.props.editMode}
        onRemove={() => this.props.onRemove(this.props.model.guid)}
        associatedClasses="content">

        {controls}

        <ContentContainer
          services={this.props.services}
          context={this.props.context}
          editMode={this.props.editMode}
          model={this.props.model.body}
          onEdit={this.onBodyEdit}/>

      </RemovableContent>
    );
  }
}

