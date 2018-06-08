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

export interface ImageHotspotEditorProps {
  className?: string;
  editMode: boolean;
  model: contentTypes.ImageHotspot;
  context: AppContext;
  onEdit: (model: contentTypes.ImageHotspot) => void;
}

export interface ImageHotspotEditorState {
  selectedHotspot: string;
}

/**
 * ImageHotspotEditor React Component
 */
@injectSheet(styles)
export class ImageHotspotEditor
    extends React.PureComponent<StyledComponentProps<ImageHotspotEditorProps>,
    ImageHotspotEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      selectedHotspot: null,
    };

    this.onSelectHotspot = this.onSelectHotspot.bind(this);
  }

  onEditCoords(guid: string, coords: Immutable.List<number>) {
    const { model, onEdit } = this.props;

    onEdit(model.with({
      hotspots: model.hotspots.set(
        guid,
        model.hotspots.get(guid).with({ coords }),
      ),
    }));
  }

  onSelectHotspot(guid: string) {
    this.setState({
      selectedHotspot: guid,
    });
  }

  render() {
    const { className, classes, children, editMode, context, model } = this.props;
    const { selectedHotspot } = this.state;

    return (
      <div
        className={classNames(['ImageHotspotEditor', classes.ImageHotspotEditor, className])}
        style={{ width: model.width && model.width + 2 }}>
        <div className={classes.toolbar}>
        <ToolbarButton
            onClick={() => {}}
            size={ToolbarButtonSize.Small}
            tooltip="Select Hotspot Image"
            disabled={!editMode}>
          <i className="fa fa-picture-o" />
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {}}
            size={ToolbarButtonSize.Fit}
            tooltip="Create a rectangle hotspot"
            disabled={!editMode}>
          Rectangle
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {}}
            size={ToolbarButtonSize.Fit}
            tooltip="Create a circle hotspot"
            disabled={!editMode}>
          Circle
        </ToolbarButton>
        <ToolbarButton
            onClick={() => {}}
            size={ToolbarButtonSize.Fit}
            tooltip="Create a polygon hotspot"
            disabled={!editMode}>
          Polygon
        </ToolbarButton>
        <div className="flex-spacer" />
        <ToolbarButton
            onClick={() => {}}
            size={ToolbarButtonSize.Fit}
            className={classes.removeHotspotButton}
            tooltip="Remove selected hotspot"
            disabled={true}>
          Remove Hotspot
        </ToolbarButton>
        </div>
        <div className={classes.imageBody} onClick={() => this.onSelectHotspot(null)}>
          {model.src
            ? (
              <div className={classes.hotspotBody}>
                <img
                  src={buildUrl(
                    context.baseUrl,
                    context.courseId,
                    context.resourcePath,
                    model.src,
                  )}
                  width={model.width} height={model.height} />
                <svg className={classes.hotspots} width={model.width} height={model.height}>
                  {model.hotspots.map((hotspot) => {
                    switch (hotspot.shape) {
                      case 'rect':
                        return (
                          <RectangleEditor
                            className={classes.hotspot}
                            id={hotspot.guid}
                            selected={hotspot.guid === selectedHotspot}
                            coords={hotspot.coords}
                            onSelect={this.onSelectHotspot}
                            onEdit={coords => this.onEditCoords(hotspot.guid, coords)} />
                        );
                      case 'circle':
                        return (
                          <circle
                            className={classes.hotspot}
                            {...mapCoordsToCircleProps(hotspot.coords)} />
                        );
                      case 'poly':
                        return (
                          <polygon
                            className={classes.hotspot}
                            stroke="blue"
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
