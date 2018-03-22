import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import * as contentTypes from 'data/contentTypes';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton } from './ToolbarButton';
import { AppContext } from 'editors/common/AppContext';
import ResourceSelection from 'utils/selection/ResourceSelection';
import { LegacyTypes } from 'data/types';
import * as persistence from 'data/persistence';
import { CourseModel } from 'data/models/course';
import { selectAudio } from 'editors/content/media/AudioEditor';
import { selectVideo } from 'editors/content/media/VideoEditor';
import { selectImage } from 'editors/content/media/ImageEditor';

import styles from './InsertToolbar.style';

export interface InsertToolbarProps {
  onInsert: (content: Object) => void;
  parentSupportsElementType: (type: string) => boolean;
  context: AppContext;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  resourcePath: string;
  courseModel: CourseModel;
}

/**
 * InsertToolbar React Stateless Component
 */
export const InsertToolbar = injectSheetSFC<InsertToolbarProps>(styles)(({
  classes, onInsert, parentSupportsElementType, resourcePath, context,
  courseModel, onDisplayModal, onDismissModal,
}: StyledComponentProps<InsertToolbarProps>) => {
  return (
    <React.Fragment>
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.ContiguousText())}
            tooltip="Insert Text Block"
            disabled={!parentSupportsElementType('p')}>
          <i className="unicode-icon">T</i>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              const li = new contentTypes.Li();
              onInsert(new contentTypes.Ol()
              .with({ listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
              }));
            }
          }
            tooltip="Ordered List"
            disabled={!parentSupportsElementType('ol')}>
          <i className={'fa fa-list-ol'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              const li = new contentTypes.Li();
              onInsert(new contentTypes.Ul()
              .with({ listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
              }));
            }
          }
            tooltip="Unordered List"
            disabled={!parentSupportsElementType('ul')}>
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
            onClick={() => {
              selectImage(null, resourcePath, courseModel, onDisplayModal, onDismissModal)
                .then((image) => {
                  if (image !== null) {
                    onInsert(image);
                  }
                });
            }}
            tooltip="Insert Image"
            disabled={!parentSupportsElementType('image')}>
          <i className={'fa fa-image'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              selectAudio(null, resourcePath, courseModel, onDisplayModal, onDismissModal)
                .then((audio) => {
                  if (audio !== null) {
                    onInsert(audio);
                  }
                });
            }}
            tooltip="Insert Audio Clip"
            disabled={!parentSupportsElementType('audio')}>
          <i className={'fa fa-volume-up'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.YouTube())}
            tooltip="Insert YouTube Video"
            disabled={!parentSupportsElementType('youtube')}>
          <i className={'fa fa-youtube'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.IFrame())}
            tooltip="Embed Web Page"
            disabled={!parentSupportsElementType('iframe')}>
          <i className={'fa fa-window-maximize'}/>
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
            onClick={() => onDisplayModal(
              <ResourceSelection
                filterPredicate={(
                  res: persistence.CourseResource): boolean =>
                    res.type === LegacyTypes.inline}
                courseId={context.courseId}
                onInsert={(resource) => {
                  onDismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.guid === resource.id);
                  if (found !== undefined) {
                    onInsert(new contentTypes.WbInline().with({ idref: found.id }));
                  }
                }}
                onCancel={onDismissModal}
              />)
            }
            tooltip="Insert Inline Assessment"
            disabled={!parentSupportsElementType('wb:inline')}>
          <i className={'fa fa-flask'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onDisplayModal(
              <ResourceSelection
                filterPredicate={(
                  res: persistence.CourseResource): boolean =>
                    res.type === LegacyTypes.assessment2}
                courseId={context.courseId}
                onInsert={(resource) => {
                  onDismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.guid === resource.id);
                  if (found !== undefined) {
                    onInsert(new contentTypes.Activity().with({ idref: found.id }));
                  }
                }}
                onCancel={onDismissModal}
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
