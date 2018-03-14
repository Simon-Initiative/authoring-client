import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import * as contentTypes from 'data/contentTypes';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import ResourceSelection from 'utils/selection/ResourceSelection';
import { LegacyTypes } from 'data/types';
import * as persistence from 'data/persistence';

import styles from './InsertToolbar.style';

export interface InsertToolbarProps {
  onInsert: (content: Object) => void;
  parentSupportsElementType: (type: string) => boolean;
  context: AppContext;
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

/**
 * InsertToolbar React Stateless Component
 */
export const InsertToolbar = injectSheetSFC<InsertToolbarProps>(styles)(({
  classes, onInsert, parentSupportsElementType, context, displayModal, dismissModal,
}: StyledComponentProps<InsertToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={() => console.log('NOT IMPLEMENTED')}
            tooltip="Insert Text Block"
            disabled>
          <i className="unicode-icon">T</i>
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
          <i className="unicode-icon">&#8721;</i>
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
            onClick={() => displayModal(
              <ResourceSelection 
                filterPredicate={(
                  res: persistence.CourseResource): boolean => 
                    res.type === LegacyTypes.inline}
                courseId={context.courseId}
                onInsert={(resource) => {
                  dismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.guid === resource.id);
                  if (found !== undefined) {
                    onInsert(new contentTypes.WbInline().with({ idref: found.id }));
                  }
                }}
                onCancel={dismissModal}
              />)
            }
            tooltip="Insert Inline Assessment"
            disabled={!parentSupportsElementType('wb:inline')}>
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => displayModal(
              <ResourceSelection 
                filterPredicate={(
                  res: persistence.CourseResource): boolean => 
                    res.type === LegacyTypes.assessment2}
                courseId={context.courseId}
                onInsert={(resource) => {
                  dismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.guid === resource.id);
                  if (found !== undefined) {
                    onInsert(new contentTypes.Activity().with({ idref: found.id }));
                  }
                }}
                onCancel={dismissModal}
              />)
            }
            tooltip="Insert Activity"
            disabled={!parentSupportsElementType('activity')}>
          <i className={'fa fa-check'}/>
        </ToolbarButton>
      </ToolbarLayout.Inline>
    </React.Fragment>
  );
});
