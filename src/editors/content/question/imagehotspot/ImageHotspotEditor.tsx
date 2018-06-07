import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AppContext } from 'editors/common/AppContext';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { buildUrl } from 'utils/path';

import { styles } from './ImageHotspotEditor.styles';

const mapCoordsToCircleProps = (coords: Immutable.List<number>) => {
  return {
    cx: coords.get(0),
    cy: coords.get(1),
    r: coords.get(2),
  };
};

const mapCoordsToRectProps = (coords: Immutable.List<number>) => {
  return {
    x: coords.get(0),
    y: coords.get(1),
    width: coords.get(2) - coords.get(0),
    height: coords.get(3) - coords.get(1),
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
}

export interface ImageHotspotEditorState {

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
  }

  render() {
    const { className, classes, children, editMode, context, model } = this.props;

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
            tooltip="Create an oval hotspot"
            disabled={!editMode}>
          Oval
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
        <div className={classes.imageBody}>
          {model.src
            ? (
              <div className={classes.imageBody}>
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
                      case 'circle':
                        return (
                          <circle
                            className={classes.hotspot}
                            {...mapCoordsToCircleProps(hotspot.coords)} />
                        );
                      case 'rect':
                        return (
                          <rect
                            className={classes.hotspot}
                            {...mapCoordsToRectProps(hotspot.coords)} />
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
