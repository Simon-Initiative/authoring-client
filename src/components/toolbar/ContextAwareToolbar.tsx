import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { ToolbarSeparator } from './ToolbarSeparator';
import { ToolbarLabel } from './ToolbarLabel';

import { styles } from './ContextAwareToolbar.style';

export interface ToolbarProps {
  supportedElements: Immutable.List<string>;
  content: Object;
  insert: (content: Object) => void;
  edit: (content: Object) => void;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.PureComponent<ToolbarProps & JSSProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    const { insert, edit, content, supportedElements, classes } = this.props;

    return (
      <div className={classes.toolbar}>
        <ToolbarButton onClick={() => {}} tooltip="Text Block">
          <i className={classes.textBlock}>T</i>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Section">
          <i className={'fa fa-list-alt'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Quote Block">
          <i className={'fa fa-quote-right'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Table">
          <i className={'fa fa-table'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Code Block">
          <i className={'fa fa-code'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Formula Block">
          <i className={'fa fa-superscript'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Image">
          <i className={'fa fa-image'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Audio Clip">
          <i className={'fa fa-volume-up'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Video Clip">
          <i className={'fa fa-film'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="YouTube Video">
          <i className={'fa fa-youtube'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}}  tooltip="iFrame">
          <i className={'fa fa-html5'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Pullout">
          <i className={'fa fa-external-link-square'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Example">
          <i className={'fa fa-bar-chart'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Definition">
          <i className={'fa fa-book'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Inline Assessment">
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Activity">
          <i className={'fa fa-check'}/>
        </ToolbarButton>

        <ToolbarSeparator />

        Details

        <ToolbarSeparator />

        <ToolbarButton onClick={() => {}} tooltip="Undo">
          <i className={'fa fa-undo'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Redo">
          <i className={'fa fa-repeat'}/>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Preview" size={ToolbarButtonSize.Wide}>
          <i className={'fa fa-eye'}/>
        </ToolbarButton>
      </div>
    );
  }

}
