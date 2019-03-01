import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';
import * as models from 'data/models';

export const styles: JSSStyles = {
  OrgDetailsEditor: {
    extend: [disableSelect],
    padding: [30, 15],
  },
};

export interface OrgDetailsEditorProps {
  model: models.OrganizationModel;
}

export interface OrgDetailsEditorState {

}

/**
 * OrgDetailsEditor React Component
 */
@injectSheet(styles)
export class OrgDetailsEditor
    extends React.PureComponent<StyledComponentProps<OrgDetailsEditorProps>,
    OrgDetailsEditorState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames(['OrgDetailsEditor', classes.OrgDetailsEditor, className])}>
        <h2>{model.title}</h2>
      </div>
    );
  }
}
