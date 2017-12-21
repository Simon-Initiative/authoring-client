import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { HintEditor } from './HintEditor';
import { Button } from '../common/controls';

export interface HintsProps {
  model: contentTypes.Part;
  onEdit: (hints: Immutable.Map<string, contentTypes.Hint>) => void;
  context: AppContext;
  editMode: boolean;
  services: AppServices;
}

export interface HintsState {

}

/**
 * The content editor for HtmlContent.
 */
export abstract class Hints
  extends React.PureComponent<HintsProps, HintsState> {

  constructor(props) {
    super(props);

    this.onAddHint = this.onAddHint.bind(this);
    this.onHintEdit = this.onHintEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onAddHint() {
    const { onEdit } = this.props;

    const hint = new contentTypes.Hint();
    onEdit(this.props.model.hints.set(hint.guid, hint));
  }

  onHintEdit(hint: contentTypes.Hint) {
    const { onEdit } = this.props;

    onEdit(this.props.model.hints.set(hint.guid, hint));
  }

  onRemove(hint: contentTypes.Hint) {
    const { onEdit } = this.props;

    onEdit(this.props.model.hints.delete(hint.guid));
  }

  renderHints() {
    return this.props.model.hints.toArray().map((i) => {
      return (
        <HintEditor
          key={i.guid}
          {...this.props}
          model={i}
          onEdit={this.onHintEdit}
          onRemove={this.onRemove} />
      );
    });
  }

  render() : JSX.Element {
    return (
      <div className="hints">
        <Button
          editMode={this.props.editMode}
          type="link"
          onClick={this.onAddHint}>
          Add Hint
        </Button>

        {this.renderHints()}
      </div>
    );
  }

}

