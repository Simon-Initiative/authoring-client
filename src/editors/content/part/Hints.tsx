import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { HintEditor } from './HintEditor';

export interface HintsProps {
  model: contentTypes.Part;
  onFocus: (child, parent, textSelection) => void;
  onEdit: (hints: Immutable.Map<string, contentTypes.Hint>, src) => void;
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

    this.onHintEdit = this.onHintEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onHintEdit(hint: contentTypes.Hint, src) {
    const { onEdit } = this.props;

    onEdit(this.props.model.hints.set(hint.guid, hint), src);
  }

  onRemove(hint: contentTypes.Hint) {
    const { onEdit } = this.props;

    onEdit(this.props.model.hints.delete(hint.guid), null);
  }

  renderHints() {
    return this.props.model.hints.toArray().map((i) => {
      return (
        <HintEditor
          onFocus={this.props.onFocus}
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
        {this.renderHints()}
      </div>
    );
  }

}

