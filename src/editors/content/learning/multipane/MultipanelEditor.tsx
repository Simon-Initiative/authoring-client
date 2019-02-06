import * as React from 'react';
import { Multipanel as MultipanelType } from 'data/content/workbook/multipanel/multipanel';
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
import { injectSheet, classNames, JSSStyles, JSSProps } from 'styles/jss';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { TitleTextEditor } from '../contiguoustext/TitleTextEditor';
import colors from 'styles/colors';
import { Maybe } from 'tsmonad';
import flatui from 'styles/palettes/flatui';
import { Button } from 'editors/content/common/Button';
import { disableSelect } from 'styles/mixins';
import { retrieveDocument } from 'data/persistence';
import { AssessmentModel } from 'data/models';
import { Panel } from 'data/content/workbook/multipanel/panel';
import {
  ContentElements, MATERIAL_ELEMENTS, ELEMENTS_MIXED, CONTROL_ELEMENTS,
} from 'data/content/common/elements';
import guid from 'utils/guid';
import { TextInput } from 'editors/content/common/controls';

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
    backgroundColor: 'rgba(46, 204, 113,0.1)',
    border: [1, 'solid', 'rgba(46, 204, 113,1.0)'],
    borderLeft: [4, 'solid', 'rgba(46, 204, 113,1.0)'],
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
    extends: [disableSelect],
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

export interface MultipanelProps
  extends AbstractContentEditorProps<MultipanelType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface MultipanelState {
  selectedPanel: string;
  isLoadingActivity: boolean;
  activityPageCount: Maybe<number>;
}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class Multipanel
  extends AbstractContentEditor<MultipanelType,
  StyledComponentProps<MultipanelProps>, MultipanelState> {
  panelTabScrollDiv: HTMLElement;

  constructor(props: MultipanelProps) {
    super(props);

    this.state = {
      selectedPanel: props.model.panels.first()
        && props.model.panels.first().guid,
      isLoadingActivity: false,
      activityPageCount: Maybe.nothing(),
    };
  }

  componentDidMount() {
    const { model, context } = this.props;

    Maybe.maybe(context.courseModel.resourcesById.get(model.inline.idref))
      .lift((inline) => {
        retrieveDocument(context.courseId, inline.guid)
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

  shouldComponentUpdate(nextProps: StyledComponentProps<MultipanelProps>): boolean {
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
                  {panel.title.valueOr(`Panel ${i + 1}`)}
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
                  label="Title"
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
    const { selectedPanel, activityPageCount } = this.state;

    const resource = this.props.context.courseModel.resourcesById.get(model.inline.idref);
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
              panels={model.panels}
              context={context}
              services={services}
              onEdit={(imageHotspot, src?: Object) =>
                onEdit(model.with({ imageHotspot }), src)
              }
              onEditIntroPanelRef={introPanelRef =>
                onEdit(model.with({ introPanelRef }))
              } />
            <div className={classes.hotspotDetails}>

            </div>
          </div>
          {this.renderPanelView(currentPanel)}
        </div>
        <h5 style={{ marginTop: 20 }}>Activity</h5>
        <div className={classes.bottom}>
          <div className={classes.wbinline}>
            <h5><i className="fa fa-flask"/> {title}</h5>
            <div className={classes.wbinlineButtons}>
              <button
                onClick={() => {

                }}
                type="button"
                style={{ colors: flatui.emerald }}
                className="btn btn-link">
                Change Activity
              </button>
              <button
                onClick={() => {
                  const guid = context.courseModel.resourcesById
                    .get(model.inline.idref).guid;
                  services.viewDocument(guid, this.props.context.courseId);
                }}
                type="button"
                style={{ colors: flatui.emerald }}
                className="btn btn-link">
                Edit Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
