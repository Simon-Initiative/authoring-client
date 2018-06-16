import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentModel, AssessmentModel } from 'data/models';
import { injectSheet, JSSProps } from 'styles/jss';
import { ToolbarLayout } from './ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import {
  ToolbarWideMenu, ToolbarButtonMenuItem, ToolbarQuadMenu,
  ToolbarButtonMenuForm, ToolbarButtonMenuDivider,
} from './ToolbarButtonMenu';
import { AppContext } from 'editors/common/AppContext';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { LegacyTypes } from 'data/types';
import { CourseModel } from 'data/models/course';
import { selectAudio } from 'editors/content/learning/AudioEditor';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { selectVideo } from 'editors/content/learning/VideoEditor';
import { selectFile } from 'editors/content/learning/file';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import guid from 'utils/guid';
import { ContentElement } from 'data/content/common/interfaces';
import { styles } from './InsertToolbar.style';
import { Resource, ResourceState } from 'data/content/resource';
import { Title } from 'data/content/learning/title';
import { Maybe } from 'tsmonad';
import { findNodes } from 'data/models/utils/workbook';

const APPLET_ICON = require('../../../assets/java.png');
const FLASH_ICON = require('../../../assets/flash.jpg');
const DIRECTOR_ICON = require('../../../assets/director.png');
const UNITY_ICON = require('../../../assets/unity.png');
const WOLFRAM_ICON = require('../../../assets/wolfram.png');

const imgSize = 24;

const TableCreation = require('editors/content/learning/table/TableCreation.bs').jsComponent;

export interface InsertToolbarProps {
  onInsert: (content: Object) => void;
  requestLatestModel: () => Promise<ContentModel>;
  parentSupportsElementType: (type: string) => boolean;
  context: AppContext;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onCreateNew: (model: ContentModel) => Promise<Resource>;
  resourcePath: string;
  courseModel: CourseModel;
}


export interface InsertToolbarState {
  isWorkbookPage: boolean;
}

function collectInlines(model: ContentModel) : Immutable.Map<string, ContentElement> {

  if (model.modelType === 'WorkbookPageModel') {

    const found = findNodes(model, (n) => {
      return n.contentType === 'WbInline';
    })
    .map(e => [e.idref, e]);

    return Immutable.Map<string, ContentElement>(found);
  }
  return Immutable.Map<string, ContentElement>();
}

/**
 * InsertToolbar React Component
 */
@injectSheet(styles)
export class InsertToolbar
  extends React.Component<InsertToolbarProps & JSSProps, InsertToolbarState> {

  constructor(props) {
    super(props);

    // Assume that this is not a workbook page, until
    // we find out
    this.state = { isWorkbookPage: false };
  }

  componentDidMount() {
    this.props.requestLatestModel().then((model) => {
      this.setState({ isWorkbookPage:
        model.type === LegacyTypes.workbook_page,
      });
    });
  }

  render() {
    const { onInsert, parentSupportsElementType, resourcePath, context,
      courseModel, onDisplayModal, onDismissModal, requestLatestModel,
      onCreateNew } = this.props;

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
        .with({
          rows: Immutable.OrderedMap<string, contentTypes.Row>(rows),
        }));
    };

    const supportsAtLeastOne = (...elements) => elements.some(e => parentSupportsElementType(e));

    // Force the user to pick a file, then mutate the object with the given with function
    // using the supplied parameter name
    const pickFileThenInsert = (obj: any, paramName: string) => {
      selectFile('', resourcePath, courseModel, onDisplayModal, onDismissModal)
        .then((src) => {
          const params = {};
          params[paramName] = src;
          onInsert(obj.with(params));
        });
    };

    const imageButton = <ToolbarButton
      className="btnQuad"
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
      <i className={'fa fa-image'} />
    </ToolbarButton>;

    const audioButton = <ToolbarButton
      className="btnQuad"
      onClick={() => {
        selectAudio(null, resourcePath, courseModel, onDisplayModal, onDismissModal)
          .then((audio) => {
            if (audio !== null) {
              onInsert(audio);
            }
          });
      }}
      tooltip="Insert Audio"
      disabled={!parentSupportsElementType('audio')}>
      <i className={'fa fa-volume-up'} />
    </ToolbarButton>;

    const youtubeButton = <ToolbarButton
      className="btnQuad"
      onClick={() => onInsert(new contentTypes.YouTube())}
      tooltip="Insert YouTube Video"
      disabled={!parentSupportsElementType('youtube')}>
      <i className={'fa fa-youtube'} />
    </ToolbarButton>;

    const iFrameButton = <ToolbarButton
      className="btnQuad"
      onClick={() => onInsert(new contentTypes.IFrame())}
      tooltip="Insert Webpage"
      disabled={!parentSupportsElementType('iframe')}>
      <i className={'fa fa-window-maximize'} />
    </ToolbarButton>;

    const figureButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.Figure())}
      tooltip="Insert Figure"
      disabled={!parentSupportsElementType('figure')}>
      <i className={'fa fa-address-card'} />
    </ToolbarButton>;

    const quoteButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.BlockQuote()
        .with({
          text: contentTypes.ContiguousText.fromText('Quote', '')
            .with({ mode: ContiguousTextMode.SimpleText }),
        }))}
      tooltip="Insert Quote"
      disabled={!parentSupportsElementType('quote')}>
      <i className={'fa fa-quote-right'} />
    </ToolbarButton>;

    const codeBlockButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.CodeBlock())}
      tooltip="Insert Code Block"
      disabled={!parentSupportsElementType('codeblock')}>
      <i className={'fa fa-code'} />
    </ToolbarButton>;

    const formulaButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.BlockFormula().with({
        text: contentTypes.ContiguousText.fromText('Formula', '')
          .with({ mode: ContiguousTextMode.SimpleText }),
      }))}
      tooltip="Insert Formula"
      disabled={!parentSupportsElementType('formula')}>
      <i className="unicode-icon">&#8721;</i>
    </ToolbarButton>;

    return (
      <React.Fragment>

        <ToolbarLayout.Inline>
          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarButton
              size={ToolbarButtonSize.Wide}
              onClick={() => onInsert(contentTypes.ContiguousText.fromText('', guid()))}
              disabled={!parentSupportsElementType('p')}>
              <i className="unicode-icon">T</i> Text
            </ToolbarButton>
            <ToolbarWideMenu
              icon={<i className={'fa fa-table'} />}
              label={'Table'}
              disabled={!parentSupportsElementType('table')}>
              <ToolbarButtonMenuForm>
                <TableCreation onTableCreate={onTableCreate.bind(this, onInsert)} />
              </ToolbarButtonMenuForm>
            </ToolbarWideMenu>
          </ToolbarLayout.Column>

          <ToolbarQuadMenu
            ulComponent={imageButton}
            urComponent={youtubeButton}
            llComponent={audioButton}
            lrComponent={iFrameButton}
            disabled={!supportsAtLeastOne(
              'image', 'audio', 'video', 'youtube', 'iframe',
              'applet', 'flash', 'director', 'mathematica', 'pannopto', 'unity')}
          >
            <ToolbarButtonMenuForm>
              <small className="text-muted">Media elements</small>
            </ToolbarButtonMenuForm>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuItem
              onClick={() => {
                selectVideo(null, resourcePath, courseModel, onDisplayModal, onDismissModal)
                  .then((video) => {
                    if (video !== null) {
                      onInsert(video);
                    }
                  });
              }}
              disabled={!parentSupportsElementType('video')}>
              <i style={{ width: 22 }} className={'fa fa-film'} />OLI hosted video
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuForm>
              <small className="text-muted">Third party media extensions</small>
            </ToolbarButtonMenuForm>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('mathematica')}
              onClick={() => pickFileThenInsert(new contentTypes.Mathematica(), 'src')}>
              <img src={WOLFRAM_ICON} height={imgSize} width={imgSize} /> Wolfram Mathematica
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('applet')}
              onClick={() => pickFileThenInsert(new contentTypes.Applet(), 'archive')}>
              <img src={APPLET_ICON} height={imgSize} width={imgSize} /> Java Applet
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('flash')}
              onClick={() => pickFileThenInsert(new contentTypes.Flash(), 'src')}>
              <img src={FLASH_ICON} height={imgSize} width={imgSize} /> Adobe Flash
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('director')}
              onClick={() => pickFileThenInsert(new contentTypes.Director(), 'src')}>
              <img src={DIRECTOR_ICON} height={imgSize} width={imgSize} /> Adobe Director
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('panopto')}
              onClick={() => pickFileThenInsert(new contentTypes.Panopto(), 'src')}>
              <i style={{ width: 22 }} className={'fa fa-play'} /> Panopto
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!parentSupportsElementType('unity')}
              onClick={() => pickFileThenInsert(new contentTypes.Unity(), 'src')}>
              <img src={UNITY_ICON} height={imgSize} width={imgSize} /> Unity
            </ToolbarButtonMenuItem>
          </ToolbarQuadMenu>

          <ToolbarQuadMenu
            ulComponent={quoteButton}
            urComponent={codeBlockButton}
            llComponent={formulaButton}
            lrComponent={figureButton}
            disabled={!supportsAtLeastOne(
              'definition', 'example')}
          >
            <ToolbarButtonMenuForm>
              <small className="text-muted">Curriculum elements</small>
            </ToolbarButtonMenuForm>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuItem
              onClick={() => onInsert(new contentTypes.Example())}
              disabled={!parentSupportsElementType('example')}>
              <i style={{ width: 22 }} className={'fa fa-bar-chart'} /> Example
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              onClick={() => {

                const material = contentTypes.Material.fromText('', '');
                const meaning = new contentTypes.Meaning().with({
                  material,
                });
                const definition = new contentTypes.Definition();

                onInsert(definition
                  .with({ meaning: definition.meaning.set(meaning.guid, meaning) }));
              }}
              disabled={!parentSupportsElementType('definition')}>
              <i style={{ width: 22 }} className={'fa fa-book'} /> Definition
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              onClick={() => {
                const speakerId = guid();
                const lineId = guid();

                const speaker = new contentTypes.Speaker({
                  guid: speakerId, id: speakerId, title: Maybe.just('Speaker 1'),
                });
                const speakers =
                  Immutable.OrderedMap<string, contentTypes.Speaker>([[speakerId, speaker]]);

                const material = contentTypes.Material.fromText('Empty text block', '');
                const line = new contentTypes.Line({
                  guid: lineId, id: Maybe.just(lineId), speaker: speakerId, material,
                });
                const lines = Immutable.OrderedMap<string, contentTypes.Line>([[lineId, line]]);

                const dialog = new contentTypes.Dialog({ speakers, lines });
                onInsert(dialog);
              }}
              disabled={!parentSupportsElementType('dialog')}>
              <i style={{ width: 22 }} className={'fa fa-comments'} /> Dialog
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              onClick={() => {
                const header1 = new contentTypes.CellHeader();
                const header2 = new contentTypes.CellHeader();
                const header3 = new contentTypes.CellHeader();
                const conjugate = new contentTypes.Conjugate()
                  .with({
                    content: ContiguousText.fromText(
                      'conjugate', guid(), ContiguousTextMode.SimpleText),
                  });
                const one = new contentTypes.Cr().with({
                  cells: Immutable.OrderedMap<string, contentTypes.ConjugationCell>()
                    .set(header1.guid, header1)
                    .set(header2.guid, header2),
                });
                const two = new contentTypes.Cr().with({
                  cells: Immutable.OrderedMap<string, contentTypes.ConjugationCell>()
                    .set(header3.guid, header3)
                    .set(conjugate.guid, conjugate),
                });
                const rows = Immutable.OrderedMap<string, contentTypes.Cr>()
                  .set(one.guid, one)
                  .set(two.guid, two);
                const conjugation = new contentTypes.Conjugation().with({
                  rows,
                });

                onInsert(conjugation);
              }}
              disabled={!parentSupportsElementType('conjugation')}>
              <i style={{ width: 22 }} className={'fa fa-language'} /> Conjugation
            </ToolbarButtonMenuItem>
          </ToolbarQuadMenu>

          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarWideMenu
              icon={<i className={'fa fa-list'} />}
              label={'Lists'}
              disabled={!supportsAtLeastOne(
                'ul', 'ol')}>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const li = new contentTypes.Li();
                  onInsert(new contentTypes.Ol()
                    .with({
                      listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
                    }));
                }}
                disabled={!parentSupportsElementType('ol')}>
                <i style={{ width: 22 }} className={'fa fa-list-ol'} /> Ordered list
              </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const li = new contentTypes.Li();
                  onInsert(new contentTypes.Ul()
                    .with({
                      listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
                    }));
                }}
                disabled={!parentSupportsElementType('ul')}>
                <i style={{ width: 22 }} className={'fa fa-list-ul'} /> Unordered list
              </ToolbarButtonMenuItem>
            </ToolbarWideMenu>

            <ToolbarWideMenu
              icon={<i className={'fa fa-graduation-cap'} />}
              label={'Learning'}
              disabled={!this.state.isWorkbookPage || !supportsAtLeastOne(
                'wb:inline', 'activity', 'composite_activity')}>
              <ToolbarButtonMenuItem
                onClick={() => {

                  requestLatestModel()
                  .then((model) => {

                    const existingInlines = collectInlines(model);

                    return onDisplayModal(
                    <ResourceSelection
                      filterPredicate={(res: Resource): boolean =>
                        res.type === LegacyTypes.inline
                          && res.resourceState !== ResourceState.DELETED
                          && !existingInlines.has(res.id)}
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
                    />);
                  });
                }}
                disabled={!parentSupportsElementType('wb:inline')}>
                <i style={{ width: 22 }} className={'fa fa-check'} /> Insert existing assessment...
              </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const model = new AssessmentModel({
                    type: LegacyTypes.inline,
                    title: contentTypes.Title.fromText('New Assessment'),
                  });

                  onCreateNew(model)
                  .then((resource) => {
                    onInsert(new contentTypes.WbInline().with({ idref: resource.id }));
                  });

                }}
                disabled={!parentSupportsElementType('wb:inline')}>
                <i style={{ width: 22 }} className={'fa fa-check'} /> Create new assessment
              </ToolbarButtonMenuItem>

              <ToolbarButtonMenuDivider/>

              <ToolbarButtonMenuItem
                onClick={() => onDisplayModal(
                  <ResourceSelection
                    filterPredicate={(res: Resource): boolean =>
                      res.type === LegacyTypes.assessment2
                        && res.resourceState !== ResourceState.DELETED}
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
                disabled={!parentSupportsElementType('activity')}>
                <i style={{ width: 22 }} className={'fa fa-flask'} /> Activity
              </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const composite = new contentTypes.Composite({
                    title: Maybe.just(Title.fromText('Title')),
                  });
                  onInsert(composite);
                }}
                disabled={!parentSupportsElementType('composite_activity')}>
                <i style={{ width: 22 }} className={'fa fa-square-o'} /> Composite activity
              </ToolbarButtonMenuItem>
            </ToolbarWideMenu>
          </ToolbarLayout.Column>
          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarWideMenu
              icon={<i className={'fa fa-clone'} />}
              label={'Layout'}
              disabled={!supportsAtLeastOne(
                'section', 'pullout', 'materials')}>
              <ToolbarButtonMenuItem
                onClick={() => onInsert(new contentTypes.Pullout())}
                disabled={!parentSupportsElementType('pullout')}>
                <i style={{ width: 22 }} className={'fa fa-external-link-square'} /> Pullout
              </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => onInsert(new contentTypes.WorkbookSection())}
                disabled={!parentSupportsElementType('section')}>
                <i style={{ width: 22 }} className={'fa fa-list-alt'} /> Section
              </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
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
                disabled={!parentSupportsElementType('materials')}>
                <i style={{ width: 22 }} className={'fa fa-columns'} /> Horizontal group
              </ToolbarButtonMenuItem>
            </ToolbarWideMenu>

            <ToolbarWideMenu
              icon={<i className={'fa fa-cogs'} />}
              label={'Advanced'}
              disabled={!supportsAtLeastOne(
                'alternatives')}>
              <ToolbarButtonMenuItem
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
                disabled={!parentSupportsElementType('alternatives')}>
                <i style={{ width: 22 }} className={'fa fa-plus-square'} /> Variable content
              </ToolbarButtonMenuItem>
            </ToolbarWideMenu>
          </ToolbarLayout.Column>

        </ToolbarLayout.Inline>
      </React.Fragment>
    );
  }
}
