import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import * as contentTypes from 'data/contentTypes';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
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
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Text Block"
            disabled>
          <i className={classes.unicodeIcon}>T</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Ordered List">
          <i className={'fa fa-list-ol'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Unordered List">
          <i className={'fa fa-list-ul'}/>
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
            onClick={() => onInsert(new contentTypes.YouTube())}
            tooltip="Insert YouTube Video"
            disabled={!parentSupportsElementType('youtube')}>
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
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Inline Assessment"
            disabled>
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Activity"
            disabled>
          <i className={'fa fa-check'}/>
        </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment>
  );
});
