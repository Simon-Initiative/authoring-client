import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ImageHotspot as ImageHotspotType } from 'data/content/workbook/multipanel/image_hotspot';
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
import guid from 'utils/guid';
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
import { Typeahead } from 'react-bootstrap-typeahead';
import { Panel } from 'data/content/workbook/multipanel/panel';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

const BORDER_STYLE = '1px solid #ced4da';

export const styles: JSSStyles = {
  ImageHotspotEditor: {
    extend: [disableSelect],
    display: 'flex',
    flexDirection: 'column',
    border: BORDER_STYLE,
    minWidth: 400,
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
  panelSelection: {
    marginBottom: 10,
  },
  activityPageSelection: {

  },
};

const DEFAULT_IMAGE = require('./hotspot_instructions.png');

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
  activityPageCount: Maybe<number>;
  panels: Immutable.List<Panel>;
  context: AppContext;
  services: AppServices;
  onEdit: (model: ImageHotspotType, src?: Object) => void;
}

export interface ImageHotspotEditorState {
  selectedHotspot: Maybe<Hotspot>;
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

  onSelectHotspot(hotspot: Maybe<Hotspot>) {
    this.setState({
      selectedHotspot: hotspot,
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
        // default to 400 x 600 on sizing failure
        width: 600,
        height: 400,
      })),
    )
    .then(({ src, width, height }) => {
      onEdit(
        model.with({
          src,
          width,
          height,
        }),
      );
    });
  }

  onAddHotspot(shape: string) {
    const { model, onEdit } = this.props;

    // create new hotspot
    const match = guid();
    let newHotspot = new Hotspot({
      shape,
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
      selectedHotspot: Maybe.just(newHotspot),
    });
  }

  onRemoveHotspot(maybeHotspot: Maybe<Hotspot>) {
    const { model, onEdit } = this.props;

    maybeHotspot.lift((hotspot) => {
      onEdit(
        model.with({
          hotspots: model.hotspots.remove(hotspot.guid),
        }),
      );

      // deselect deleted hotspot
      this.setState({
        selectedHotspot: Maybe.nothing<Hotspot>(),
      });
    });
  }

  render() {
    const {
      className, classes, editMode, context, model, activityPageCount, panels, onEdit,
    } = this.props;
    const { selectedHotspot } = this.state;

    return (
      <div
        className={classNames(['ImageHotspotEditor', classes.ImageHotspotEditor, className])}
        style={{ width: model.width && model.width + 2 }}>
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
                ? 'An image hotspot question must contain at least one hotspot. '
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
                    just: s => h.guid === s.guid ? 1 : 0,
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
                                just: s => hotspot.guid === s.guid,
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
                                just: s => hotspot.guid === s.guid,
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
                                just: s => hotspot.guid === s.guid,
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
              <div className={classes.noImage} />
            )
          }
        </div>
          {selectedHotspot.caseOf({
            just: hotspot => (
              <div className={classes.hotspotDetails}>
                <h3>Hotspot {getFeedbackLabel(
                  model.hotspots.toArray().findIndex(h => h.guid === hotspot.guid),
                )}</h3>
                <div className={classes.panelSelection}>
                  PANEL:
                  <Typeahead
                    multiple
                    bsSize="small"
                    onChange={(selected: Panel[]) => {
                      if (selected.length > 0) {
                        const lastSelected = selected.pop();
                        onEdit(model.with({
                          hotspots: model.hotspots.set(
                            hotspot.guid,
                            hotspot.with({
                              panelRef: lastSelected.id,
                            }),
                          ),
                        }));
                      }
                    }}
                    options={panels.toArray()}
                    labelKey={panel =>
                      panel.title.valueOr(
                        `Panel ${panels.findIndex(p => p.guid === panel.guid) + 1}`)}
                    selected={Maybe.maybe(panels.find(panel => panel.id === hotspot.panelRef))
                      .caseOf({
                        just: p => [p],
                        nothing: () => [],
                      })} />
                </div>
                <div className={classes.activityPageSelection}>
                  ACTIVITY PAGE:
                  {activityPageCount.caseOf({
                    just: pageCount => (
                      <Typeahead
                        multiple
                        bsSize="small"
                        onChange={(selected: number[]) => {
                          if (selected.length > 0) {
                            const lastSelected = selected.pop();
                            onEdit(model.with({
                              hotspots: model.hotspots.set(
                                hotspot.guid,
                                hotspot.with({
                                  activityRef: `${lastSelected + 1}`,
                                }),
                              ),
                            }));
                          }
                        }}
                        options={[...Array(pageCount).keys()]}
                        labelKey={index => `Page ${index + 1}`}
                        selected={[Number(hotspot.activityRef)]} />
                    ),
                    nothing: () => (
                      <LoadingSpinner message="Loading Assessment..." />
                    ),
                  })
                  }
                </div>
              </div>
            ),
            nothing: () => (
              <div className={classes.hotspotDetails}>
                Select a hotspot to set target panel and activity page.
              </div>
            ),
          })}
      </div>
    );
  }
}
