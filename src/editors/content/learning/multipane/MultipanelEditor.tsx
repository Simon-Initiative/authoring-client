import * as React from 'react';
import {
  Multipanel,
} from 'data/content/workbook/multipanel/multipanel';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { DiscoverableId } from 'types/discoverable';
import { ImageHotspotEditor } from './imagehotspot/ImageHotspotEditor';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { TitleTextEditor } from '../contiguoustext/TitleTextEditor';
import colors from 'styles/colors';
import { Maybe } from 'tsmonad';
import flatui from 'styles/palettes/flatui';
import { Button } from 'editors/content/common/Button';
import { disableSelect } from 'styles/mixins';
import { retrieveDocument } from 'data/persistence';
import { AssessmentModel, ContentModel } from 'data/models';
import { Panel } from 'data/content/workbook/multipanel/panel';
import {
  ContentElements, MATERIAL_ELEMENTS, ELEMENTS_MIXED, CONTROL_ELEMENTS,
} from 'data/content/common/elements';
import guid from 'utils/guid';
import { TextInput } from 'editors/content/common/controls';
import { collectInlinesNested } from 'utils/course';
import ResourceSelection from 'utils/selection/ResourceSelection.controller';
import { LegacyTypes } from 'data/types';
import { ContentElement } from 'data/content/common/interfaces';
import { ResourceState } from 'data/content/resource';

const BORDER_STYLE = '1px solid #ced4da';

const styles: JSSStyles = {
  MultipanelEditor: {
    display: 'flex',
    flexDirection: 'column',
    margin: [0, 6],
  },
  title: {
    margin: [10, 0],
  },
  top: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  bottom: {
    backgroundColor: 'rgba(60, 180, 75, 0.1)',
    border: [1, 'solid', 'rgba(60, 180, 75, 1.0)'],
    borderLeft: [4, 'solid', 'rgba(60, 180, 75, 1.0)'],
    borderRadius: 4,
    margin: [6, 0],
  },
  hotspotEditor: {

  },
  panelView: {
    flex: 1,
    width: '0%',
  },
  panelTabScroll: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    minWidth: '0%',
    overflow: 'scroll',
  },
  panelTabs: {
    display: 'flex',
    flexDirection: 'row',
    borderTop: BORDER_STYLE,
    height: 38,

    '& ::-webkit-scrollbar': {
      display: 'none',
    },
  },
  panelTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    background: '#fafafa',
    borderRight: BORDER_STYLE,
    borderBottom: BORDER_STYLE,
    fontSize: 12,
    padding: [10, 6],
    maxWidth: 180,
    cursor: 'pointer',

    '&:hover $panelTabName': {
      color: colors.hover,
    },
  },
  panelTabName: {
    extend: [disableSelect],
    flex: 1,
    overflow: 'hidden',
    flexFlow: 'row nowrap',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: 40,
  },
  removePanelButton: {
    marginLeft: 4,
    padding: [0, 6],
    cursor: 'default',
    fontSize: 14,
    marginTop: -3,

    '&:hover': {
      color: colors.remove,
    },
  },
  removePanelButtonDisabled: {
    color: colors.gray,

    '&:hover': {
      color: colors.gray,
    },
  },
  activePanelTab: {
    background: 'inherit',
    borderBottom: 'none',
    fontWeight: 600,
    cursor: 'default',

    '&:hover': {
      color: 'inherit',
    },
  },
  panelTabSpacer: {
    flex: 1,
    cursor: 'default',
  },
  addPanelButton: {
    fontSize: 12,
    padding: 4,
    borderBottom: BORDER_STYLE,
    borderLeft: BORDER_STYLE,
    borderRight: BORDER_STYLE,
    textOverflow: 'inherit',
  },
  tabContent: {
    paddingLeft: 30,
  },
  contentTitle: {
    display: 'flex',
    flexDirection: 'row',
    padding: [10, 0],
  },
  contentTitleLabel: {
    marginRight: 10,
    paddingTop: 2,
    fontWeight: 600,
  },
  hotspotSelection: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.grayDark,
    marginBottom: 10,

    '& button': {
      padding: [0, 12],
      verticalAlign: 'baseline',
    },
  },
  content: {

  },
  wbinline: {
    padding: 6,
  },
  wbinlineButtons: {
    display: 'flex',
    flexDirection: 'row',
  },
};

export interface MultipanelEditorProps
  extends AbstractContentEditorProps<Multipanel> {
  documentModel: ContentModel;
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
  onDisplayModal: (component) => void;
  onDismissModal: () => void;
}

export interface MultipanelEditorState {
  selectedPanel: string;
  isLoadingActivity: boolean;
  activityPageCount: Maybe<number>;
}

type StyledMultipanelEditorProps = StyledComponentProps<MultipanelEditorProps, typeof styles>;

/**
 * The content editor for contiguous text.
 */
class MultipanelEditor
  extends AbstractContentEditor<Multipanel,
  StyledMultipanelEditorProps, MultipanelEditorState> {
  panelTabScrollDiv: HTMLElement;

  constructor(props: StyledMultipanelEditorProps) {
    super(props);

    this.state = {
      selectedPanel: props.model.panels.first()
        && props.model.panels.first().guid,
      isLoadingActivity: false,
      activityPageCount: Maybe.nothing(),
    };
  }

  componentDidMount() {
    this.fetchActivityDetails();
  }

  fetchActivityDetails() {
    const { model, context } = this.props;

    this.setState({
      isLoadingActivity: true,
      activityPageCount: Maybe.nothing<number>(),
    });

    Maybe.maybe(context.courseModel.resourcesById.get(model.inline.idref.value()))
      .lift((inline) => {
        retrieveDocument(context.courseModel.idvers, inline.id)
          .then((inline) => {
            this.setState({
              isLoadingActivity: false,
              activityPageCount: Maybe.just(
                (inline.model as AssessmentModel).pages.size,
              ),
            });
          })
          .catch((err) => {
            this.setState({
              isLoadingActivity: false,
            });
          });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model.inline.idref !== nextProps.model.inline.idref) {
      this.fetchActivityDetails();
    }
  }

  shouldComponentUpdate(nextProps: StyledMultipanelEditorProps): boolean {
    return true;
  }

  onTitleEdit = (ct: contentTypes.ContiguousText, sourceObject) => {
    const { model, onEdit } = this.props;

    const title = model.title.valueOr(contentTypes.Title.fromText(''));

    onEdit(
      model.with({
        title: Maybe.just(title.with({
          text: title.text.with({
            content: title.text.content.set(ct.guid, ct),
          }),
        })),
      }),
      sourceObject,
    );
  }

  onPanelEdit = (panel: Panel, sourceObject?) => {
    const { model, onEdit } = this.props;

    onEdit(
      model.with({
        panels: model.panels.map(p => p.guid === panel.guid ? panel : p,
        ).toList(),
      }),
      sourceObject,
    );
  }

  onAddPanel = () => {
    const { model, onEdit } = this.props;

    const newPanel = new Panel({
      title: Maybe.just(`New Panel ${model.panels.size + 1}`),
      content: ContentElements.fromText(
        '',
        guid(),
        [...MATERIAL_ELEMENTS, ...ELEMENTS_MIXED, ...CONTROL_ELEMENTS],
      ),
    });

    onEdit(
      model.with({
        panels: model.panels.push(newPanel),
      }),
    );

    this.setState(
      {
        selectedPanel: newPanel.guid,
      },
      () => setImmediate(this.scrollToLastTab),
    );
  }

  onRemovePanel = (id: string) => {
    const { model, onEdit } = this.props;

    // safeguard, we can never have less than 1 panel
    if (model.panels.size <= 1) return;

    // find a panel that isnt this one to replace refs with.
    // because we always have at least one panel, this is guaranteed to exist
    const swapPanel = model.panels.find(p => p.id !== id);

    onEdit(
      model.with({
        // remove panel
        panels: model.panels.filter(p => p.id !== id).toList(),
        // remove all refs to this panel
        introPanelRef: model.introPanelRef.bind(
          panelRef => panelRef === id ? Maybe.nothing() : Maybe.just(panelRef),
        ),
        imageHotspot: model.imageHotspot.with({
          hotspots: model.imageHotspot.hotspots.map(
            hotspot => hotspot.with({
              panelRef: hotspot.panelRef === id ? swapPanel.id : hotspot.panelRef,
            }),
          ).toOrderedMap(),
        }),
      }),
    );

    setImmediate(() =>
      this.setState({
        selectedPanel: swapPanel.guid,
      }),
    );
  }

  onSelectInlineActivity() {
    const { model, context, documentModel, onDisplayModal, onDismissModal, onEdit } = this.props;

    const existingInlines = collectInlinesNested(documentModel);

    return onDisplayModal(
      <ResourceSelection
        title="Select an Assessment for Hotspot Activity"
        filterPredicate={(res: contentTypes.Resource): boolean =>
          res.type === LegacyTypes.inline
          && res.resourceState !== ResourceState.DELETED
          && !existingInlines.has(res.id.value())}
        courseId={context.courseModel.guid}
        noResourcesMessage={
          <React.Fragment>
            No assessments are available for this activity.
            <br />
            Please create a new formative assessment or remove an existing
            reference from this page before adding another one.
          </React.Fragment>
        }
        onInsert={(resource) => {
          onDismissModal();
          const resources = context.courseModel.resources.toArray();
          const found = resources.find(r => r.id === resource.id);
          if (found !== undefined) {
            onEdit(model.with({
              inline: model.inline.with({
                idref: found.id,
              }),
            }));
          }
        }}
        onCancel={onDismissModal}
      />);
  }

  scrollToLastTab = () => {
    if (this.panelTabScrollDiv) {
      this.panelTabScrollDiv.scrollLeft = this.panelTabScrollDiv.scrollWidth;
    }
  }

  renderSidebar() {
    return (
      <SidebarContent title="Multipanel">
      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Multipanel" highlightColor={CONTENT_COLORS.Multipanel}>
      </ToolbarGroup>
    );
  }

  renderPanelView(currentPanel: Panel) {
    const { classes, editMode, model } = this.props;
    const { selectedPanel } = this.state;

    return (
      <div className={classes.panelView}>
        <div className={classes.panelTabs}>
          <div
            className={classes.panelTabScroll}
            ref={(ref) => { this.panelTabScrollDiv = ref; }}>
            {model.panels.toArray().map((panel, i) => (
              <div
                key={panel.guid}
                className={classNames([
                  classes.panelTab,
                  selectedPanel === panel.guid && classes.activePanelTab])}
                onClick={() => this.setState({
                  selectedPanel: panel.guid,
                })}>
                <div className={classes.panelTabName}>
                  {panel.title.caseOf({
                    just: title => title !== ''
                      ? title
                      : `Panel ${i + 1}`,
                    nothing: () => `Panel ${i + 1}`,
                  })}
                </div>
                <div
                  className={classNames([
                    classes.removePanelButton,
                    model.panels.size <= 1 && classes.removePanelButtonDisabled,
                  ])}
                  onClick={() => model.panels.size > 1 && this.onRemovePanel(panel.id)}>
                  <i className="fa fa-times" />
                </div>
              </div>
            ))}
          </div>
          <div className={classNames([classes.addPanelButton])}>
            <Button
              type="link"
              editMode={editMode}
              onClick={this.onAddPanel}>
              <i className="fa fa-plus-circle" /> Add
            </Button>
          </div>
        </div>
        {currentPanel && (
          <div className={classes.tabContent}>
            <div className={classes.contentTitle}>
              <div className={classes.contentTitleLabel}>
                Title:
                </div>
              <TextInput
                editMode={editMode}
                label="Enter a title for this panel"
                type="text"
                value={currentPanel.title.valueOr('')}
                onEdit={text =>
                  this.onPanelEdit(
                    currentPanel.with({
                      title: Maybe.maybe(text as string),
                    }),
                  )} />
            </div>
            <div className={classes.content}>
              <ContentContainer
                activeContentGuid={null}
                hover={null}
                onUpdateHover={() => { }}
                {...this.props}
                model={currentPanel.content}
                onEdit={(updated, src) =>
                  this.onPanelEdit(
                    currentPanel.with({
                      content: updated,
                    }),
                    src,
                  )} />
            </div>
          </div>
        )}
      </div>
    );
  }

  renderMain(): JSX.Element {
    const { classes, className, context, services, editMode, model, onEdit } = this.props;
    const { selectedPanel, activityPageCount, isLoadingActivity } = this.state;

    const resource = this.props.context.courseModel.resourcesById.get(model.inline.idref.value());
    const title = resource === undefined ? 'Loading...' : resource.title;

    const currentPanel = model.panels.find(p => p.guid === selectedPanel);

    return (
      <div className={classNames(['MultipanelEditor', classes.MultipanelEditor, className])}>
        <TitleTextEditor
          className={classes.title}
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={(model.title.valueOr(contentTypes.Title.fromText(''))
            .text.content.first() as contentTypes.ContiguousText)}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20, fontWeight: 600 }} />
        <div className={classes.top}>
          <div className={classes.hotspotEditor}>
            <ImageHotspotEditor
              editMode={editMode}
              model={model.imageHotspot}
              introPanelRef={model.introPanelRef}
              activityPageCount={activityPageCount}
              isLoadingActivity={isLoadingActivity}
              panels={model.panels}
              context={context}
              services={services}
              onEdit={(imageHotspot, src) =>
                onEdit(model.with({ imageHotspot }), src as ContentElement)
              }
              onEditIntroPanelRef={introPanelRef =>
                onEdit(model.with({ introPanelRef }))
              } />
            <div className={classes.hotspotDetails}>

            </div>
          </div>
          {this.renderPanelView(currentPanel)}
        </div>
        <h5 style={{ marginTop: 20 }}>Hotspot Activity</h5>
        <div className={classes.bottom}>
          <div className={classes.wbinline}>
            <h5><i
              className="fa fa-flask"
              style={{ color: CONTENT_COLORS.WbInline }} /> {title}</h5>
            <div className={classes.wbinlineButtons}>
              <button
                onClick={() => {
                  services.viewDocument(model.inline.idref, this.props.context.courseModel.idvers,
                    Maybe.just(this.props.context.orgId));
                }}
                type="button"
                style={{ colors: flatui.emerald } as React.CSSProperties}
                className="btn btn-link">
                Edit Activity
              </button>
              <button
                onClick={() => this.onSelectInlineActivity()}
                type="button"
                style={{ colors: flatui.emerald } as React.CSSProperties}
                className="btn btn-link">
                Change Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const StyledMultipanelEditor = withStyles<MultipanelEditorProps>(styles)(MultipanelEditor);
export { StyledMultipanelEditor as MultipanelEditor };
