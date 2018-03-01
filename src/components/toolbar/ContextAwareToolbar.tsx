import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { ToolbarSeparator } from './ToolbarSeparator';
import { ToolbarLabel } from './ToolbarLabel';

import { styles } from './ContextAwareToolbar.style';
import { Maybe } from 'tsmonad';

export interface ToolbarProps {
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
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

    const isText = content.caseOf({
      just: c => c instanceof contentTypes.ContiguousText,
      nothing: () => false,
    });

    // const elementMap = supportedElements
    //   .toArray()
    //   .reduce(
    //     (m, c) => {
    //       m[c] = true;
    //       return m;
    //     },
    //     {});

    // const iff = el => elementMap[el];

    // !iff('code-block')

    return (
      <div className={classes.toolbar}>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Text Block">
          <i className={classes.unicodeIcon}>T</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Section">
          <i className={'fa fa-list-alt'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Quote Block">
          <i className={'fa fa-quote-right'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Table">
          <i className={'fa fa-table'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => insert(new contentTypes.CodeBlock())}
            tooltip="Code Block">
          <i className={'fa fa-code'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Formula Block">
          <i className={classes.unicodeIcon}>&#8721;</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Image">
          <i className={'fa fa-image'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Audio Clip">
          <i className={'fa fa-volume-up'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Video Clip">
          <i className={'fa fa-film'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="YouTube Video">
          <i className={'fa fa-youtube'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="iFrame">
          <i className={'fa fa-html5'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Pullout">
          <i className={'fa fa-external-link-square'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => insert(new contentTypes.Example())}
            tooltip="Example">
          <i className={'fa fa-bar-chart'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Definition">
          <i className={'fa fa-book'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Inline Assessment">
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Activity">
          <i className={'fa fa-check'}/>
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
            onClick={
              () => edit(content.lift(t => (t as contentTypes.ContiguousText)
              .toggleStyle(InlineStyles.Bold)))
            }
            tooltip="Bold"
            disabled={!isText}>
          <i className={'fa fa-bold'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Italic"
            disabled={!isText}>
          <i className={'fa fa-italic'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Underline"
            disabled={!isText}>
          <i className={'fa fa-underline'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Strikethrough"
            disabled={!isText}>
          <i className={'fa fa-strikethrough'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Stlye" size={ToolbarButtonSize.Wide}
            disabled={!isText}>
          More...
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Undo">
          <i className={'fa fa-undo'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Redo">
          <i className={'fa fa-repeat'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Preview" size={ToolbarButtonSize.Wide}>
          Preview
        </ToolbarButton>
      </div>
    );
  }

}
