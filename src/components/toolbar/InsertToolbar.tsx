import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ActiveContextState } from 'reducers/active';
import { ContentModel, AssessmentModel } from 'data/models';
import { injectSheet, JSSProps } from 'styles/jss';
import { ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import {
  ToolbarWideMenu, ToolbarButtonMenuItem, ToolbarQuadMenu,
  ToolbarButtonMenuForm, ToolbarButtonMenuDivider,
} from 'components/toolbar/ToolbarButtonMenu';
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
import { styles } from 'components/toolbar/InsertToolbar.style';
import { Resource, ResourceState } from 'data/content/resource';
import { Title } from 'data/content/learning/title';
import { Maybe } from 'tsmonad';
import { collectInlines, collectInlinesNested } from 'utils/course';
import { getContentIcon, insertableContentTypes } from 'editors/content/utils/content';
import { Message } from 'types/messages';
import { selectTargetElement } from 'components/message/selection';
import { FeedbackModel } from 'data/models/feedback';
import { ImageHotspot } from 'data/content/workbook/multipanel/image_hotspot';
import { Hotspot } from 'data/content/workbook/multipanel/hotspot';
import { Panel } from 'data/content/workbook/multipanel/panel';

const APPLET_ICON = require('../../../assets/java.png');
const FLASH_ICON = require('../../../assets/flash.jpg');
const DIRECTOR_ICON = require('../../../assets/director.png');
const UNITY_ICON = require('../../../assets/unity.png');
const WOLFRAM_ICON = require('../../../assets/wolfram.png');

const imgSize = 24;

const TableCreation = require('editors/content/learning/table/TableCreation.bs').jsComponent;

export interface InsertToolbarProps {
  onInsert: (content: Object, context?) => void;
  requestLatestModel: () => Promise<ContentModel>;
  parentSupportsElementType: (type: string) => boolean;
  context: AppContext;
  editMode: boolean;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onCreateNew: (model: ContentModel) => Promise<Resource>;
  resourcePath: string;
  courseModel: CourseModel;
  onShowMessage: (message: Message) => void;
  onDismissMessage: (message: Message) => void;
  content: Maybe<Object>;
  activeContext: ActiveContextState;
}

export interface InsertToolbarState {
  isWorkbookPage: boolean;
}

const createMultipanel = (inline) => {
  let defaultImageHotspot = new ImageHotspot().with({
    src: 'NO_IMAGE_SELECTED',
  });
  const defaultPanel = new Panel();
  const defaultHotspot = new Hotspot().with({
    shape: 'rect',
    activityRef: '1',
    panelRef: defaultPanel.id,
    coords: Immutable.List<number>([
      Math.floor(defaultImageHotspot.width / 2) - 50,
      Math.floor(defaultImageHotspot.height / 2) - 50,
      Math.floor(defaultImageHotspot.width / 2) + 50,
      Math.floor(defaultImageHotspot.height / 2) + 50,
    ]),
  });
  defaultImageHotspot = defaultImageHotspot.with({
    hotspots: defaultImageHotspot.hotspots.set(
      defaultHotspot.guid,
      defaultHotspot,
    ),
  });

  const multipanel = new contentTypes.Multipanel({
    title: Maybe.just(Title.fromText('New Hotspot Activity')),
    inline: new contentTypes.WbInline().with({ idref: inline.id }),
    imageHotspot: defaultImageHotspot,
    panels: Immutable.List<Panel>().push(defaultPanel),
  });

  return multipanel;
};

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
      this.setState({
        isWorkbookPage:
          model.type === LegacyTypes.workbook_page,
      });
    });
  }


  render() {
    const { onInsert, parentSupportsElementType, resourcePath, context, editMode,
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
      disabled={!editMode || !parentSupportsElementType('image')}>
      {getContentIcon(insertableContentTypes.Image)}
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
      disabled={!editMode || !parentSupportsElementType('audio')}>
      {getContentIcon(insertableContentTypes.Audio)}
    </ToolbarButton>;

    const youtubeButton = <ToolbarButton
      className="btnQuad"
      onClick={() => onInsert(new contentTypes.YouTube())}
      tooltip="Insert YouTube Video"
      disabled={!editMode || !parentSupportsElementType('youtube')}>
      {getContentIcon(insertableContentTypes.YouTube)}
    </ToolbarButton>;

    const iFrameButton = <ToolbarButton
      className="btnQuad"
      onClick={() => onInsert(new contentTypes.IFrame())}
      tooltip="Insert Webpage"
      disabled={!editMode || !parentSupportsElementType('iframe')}>
      {getContentIcon(insertableContentTypes.IFrame)}
    </ToolbarButton>;

    const figureButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.Figure())}
      tooltip="Insert Figure"
      disabled={!editMode || !parentSupportsElementType('figure')}>
      {getContentIcon(insertableContentTypes.Figure)}
    </ToolbarButton>;

    const quoteButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.BlockQuote()
        .with({
          text: contentTypes.ContiguousText.fromText('Quote', '')
            .with({ mode: ContiguousTextMode.SimpleText }),
        }))}
      tooltip="Insert Quote"
      disabled={!editMode || !parentSupportsElementType('quote')}>
      {getContentIcon(insertableContentTypes.BlockQuote)}
    </ToolbarButton>;

    const codeBlockButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.CodeBlock())}
      tooltip="Insert Code Block"
      disabled={!editMode || !parentSupportsElementType('codeblock')}>
      {getContentIcon(insertableContentTypes.CodeBlock)}
    </ToolbarButton>;

    const formulaButton = <ToolbarButton
      onClick={() => onInsert(new contentTypes.BlockFormula().with({
        text: contentTypes.ContiguousText.fromText('Formula', '')
          .with({ mode: ContiguousTextMode.SimpleText }),
      }))}
      tooltip="Insert Formula"
      disabled={!editMode || !parentSupportsElementType('formula')}>
      {getContentIcon(insertableContentTypes.BlockFormula)}
    </ToolbarButton>;

    return (
      <React.Fragment>

        <ToolbarLayout.Inline>
          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarButton
              size={ToolbarButtonSize.Wide}
              onClick={() => onInsert(contentTypes.ContiguousText.fromText('', guid()))}
              disabled={!editMode || !parentSupportsElementType('p')}>
              {getContentIcon(insertableContentTypes.ContiguousText)} Text
              </ToolbarButton>
            <ToolbarWideMenu
              icon={getContentIcon(insertableContentTypes.Table)}
              label={'Table'}
              disabled={!editMode || !parentSupportsElementType('table')}>
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
            disabled={!editMode || !supportsAtLeastOne(
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
              disabled={!editMode || !parentSupportsElementType('video')}>
              {getContentIcon(insertableContentTypes.Video, { width: 22 })} OLI hosted video
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuForm>
              <small className="text-muted">Third party media extensions</small>
            </ToolbarButtonMenuForm>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('mathematica')}
              onClick={() => pickFileThenInsert(new contentTypes.Mathematica(), 'src')}>
              <img src={WOLFRAM_ICON} height={imgSize} width={imgSize} /> Wolfram Mathematica
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('applet')}
              onClick={() => pickFileThenInsert(new contentTypes.Applet(), 'archive')}>
              <img src={APPLET_ICON} height={imgSize} width={imgSize} /> Java Applet
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('flash')}
              onClick={() => pickFileThenInsert(new contentTypes.Flash(), 'src')}>
              <img src={FLASH_ICON} height={imgSize} width={imgSize} /> Adobe Flash
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('director')}
              onClick={() => pickFileThenInsert(new contentTypes.Director(), 'src')}>
              <img src={DIRECTOR_ICON} height={imgSize} width={imgSize} /> Adobe Director
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('panopto')}
              onClick={() => pickFileThenInsert(new contentTypes.Panopto(), 'src')}>
              {getContentIcon(insertableContentTypes.Panopto, { width: 22 })} Panopto
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              disabled={!editMode || !parentSupportsElementType('unity')}
              onClick={() => pickFileThenInsert(new contentTypes.Unity(), 'src')}>
              <img src={UNITY_ICON} height={imgSize} width={imgSize} /> Unity
              </ToolbarButtonMenuItem>
          </ToolbarQuadMenu>

          <ToolbarQuadMenu
            ulComponent={quoteButton}
            urComponent={codeBlockButton}
            llComponent={formulaButton}
            lrComponent={figureButton}
            disabled={!editMode || !supportsAtLeastOne(
              'definition', 'example', 'dl')}
          >
            <ToolbarButtonMenuForm>
              <small className="text-muted">Curriculum elements</small>
            </ToolbarButtonMenuForm>
            <ToolbarButtonMenuDivider />
            <ToolbarButtonMenuItem
              onClick={() => onInsert(new contentTypes.Example())}
              disabled={!editMode || !parentSupportsElementType('example')}>
              {getContentIcon(insertableContentTypes.Example, { width: 22 })} Example
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
              disabled={!editMode || !parentSupportsElementType('definition')}>
              {getContentIcon(insertableContentTypes.Definition, { width: 22 })} Definition
              </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              onClick={() => {
                // Create a hierarchy with a definition attached to a term attached to a
                // definition list, then insert the definition list
                // Dl -> Dt -> Dd

                const definition = new contentTypes.Dd().with({ guid: guid() });
                const term = new contentTypes.Dt().with({
                  guid: guid(),
                  definitions: Immutable.OrderedMap<string, contentTypes.Dd>(
                    [[definition.guid, definition]],
                  ),
                });
                const definitionList = new contentTypes.Dl().with({
                  terms: Immutable.OrderedMap<string, contentTypes.Dt>(
                    [[term.guid, term]],
                  ),
                });

                onInsert(definitionList);
              }}
              disabled={!editMode || !parentSupportsElementType('dl')}>
              <i style={{ width: 22 }} className={'fa fa-list-ul'} /> Definition List
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
                  guid: lineId, id: lineId, speaker: speakerId, material,
                });
                const lines = Immutable.OrderedMap<string, contentTypes.Line>([[lineId, line]]);

                const dialog = new contentTypes.Dialog({ speakers, lines });
                onInsert(dialog);
              }}
              disabled={!editMode || !parentSupportsElementType('dialog')}>
              {getContentIcon(insertableContentTypes.Dialog, { width: 22 })} Dialog
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
              disabled={!editMode || !parentSupportsElementType('conjugation')}>
              {getContentIcon(insertableContentTypes.Conjugation, { width: 22 })} Conjugation
            </ToolbarButtonMenuItem>
            <ToolbarButtonMenuItem
              onClick={() => {
                const inquiry = new contentTypes.Inquiry();
                onInsert(inquiry);
              }}
              disabled={!editMode || !parentSupportsElementType('inquiry')}>
              {getContentIcon(insertableContentTypes.Inquiry, { width: 22 })} Inquiry
            </ToolbarButtonMenuItem>
          </ToolbarQuadMenu>

          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarWideMenu
              icon={getContentIcon(insertableContentTypes.Li)}
              label={'Lists'}
              disabled={!editMode || !supportsAtLeastOne(
                'ul', 'ol')}>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const li = new contentTypes.Li();
                  onInsert(new contentTypes.Ol()
                    .with({
                      listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
                    }));
                }}
                disabled={!editMode || !parentSupportsElementType('ol')}>
                {getContentIcon(insertableContentTypes.Ol, { width: 22 })} Ordered list
                </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const li = new contentTypes.Li();
                  onInsert(new contentTypes.Ul()
                    .with({
                      listItems: Immutable.OrderedMap<string, contentTypes.Li>().set(li.guid, li),
                    }));
                }}
                disabled={!editMode || !parentSupportsElementType('ul')}>
                {getContentIcon(insertableContentTypes.Ul, { width: 22 })} Unordered list
                </ToolbarButtonMenuItem>
            </ToolbarWideMenu>

            <ToolbarWideMenu
              icon={<i className={'fa fa-graduation-cap'} />}
              label={'Learning'}
              disabled={!editMode || !this.state.isWorkbookPage || !supportsAtLeastOne(
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
                disabled={!editMode || !parentSupportsElementType('wb:inline')}>
                {getContentIcon(insertableContentTypes.WbInline, { width: 22 })}
                Insert formative assessment
                </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => {
                  const model = new AssessmentModel({
                    type: LegacyTypes.inline,
                    title: contentTypes.Title.fromText('New Formative Assessment'),
                  });

                  onCreateNew(model)
                    .then((resource) => {
                      onInsert(new contentTypes.WbInline().with({ idref: resource.id }));
                    });

                }}
                disabled={!editMode || !parentSupportsElementType('wb:inline')}>
                {getContentIcon(insertableContentTypes.WbInline, { width: 22 })}
                Create formative assessment
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuDivider />

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
                disabled={!editMode || !parentSupportsElementType('activity')}>
                {getContentIcon(insertableContentTypes.Activity, { width: 22 })}
                Insert summative assessment
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuItem
                onClick={() => {
                  const model = new AssessmentModel({
                    type: LegacyTypes.assessment2,
                    title: contentTypes.Title.fromText('New Summative Assessment'),
                  });

                  onCreateNew(model)
                    .then((resource) => {
                      onInsert(new contentTypes.Activity().with({ idref: resource.id }));
                    });

                }}
                disabled={!editMode || !parentSupportsElementType('activity')}>
                {getContentIcon(insertableContentTypes.Activity, { width: 22 })}
                Create summative assessment
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuDivider />

              <ToolbarButtonMenuItem
                onClick={() => onDisplayModal(
                  <ResourceSelection
                    filterPredicate={(res: Resource): boolean =>
                      res.type === LegacyTypes.feedback
                      && res.resourceState !== ResourceState.DELETED}
                    courseId={context.courseId}
                    onInsert={(resource) => {
                      onDismissModal();
                      const resources = context.courseModel.resources.toArray();
                      const found = resources.find(r => r.id === resource.id);
                      if (found !== undefined) {
                        onInsert(new contentTypes.Activity().with({
                          idref: resource.id,
                          purpose: Maybe.just(contentTypes.PurposeTypes.MyResponse),
                        }));
                      }
                    }}
                    onCancel={onDismissModal}
                  />)
                }
                disabled={!editMode || !parentSupportsElementType('activity')}>
                {getContentIcon(insertableContentTypes.Feedback, { width: 22 })}
                Insert feedback assessment
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuItem
                onClick={() => {
                  const model = FeedbackModel.createNew(
                    guid(),
                    'New Feedback Assessment',
                    'This is a course feedback assessment',
                  );

                  onCreateNew(model)
                    .then((resource) => {
                      onInsert(new contentTypes.Activity().with({
                        idref: resource.id,
                        purpose: Maybe.just(contentTypes.PurposeTypes.MyResponse),
                      }));
                    });

                }}
                disabled={!editMode || !parentSupportsElementType('activity')}>
                {getContentIcon(insertableContentTypes.Feedback, { width: 22 })}
                Create feedback assessment
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuDivider />

              <ToolbarButtonMenuItem
                onClick={() => {
                  const composite = new contentTypes.Composite({
                    title: Maybe.just(Title.fromText('Title')),
                  });
                  onInsert(composite);
                }}
                disabled={!editMode || !parentSupportsElementType('composite_activity')}>
                {getContentIcon(insertableContentTypes.Composite, { width: 22 })} Composite activity
                </ToolbarButtonMenuItem>

              <ToolbarButtonMenuItem
                onClick={() => {
                  requestLatestModel()
                    .then((model) => {
                      const existingInlines = collectInlinesNested(model);

                      return onDisplayModal(
                        <ResourceSelection
                          title="Select an Assessment for Hotspot Activity"
                          filterPredicate={(res: Resource): boolean =>
                            res.type === LegacyTypes.inline
                            && res.resourceState !== ResourceState.DELETED
                            && !existingInlines.has(res.id)}
                          courseId={context.courseId}
                          noResourcesMessage={
                            <React.Fragment>
                              No assessments are available for this activity.
                              <br/>
                              Please create a new formative assessment or remove an existing
                              reference from this page before adding another one.
                            </React.Fragment>
                          }
                          onInsert={(resource) => {
                            onDismissModal();
                            const resources = context.courseModel.resources.toArray();
                            const found = resources.find(r => r.id === resource.id);
                            if (found !== undefined) {
                              const multipanel = createMultipanel(found);
                              onInsert(multipanel);
                            }
                          }}
                          onCancel={onDismissModal}
                        />);
                    });
                }}
                disabled={!editMode || !parentSupportsElementType('multipanel')}>
                {getContentIcon(insertableContentTypes.Multipanel, { width: 22 })}
                {' Image hotspot activity'}
                </ToolbarButtonMenuItem>
            </ToolbarWideMenu>
          </ToolbarLayout.Column>
          <ToolbarLayout.Column maxWidth="100px">
            <ToolbarWideMenu
              icon={<i className={'fa fa-clone'} />}
              label={'Layout'}
              disabled={!editMode || !supportsAtLeastOne(
                'section', 'pullout', 'materials')}>
              <ToolbarButtonMenuItem
                onClick={() => onInsert(new contentTypes.Pullout())}
                disabled={!editMode || !parentSupportsElementType('pullout')}>
                {getContentIcon(insertableContentTypes.Pullout, { width: 22 })} Pullout
                </ToolbarButtonMenuItem>
              <ToolbarButtonMenuItem
                onClick={() => onInsert(new contentTypes.WorkbookSection())}
                disabled={!editMode || !parentSupportsElementType('section')}>
                {getContentIcon(insertableContentTypes.Section, { width: 22 })} Section
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
                disabled={!editMode || !parentSupportsElementType('materials')}>
                {getContentIcon(insertableContentTypes.Materials, { width: 22 })} Horizontal group
                </ToolbarButtonMenuItem>
            </ToolbarWideMenu>

            <ToolbarWideMenu
              icon={<i className={'fa fa-cogs'} />}
              label={'Advanced'}
              disabled={!editMode || !supportsAtLeastOne(
                'alternatives', 'command')}>
              <ToolbarButtonMenuItem
                onClick={() => {

                  const snapshot = this.props.activeContext;

                  selectTargetElement()
                    .then((e) => {
                      e.lift((element) => {
                        onInsert(
                          new contentTypes.Command().with({ target: element.id }),
                          snapshot);
                      });
                    });

                }}
                disabled={!editMode || !parentSupportsElementType('command')}>
                {getContentIcon(insertableContentTypes.Command, { width: 22 })}Command
                </ToolbarButtonMenuItem>
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
                disabled={!editMode || !parentSupportsElementType('alternatives')}>
                {getContentIcon(insertableContentTypes.Alternatives, { width: 22 })}Variable content
                </ToolbarButtonMenuItem>
            </ToolbarWideMenu>
          </ToolbarLayout.Column>

        </ToolbarLayout.Inline>
      </React.Fragment>
    );
  }
}
