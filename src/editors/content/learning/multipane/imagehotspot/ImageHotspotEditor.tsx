import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  ImageHotspot as ImageHotspotType, HotspotVisibility,
} from 'data/content/workbook/multipanel/image_hotspot';
import { Hotspot } from 'data/content/workbook/multipanel/hotspot';
import { AppContext } from 'editors/common/AppContext';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { disableSelect } from 'styles/mixins';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { buildUrl } from 'utils/path';
import { RectangleEditor } from 'editors/content/question/imagehotspot/RectangleEditor';
import { CircleEditor } from 'editors/content/question/imagehotspot/CircleEditor';
import { Maybe } from 'tsmonad';
import ModalSelection from 'utils/selection/ModalSelection';
import {
  MediaManager, MIMETYPE_FILTERS, SELECTION_TYPES,
} from 'editors/content/media/manager/MediaManager.controller';
import { modalActions } from 'actions/modal';
import { AppServices } from 'editors/common/AppServices';
import { adjustPath } from 'editors/content/media/utils';
import { fetchImageSize } from 'utils/image';
import { convert } from 'utils/format';
import { PolygonEditor } from 'editors/content/question/imagehotspot/PolygonEditor';
import { Panel } from 'data/content/workbook/multipanel/panel';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown';
import { TextInput } from 'editors/content/common/controls';

const BORDER_STYLE = '1px solid #ced4da';

const DEFAULT_IMAGE = require('./hotspot_instructions.png');

export const styles: JSSStyles = {
  ImageHotspotEditor: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 400,
  },
  imageContainer: {
    border: BORDER_STYLE,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    background: '#fafafa',
    borderBottom: BORDER_STYLE,
    padding: 2,
  },
  imageBody: {
    flex: 1,
  },
  hotspotBody: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.grayLighter,
  },
  hotspots: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  noImage: {
    minHeight: 300,
  },
  removeHotspotButton: {
    color: colors.remove,
  },
  hotspotDetails: {
    padding: 10,
    fontSize: 12,

    '& h3': {
      fontSize: 14,
      fontWeight: 600,
    },
  },
  hotspotTitle: {
    marginBottom: 10,
  },
  panelSelection: {
    marginBottom: 10,
  },
  activityPageSelection: {
    marginBottom: 10,
  },
  hotspotOptionDropdown: {
    '& button': {
      padding: 0,
    },
  },
  selectImgLink: {
    color: colors.selection,
    cursor: 'pointer',

    '&:hover': {
      color: colors.hover,
    },
    '&:active': {
      color: colors.active,
    },
  },
  errorMsg: {
    color: colors.danger,
    margin: [10, 0],
  },
};

const selectImage = (
  src: string, resourcePath: string, courseModel, display, dismiss):
  Promise<string> => {

  return new Promise((resolve, reject) => {
    let selected = src;

    const mediaLibrary =
      <ModalSelection title="Select an image"
        onInsert={() => { dismiss(); resolve(selected); }}
        onCancel={() => dismiss()}>
        <MediaManager
          model={new contentTypes.Image().with({ src })}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.IMAGE}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[src]}
          onSelectionChange={(img) => {
            selected = adjustPath(img[0].pathTo, resourcePath);
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
};

const getFeedbackLabel = (index: number) => {
  return convert.toAlphaNotation(index);
};

export interface ImageHotspotEditorProps {
  className?: string;
  editMode: boolean;
  model: ImageHotspotType;
  introPanelRef: Maybe<string>;
  activityPageCount: Maybe<number>;
  isLoadingActivity: boolean;
  panels: Immutable.List<Panel>;
  context: AppContext;
  services: AppServices;
  onEdit: (model: ImageHotspotType, src?: Object) => void;
  onEditIntroPanelRef: (introPanelRef: Maybe<string>) => void;
}

export interface ImageHotspotEditorState {
  selectedHotspot: Maybe<string>;
}

/**
 * ImageHotspotEditor React Component
 */
@injectSheet(styles)
export class ImageHotspotEditor
    extends React.PureComponent<StyledComponentProps<ImageHotspotEditorProps>,
    ImageHotspotEditorState> {
  svgRef: any;

  constructor(props) {
    super(props);

    this.state = {
      selectedHotspot: Maybe.nothing(),
    };

    this.setSvgRef = this.setSvgRef.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.onEditCoords = this.onEditCoords.bind(this);
    this.onSelectHotspot = this.onSelectHotspot.bind(this);
    this.onAddHotspot = this.onAddHotspot.bind(this);
    this.onRemoveHotspot = this.onRemoveHotspot.bind(this);
  }

  setSvgRef(svgRef) {
    this.svgRef = svgRef;
  }

  onEditCoords(guid: string, coords: Immutable.List<number>) {
    const { model, onEdit } = this.props;

    onEdit(
      model.with({
        hotspots: model.hotspots.set(
          guid,
          model.hotspots.get(guid).with({ coords }),
        ),
      }),
    );
  }

  onSelectHotspot(maybeHotspot: Maybe<Hotspot>) {
    this.setState({
      selectedHotspot: maybeHotspot.lift(hotspot => hotspot.guid),
    });
  }

  onSelectImage() {
    const { context, services, model, onEdit } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectImage(
      model.src,
      context.resourcePath,
      context.courseModel,
      display,
      dismiss,
    ).then(src => fetchImageSize(src, context)
      .then(({ width, height }) => ({
        src,
        width,
        height,
      }))
      .catch(() => Promise.resolve({
        src,
        // default to 600 x 400 on sizing failure
        width: 600,
        height: 400,
      })),
    )
    .then(({ src, width, height }) => {
      // reposition hotspots so they are guaranteed to be in the image
      const hotspots = model.hotspots.map(hotspot =>
        hotspot.shape === 'rect'
          ? hotspot.with({
            coords: Immutable.List<number>([
              Math.floor(width / 2) - 50,
              Math.floor(height / 2) - 50,
              Math.floor(width / 2) + 50,
              Math.floor(height / 2) + 50,
            ]),
          })
        : hotspot.shape === 'circle'
          ? hotspot.with({
            coords: Immutable.List<number>([
              Math.floor(width / 2),
              Math.floor(height / 2),
              100,
            ]),
          })
        // TODO: handle case when hotspot is a polygon
        : hotspot
        ,
      ).toOrderedMap();

      onEdit(
        model.with({
          src,
          width,
          height,
          hotspots,
        }),
      );
    });
  }

  onAddHotspot(shape: string) {
    const { model, panels, onEdit } = this.props;

    // create new hotspot
    let newHotspot = new Hotspot({
      shape,
      activityRef: '1',
      panelRef: panels.first().id,
    });

    // set default coordinates depending on the shape type
    switch (shape) {
      // case 'poly':
      //   break;
      case 'circle':
        newHotspot = newHotspot.with({
          coords: Immutable.List<number>([
            Math.floor(model.width / 2),
            Math.floor(model.height / 2),
            100,
          ]),
        });
        break;
      case 'rect':
      default:
        newHotspot = newHotspot.with({
          coords: Immutable.List<number>([
            Math.floor(model.width / 2) - 50,
            Math.floor(model.height / 2) - 50,
            Math.floor(model.width / 2) + 50,
            Math.floor(model.height / 2) + 50,
          ]),
        });
        break;
    }

    // add new hotspot to the model
    onEdit(
      model.with({
        hotspots: model.hotspots.set(
          newHotspot.guid,
          newHotspot,
        ),
      }),
    );

    // select the new hotspot
    this.setState({
      selectedHotspot: Maybe.just(newHotspot.guid),
    });
  }

  onRemoveHotspot(maybeHotspotGuid: Maybe<string>) {
    const { model, onEdit } = this.props;

    maybeHotspotGuid.lift((hotspotGuid) => {
      onEdit(
        model.with({
          hotspots: model.hotspots.remove(hotspotGuid),
        }),
      );

      // deselect deleted hotspot
      this.setState({
        selectedHotspot: Maybe.nothing<string>(),
      });
    });
  }

  renderPanelDetails() {
    const { classes, model, introPanelRef, panels, onEditIntroPanelRef, onEdit } = this.props;

    return (
      <div className={classes.hotspotDetails}>
        Introduction Panel:
        <Dropdown
          className={classes.hotspotOptionDropdown}
          label={
            introPanelRef.caseOf({
              just: introPanelRef => Maybe.maybe(
                panels.find((panel, i) => panel.id === introPanelRef),
              ).caseOf({
                just: panel => panel.title
                  .valueOrCompute(() =>
                    `Panel ${panels.findIndex(p => p.guid === panel.guid) + 1}`),
                nothing: () => 'Select a Panel',
              }),
              nothing: () => 'Select a Panel',
            })
          }>
          <DropdownItem
            key="none"
            label="(None)"
            onClick={() => {
              onEditIntroPanelRef(Maybe.nothing());
            }} />
          {panels.toArray().map((panel, i) => (
            <DropdownItem
              key={panel.guid}
              label={panel.title.valueOr(`Panel ${i + 1}`)}
              onClick={() => {
                onEditIntroPanelRef(Maybe.just(panel.id));
              }} />
          ))}
        </Dropdown>
        <br />
        Hotspot Visibility:
        <Dropdown
          className={classes.hotspotOptionDropdown}
          label={
            model.visibility.caseOf({
              just: visibility => visibility === 'transparent'
                ? 'Transparent'
                : 'Visible',
              nothing: () => 'Select Visibility',
            })
          }>
          <DropdownItem
            key="visible"
            label="Visible"
            onClick={() => {
              onEdit(model.with({
                visibility: Maybe.just<HotspotVisibility>('visable'),
              }));
            }} />
          <DropdownItem
            key="transparent"
            label="Transparent"
            onClick={() => {
              onEdit(model.with({
                visibility: Maybe.just<HotspotVisibility>('transparent'),
              }));
            }} />
        </Dropdown>
        <br />
        Select a hotspot to set a target panel and activity page.
      </div>
    );
  }

  renderHotspotDetails(hotspot: Hotspot, hotspotIndex: number) {
    const {
      classes, editMode, model, panels, activityPageCount, isLoadingActivity,
      onEdit,
    } = this.props;

    return (
      <div className={classes.hotspotDetails}>
        <h3>Hotspot {getFeedbackLabel(hotspotIndex)}</h3>

        <div className={classes.hotspotTitle}>
          <div className={classes.hotspotTitleLabel}>
            Title:
          </div>
          <TextInput
            editMode={editMode}
            type="text"
            label="Enter a title for this hotspot"
            value={hotspot.title.valueOr('')}
            onEdit={text =>
              onEdit(model.with({
                hotspots: model.hotspots.set(
                  hotspot.guid,
                  hotspot.with({
                    title: text ? Maybe.just(text) : Maybe.nothing(),
                  }),
                ),
              }))
            } />
        </div>
        <div className={classes.panelSelection}>
          Panel:
          <Dropdown
            className={classes.hotspotOptionDropdown}
            label={
              Maybe.maybe(panels.find((panel, i) =>
                panel.id === (
                  hotspot.panelRef)))
                .caseOf({
                  just: panel => panel.title
                    .valueOrCompute(() =>
                      `Panel ${panels.findIndex(p => p.guid === panel.guid) + 1}`),
                  nothing: () => 'Select a Panel',
                })
            }>
            {panels.toArray().map((panel, i) => (
              <DropdownItem
                key={panel.guid}
                label={panel.title.valueOr(`Panel ${i + 1}`)}
                onClick={() => {
                  onEdit(model.with({
                    hotspots: model.hotspots.set(
                      hotspot.guid,
                      hotspot.with({
                        panelRef: panel.id,
                      }),
                    ),
                  }));
                }} />
            ))}
          </Dropdown>
        </div>
        <div className={classes.activityPageSelection}>
          Activity Page:
          {activityPageCount.caseOf({
            just: pageCount => (
              <Dropdown
                className={classes.hotspotOptionDropdown}
                label={`Page ${hotspot.activityRef}`}>
                {[...Array(pageCount).keys()].map(i => (
                  <DropdownItem
                    key={i}
                    label={`Page ${i + 1}`}
                    onClick={() => {
                      onEdit(model.with({
                        hotspots: model.hotspots.set(
                          hotspot.guid,
                          hotspot.with({
                            activityRef: `${i + 1}`,
                          }),
                        ),
                      }));
                    }} />
                ))}
              </Dropdown>
            ),
            nothing: () => isLoadingActivity
              ? (
                <LoadingSpinner message="Loading Activity Pages..." />
              )
              : (
                <div className={classes.errorMsg}>
                  Activity pages failed to load. Please try refreshing the page
                </div>
              ),
          })
          }
        </div>
      </div>
    );
  }

  render() {
    const {
      className, classes, editMode, context, model,
    } = this.props;
    const { selectedHotspot } = this.state;

    return (
      <div
        className={classNames(['ImageHotspotEditor', classes.ImageHotspotEditor, className])}
        style={{ width: model.width && model.width + 2 }}>
        <div className={classes.imageContainer}>
          <div className={classes.toolbar}>
            <ToolbarButton
                onClick={this.onSelectImage}
                size={ToolbarButtonSize.Small}
                tooltip="Select Hotspot Image"
                disabled={!editMode}>
              <i className="fa fa-picture-o" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => this.onAddHotspot('rect')}
                size={ToolbarButtonSize.Fit}
                tooltip="Create a rectangle hotspot"
                disabled={!editMode}>
              Rectangle
            </ToolbarButton>
            <ToolbarButton
                onClick={() => this.onAddHotspot('circle')}
                size={ToolbarButtonSize.Fit}
                tooltip="Create a circle hotspot"
                disabled={!editMode}>
              Circle
            </ToolbarButton>
            <ToolbarButton
                onClick={() => this.onAddHotspot('poly')}
                size={ToolbarButtonSize.Fit}
                tooltip="Create a polygon hotspot"
                disabled={true || !editMode}>
              Polygon
            </ToolbarButton>
            <div className="flex-spacer" />
            <ToolbarButton
                onClick={() => this.onRemoveHotspot(selectedHotspot)}
                size={ToolbarButtonSize.Fit}
                className={classes.removeHotspotButton}
                tooltip={selectedHotspot.caseOf({ just: () => true, nothing: () => false })
                  && model.hotspots.size <= 1
                    ? 'An image hotspot must contain at least one hotspot. '
                      + 'Please add another hotspot before removing this one.'
                    : 'Remove selected hotspot'
                }
                disabled={selectedHotspot.caseOf({ just: () => false, nothing: () => true })
                  || model.hotspots.size <= 1}>
              Remove Hotspot
            </ToolbarButton>
          </div>
          <div
            className={classes.imageBody}
            onMouseDown={e => this.onSelectHotspot(Maybe.nothing())}>
            {model.src
              ? (
                <div
                  className={classes.hotspotBody}>
                  <img
                    ref={this.setSvgRef}
                    src={model.src === 'NO_IMAGE_SELECTED'
                      ? DEFAULT_IMAGE
                      : buildUrl(
                        context.baseUrl,
                        context.courseId,
                        context.resourcePath,
                        model.src,
                    )}
                    width={model.width} height={model.height} />
                  <svg
                    className={classes.hotspots} width={model.width} height={model.height}>
                    {model.hotspots.sort(h => selectedHotspot.caseOf({
                      just: s => h.guid === s ? 1 : 0,
                      nothing: () => 0,
                    }))
                      .toArray()
                      .map((hotspot, index) => {
                        switch (hotspot.shape) {
                          case 'rect':
                            return (
                              <RectangleEditor
                                key={hotspot.guid}
                                id={hotspot.guid}
                                label={getFeedbackLabel(index)}
                                selected={selectedHotspot.caseOf({
                                  just: s => hotspot.guid === s,
                                  nothing: () => false,
                                })}
                                boundingClientRect={this.svgRef
                                  ? Maybe.just(this.svgRef.getBoundingClientRect())
                                  : Maybe.nothing()}
                                coords={hotspot.coords}
                                onSelect={maybeId =>
                                  maybeId.lift(id =>
                                    this.onSelectHotspot(
                                      Maybe.maybe(model.hotspots.find(h => h.guid === id))))}
                                onEdit={coords => this.onEditCoords(hotspot.guid, coords)} />
                            );
                          case 'circle':
                            return (
                              <CircleEditor
                                key={hotspot.guid}
                                id={hotspot.guid}
                                label={getFeedbackLabel(index)}
                                selected={selectedHotspot.caseOf({
                                  just: s => hotspot.guid === s,
                                  nothing: () => false,
                                })}
                                boundingClientRect={this.svgRef
                                  ? Maybe.just(this.svgRef.getBoundingClientRect())
                                  : Maybe.nothing()}
                                coords={hotspot.coords}
                                onSelect={maybeId =>
                                  maybeId.lift(id =>
                                    this.onSelectHotspot(
                                      Maybe.maybe(model.hotspots.find(h => h.guid === id))))}
                                onEdit={coords => this.onEditCoords(hotspot.guid, coords)} />
                            );
                          case 'poly':
                            return (
                              <PolygonEditor
                                key={hotspot.guid}
                                id={hotspot.guid}
                                label={getFeedbackLabel(index)}
                                selected={selectedHotspot.caseOf({
                                  just: s => hotspot.guid === s,
                                  nothing: () => false,
                                })}
                                boundingClientRect={this.svgRef
                                  ? Maybe.just(this.svgRef.getBoundingClientRect())
                                  : Maybe.nothing()}
                                coords={hotspot.coords}
                                onSelect={maybeId =>
                                  maybeId.lift(id =>
                                    this.onSelectHotspot(
                                      Maybe.maybe(model.hotspots.find(h => h.guid === id))))}
                                onEdit={coords => this.onEditCoords(hotspot.guid, coords)} />
                            );
                          default:
                            return null;
                        }
                      })}
                  </svg>
                </div>
              )
              : (
                <div className={classes.noImage}>
                  <span className={classes.selectImgLink} onClick={this.onSelectImage}>
                    Select and image
                  </span> to get started
                </div>
              )
            }
          </div>
        </div>
          {selectedHotspot.caseOf({
            just: (hotspotGuid) => {
              const hotspotIndex = model.hotspots.toArray().findIndex(h => h.guid === hotspotGuid);
              return hotspotIndex >= 0
                ? this.renderHotspotDetails(model.hotspots.get(hotspotGuid), hotspotIndex)
                : this.renderPanelDetails();
            },
            nothing: () => this.renderPanelDetails(),
          })}
      </div>
    );
  }
}
