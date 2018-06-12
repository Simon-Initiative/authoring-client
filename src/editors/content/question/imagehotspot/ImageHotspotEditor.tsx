import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AppContext } from 'editors/common/AppContext';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { buildUrl } from 'utils/path';
import { RectangleEditor } from './RectangleEditor';

import { styles } from './ImageHotspotEditor.styles';
import { Hotspot } from 'data/content/assessment/image_hotspot/hotspot';
import guid from 'utils/guid';
import { Maybe } from 'tsmonad';
import ModalSelection from 'utils/selection/ModalSelection';
import {
  MediaManager, MIMETYPE_FILTERS, SELECTION_TYPES,
} from 'editors/content/media/manager/MediaManager.controller';
import { modalActions } from 'actions/modal';
import { AppServices } from 'editors/common/AppServices';
import { adjustPath } from 'editors/content/media/utils';

const mapCoordsToCircleProps = (coords: Immutable.List<number>) => {
  return {
    cx: coords.get(0),
    cy: coords.get(1),
    r: coords.get(2),
  };
};

const mapCoordsToPolygonProps = (coords: Immutable.List<number>) => {
  return {
    points: coords.join(','),
  };
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

export interface ImageHotspotEditorProps {
  className?: string;
  editMode: boolean;
  model: contentTypes.ImageHotspot;
  partModel: contentTypes.Part;
  context: AppContext;
  services: AppServices;
  onEdit: (model: contentTypes.ImageHotspot, partModel: contentTypes.Part, src?: Object) => void;
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
  ref: any;

  constructor(props) {
    super(props);

    this.state = {
      selectedHotspot: Maybe.nothing(),
    };

    this.setRef = this.setRef.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.onEditCoords = this.onEditCoords.bind(this);
    this.onSelectHotspot = this.onSelectHotspot.bind(this);
    this.onAddHotspot = this.onAddHotspot.bind(this);
    this.onRemoveHotspot = this.onRemoveHotspot.bind(this);
  }

  setRef(ref) {
    this.ref = ref;
  }

  onEditCoords(guid: string, coords: Immutable.List<number>) {
    const { model, partModel, onEdit } = this.props;

    onEdit(
      model.with({
        hotspots: model.hotspots.set(
          guid,
          model.hotspots.get(guid).with({ coords }),
        ),
      }),
      partModel,
    );
  }

  onSelectHotspot(guid: Maybe<string>) {
    this.setState({
      selectedHotspot: guid,
    });
  }

  onSelectImage() {
    const { context, services, model, partModel, onEdit } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectImage(
      model.src,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((src) => {
        onEdit(model.with({ src }), partModel);
      });
  }
  onAddHotspot(shape: string) {
    const { model, partModel, onEdit } = this.props;

    // create new hotspot
    const match = guid();
    let newHotspot = new Hotspot({
      shape,
      value: match,
    });

    // set default coordinates depending on the shape type
    switch (shape) {
      // case 'poly':
      //   break;
      // case 'circle':
      //   break;
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

    // create corresponding response feedback
    const feedback = contentTypes.Feedback.fromText('', guid());
    let response = new contentTypes.Response();
    response = response.with({
      match,
      input: partModel.responses.size > 0
        ? partModel.responses.first().input
        : guid(),
      feedback: response.feedback.set(feedback.guid, feedback),
    });
    const updatedPartModel = partModel.with(
      { responses: partModel.responses.set(response.guid, response) });

    // add new hotspot to the model
    onEdit(
      model.with({
        hotspots: model.hotspots.set(
          newHotspot.guid,
          newHotspot,
        ),
      }),
      updatedPartModel,
    );

    // select the new hotspot
    this.setState({
      selectedHotspot: Maybe.just(newHotspot.guid),
    });
  }

  onRemoveHotspot(guid: string) {
    const { model, partModel, onEdit } = this.props;

    onEdit(
      model.with({
        hotspots: model.hotspots.remove(guid),
      }),
      partModel.with({
        responses: partModel.responses
          .filter(r => r.match !== model.hotspots.get(guid).value)
          .toOrderedMap(),
      }),
    );

    // deselect deleted hotspot
    this.setState({
      selectedHotspot: Maybe.nothing<string>(),
    });
  }

  render() {
    const { className, classes, editMode, context, model } = this.props;
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
            onClick={() => { console.log('NOT IMPLEMENTED'); }}
            size={ToolbarButtonSize.Fit}
            tooltip="Create a circle hotspot"
            disabled={true || !editMode}>
          Circle
        </ToolbarButton>
        <ToolbarButton
            onClick={() => { console.log('NOT IMPLEMENTED'); }}
            size={ToolbarButtonSize.Fit}
            tooltip="Create a polygon hotspot"
            disabled={true || !editMode}>
          Polygon
        </ToolbarButton>
        <div className="flex-spacer" />
        <ToolbarButton
            onClick={() => this.onRemoveHotspot(selectedHotspot.valueOr(''))}
            size={ToolbarButtonSize.Fit}
            className={classes.removeHotspotButton}
            tooltip="Remove selected hotspot"
            disabled={selectedHotspot.caseOf({ just: () => false, nothing: () => true })}>
          Remove Hotspot
        </ToolbarButton>
        </div>
        <div
          className={classes.imageBody}
          onMouseDown={e => this.onSelectHotspot(Maybe.nothing())}>
          {model.src
            ? (
              <div
                ref={this.setRef}
                className={classes.hotspotBody}>
                <img
                  src={buildUrl(
                    context.baseUrl,
                    context.courseId,
                    context.resourcePath,
                    model.src,
                  )}
                  width={model.width} height={model.height} />
                <svg className={classes.hotspots} width={model.width} height={model.height}>
                  {model.hotspots.sort(h => h.guid === selectedHotspot.valueOr('') ? 1 : 0)
                    .toArray()
                    .map((hotspot) => {
                      switch (hotspot.shape) {
                        case 'rect':
                          return (
                            <RectangleEditor
                              key={hotspot.guid}
                              id={hotspot.guid}
                              selected={hotspot.guid === selectedHotspot.valueOr('')}
                              boundingClientRect={this.ref
                                ? Maybe.just(this.ref.getBoundingClientRect())
                                : Maybe.nothing()}
                              coords={hotspot.coords}
                              onSelect={this.onSelectHotspot}
                              onEdit={coords => this.onEditCoords(hotspot.guid, coords)} />
                          );
                        case 'circle':
                          return (
                            <circle
                              key={hotspot.guid}
                              className={classes.hotspot}
                              {...mapCoordsToCircleProps(hotspot.coords)} />
                          );
                        case 'poly':
                          return (
                            <polygon
                              key={hotspot.guid}
                              className={classes.hotspot}
                              {...mapCoordsToPolygonProps(hotspot.coords)} />
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
      </div>
    );
  }
}
