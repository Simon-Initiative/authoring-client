import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import { disableSelect } from 'styles/mixins';


export const styles: JSSStyles = {
  OrgDetailsEditor: {
    extend: [disableSelect],
  },
};

export interface OrgDetailsEditorProps {

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
    const { className, classes, children } = this.props;

    return (
      <div className={classNames(['OrgDetailsEditor', classes.OrgDetailsEditor, className])}>
        {children}
      </div>
    );
  }
}
