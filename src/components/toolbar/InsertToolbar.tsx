import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheetSFC } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarButtonDropdown } from './ToolbarButtonDropdown';
import { AppContext } from 'editors/common/AppContext';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { LegacyTypes } from 'data/types';
import { CourseModel } from 'data/models/course';
import { selectAudio } from 'editors/content/learning/AudioEditor';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { ContiguousTextMode } from 'data/content/learning/contiguous';
import guid from 'utils/guid';
import { styles } from './InsertToolbar.style';
import { Resource } from 'data/content/resource';
import { Title } from 'data/content/learning/title';
import { Maybe } from 'tsmonad';

const TableCreation = require('editors/content/learning/table/TableCreation.bs').jsComponent;

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
}) => {

  const onTableCreate = (onInsert, numRows, numCols) => {

    const rows = [];
    for (let i = 0; i < numRows; i += 1) {
      const cells = [];
      for (let j = 0; j < numCols; j += 1) {
        const cell = new contentTypes.CellData();
        cells.push([cell.guid, cell]);
      }
      const row = new contentTypes.Row().with({
        cells: Immutable.OrderedMap
          <string, contentTypes.CellData | contentTypes.CellHeader>(cells),
      });
      rows.push([row.guid, row]);
    }

    onInsert(new contentTypes.Table()
    .with({ rows: Immutable.OrderedMap<string, contentTypes.Row>(rows),
    }));
  };

  return (
    <React.Fragment>
      <ToolbarLayout.Inline>
        <ToolbarButton
            onClick={() => onInsert(contentTypes.ContiguousText.fromText('', guid())) }
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
        <ToolbarButtonDropdown
            tooltip="Insert Table"
            label={<i className={'fa fa-table'}/>}
            disabled={!parentSupportsElementType('table')}>
          <TableCreation onTableCreate={onTableCreate.bind(this, onInsert)}/>
        </ToolbarButtonDropdown>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.BlockQuote()
              .with({ text: contentTypes.ContiguousText.fromText('Quote', '')
                .with({ mode: ContiguousTextMode.SimpleText }) }))}
            tooltip="Insert Quote"
            disabled={!parentSupportsElementType('quote')}>
          <i className={'fa fa-quote-right'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.CodeBlock())}
            tooltip="Insert Code Block"
            disabled={!parentSupportsElementType('codeblock')}>
          <i className={'fa fa-code'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onInsert(new contentTypes.BlockFormula().with({
              text: contentTypes.ContiguousText.fromText('Formula', '')
                .with({ mode: ContiguousTextMode.SimpleText }),
            }))}
            tooltip="Insert Formula"
            disabled={!parentSupportsElementType('formula')}>
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
            onClick={() => {

              const material = contentTypes.Material.fromText('', '');
              const meaning = new contentTypes.Meaning().with({
                material,
              });
              const definition = new contentTypes.Definition();

              onInsert(definition.with({ meaning: definition.meaning.set(meaning.guid, meaning) }));
            }}
            tooltip="Insert Definition"
            disabled={!parentSupportsElementType('definition')}>
          <i className={'fa fa-book'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {

              const material1 = new contentTypes.Material();
              const material2 = new contentTypes.Material();

              const materials = new contentTypes.Materials().with({
                content: Immutable.OrderedMap<string, contentTypes.Material>()
                  .set(material1.guid, material1)
                  .set(material2.guid, material2),
              });

              onInsert(materials);
            }}
            tooltip="Insert Horizontal Layout"
            disabled={!parentSupportsElementType('materials')}>
          <i className={'fa fa-columns'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              const composite = new contentTypes.Composite({
                title: Maybe.just(Title.fromText('Title')),
              });
              onInsert(composite);
            }}
            tooltip="Insert Composite Activity"
            disabled={!parentSupportsElementType('composite_activity')}>
          <i className={'fa fa-clone'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {
              const alt1 = new contentTypes.Alternative().with({
                value: 'Item-1',
                title: contentTypes.Title.fromText('Item-1'),
              });
              const alt2 = new contentTypes.Alternative().with({
                value: 'Item-2',
                title: contentTypes.Title.fromText('Item-2'),
              });

              const alts = new contentTypes.Alternatives().with({
                content: Immutable.OrderedMap<string, contentTypes.Alternative>()
                  .set(alt1.guid, alt1)
                  .set(alt2.guid, alt2),
              });

              onInsert(alts);
            }}
            tooltip="Insert Variable Content"
            disabled={!parentSupportsElementType('alternatives')}>
          <i className={'fa fa-cogs'}/>
        </ToolbarButton>
        <ToolbarButton
            onClick={() => onDisplayModal(
              <ResourceSelection
                filterPredicate={(
                  res: Resource): boolean =>
                    res.type === LegacyTypes.inline}
                courseId={context.courseId}
                onInsert={(resource) => {
                  onDismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.id === resource.id);
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
                  res: Resource): boolean =>
                    res.type === LegacyTypes.assessment2}
                courseId={context.courseId}
                onInsert={(resource) => {
                  onDismissModal();
                  const resources = context.courseModel.resources.toArray();
                  const found = resources.find(r => r.id === resource.id);
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
