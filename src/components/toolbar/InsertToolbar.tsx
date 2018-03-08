import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import * as contentTypes from 'data/contentTypes';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayoutInline } from './ContextAwareToolbar';
import { ToolbarButton } from './ToolbarButton';

import styles from './InsertToolbar.style';

export interface InsertToolbarProps {
  onInsert: (content: Object) => void;
  parentSupportsElementType: (type: string) => boolean;
}

/**
 * InsertToolbar React Stateless Component
 */
export const InsertToolbar = injectSheetSFC<InsertToolbarProps>(styles)(({
  classes, onInsert, parentSupportsElementType,
}: StyledComponentProps<InsertToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayoutInline>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Text Block"
            disabled>
          <i className={classes.unicodeIcon}>T</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.WorkbookSection())}
            tooltip="Insert Section"
            disabled={!parentSupportsElementType('section')}>
          <i className={'fa fa-list-alt'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Quote Block"
            disabled>
          <i className={'fa fa-quote-right'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Table"
            disabled>
          <i className={'fa fa-table'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.CodeBlock())}
            tooltip="Insert Code Block"
            disabled={!parentSupportsElementType('codeblock')}>
          <i className={'fa fa-code'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Formula Block"
            disabled>
          <i className={classes.unicodeIcon}>&#8721;</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Image"
            disabled>
          <i className={'fa fa-image'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Audio Clip"
            disabled>
          <i className={'fa fa-volume-up'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Video Clip"
            disabled>
          <i className={'fa fa-film'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert YouTube Video"
            disabled>
          <i className={'fa fa-youtube'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert iFrame"
            disabled>
          <i className={'fa fa-html5'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.Pullout())}
            tooltip="Insert Pullout"
            disabled={!parentSupportsElementType('pullout')}>
          <i className={'fa fa-external-link-square'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.Example())}
            tooltip="Insert Example"
            disabled={!parentSupportsElementType('example')}>
          <i className={'fa fa-bar-chart'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Definition"
            disabled>
          <i className={'fa fa-book'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.WbInline())}
            tooltip="Insert Inline Assessment"
            disabled={!parentSupportsElementType('wb:inline')}>
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.Activity())}
            tooltip="Insert Activity"
            disabled={!parentSupportsElementType('activity')}>
          <i className={'fa fa-check'}/>
        </ToolbarButton>
      </ToolbarLayoutInline>
    </React.Fragment>
  );
});
