import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { throttle } from 'utils/timing';
import { Maybe } from 'tsmonad';

import { styles } from './RectangleEditor.styles';

const mapCoordsToRectProps = (coords: Immutable.List<number>) => {
  return {
    x: coords.get(0),
    y: coords.get(1),
    width: coords.get(2) - coords.get(0),
    height: coords.get(3) - coords.get(1),
  };
};

type Point = {
  x: number,
  y: number,
};

type BoundingClientRect = {
  bottom: number,
  height: number,
  left: number,
  right: number,
  top: number,
  width: number,
  x: number,
  y: number,
};

export interface RectangleEditorProps {
  id: string;
  label: string;
  coords: Immutable.List<number>;
  selected: boolean;
  boundingClientRect: Maybe<BoundingClientRect>;
  onSelect: (guid: Maybe<string>) => void;
  onEdit: (coords: Immutable.List<number>) => void;
}

export interface RectangleEditorState {
  newCoords: Maybe<Immutable.List<number>>;
  dragPointBegin: Point;
  dragMouseBegin: Point;
  dragPointIndices: Point;
}

/**
 * RectangleEditor React Component
 */
@injectSheet(styles)
export class RectangleEditor
    extends React.PureComponent<StyledComponentProps<RectangleEditorProps>,
    RectangleEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      newCoords: Maybe.nothing(),
      dragPointBegin: null,
      dragMouseBegin: null,
      dragPointIndices: null,
    };

    this.beginResize = this.beginResize.bind(this);
    this.endResize = this.endResize.bind(this);
    this.onResizeDrag = throttle(this.onResizeDrag.bind(this), 25);
    this.beginMove = this.beginMove.bind(this);
    this.endMove = this.endMove.bind(this);
    this.onMoveDrag = throttle(this.onMoveDrag.bind(this), 25);
    this.onSelect = this.onSelect.bind(this);
  }

  beginResize(pointIndices: Point, e) {
    const { coords } = this.props;
    const { clientX, clientY } = e.nativeEvent;

    this.setState({
      dragPointBegin: { x: coords.get(pointIndices.x), y: coords.get(pointIndices.y) },
      dragMouseBegin: { x: clientX, y: clientY },
      dragPointIndices: { x: pointIndices.x, y: pointIndices.y },
    });

    // register global mouse listeners
    window.addEventListener('mousemove', this.onResizeDrag);
    window.addEventListener('mouseup', this.endResize);

    e.stopPropagation();
  }

  endResize(e) {
    const { onEdit } = this.props;
    const { newCoords } = this.state;

    // unregister global mouse listeners
    window.removeEventListener('mousemove', this.onResizeDrag);
    window.removeEventListener('mouseup', this.endResize);

    newCoords.lift(coords => onEdit(coords));

    this.setState({
      newCoords: Maybe.nothing<Immutable.List<number>>(),
      dragPointBegin: null,
      dragMouseBegin: null,
      dragPointIndices: null,
    });

    e.stopPropagation();
  }

  onResizeDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin, dragPointIndices } = this.state;

    if (dragPointIndices) {
      boundingClientRect.lift((boundingClient) => {
        const { x, y, width, height } = boundingClient;
        const { clientX, clientY } = e;

        // ensure new position is inside the bounds of the image
        const dragMouse = {
          x: Math.min(Math.max(clientX, x), x + width),
          y: Math.min(Math.max(clientY, y), y + height),
        };

        // calculate the offset distance from where the drag began to where the mouse is
        const offsets = {
          x: dragMouse.x - dragMouseBegin.x,
          y: dragMouse.y - dragMouseBegin.y,
        };

        // calculate the new point position using the offsets
        let newPointPosition = {
          x: dragPointBegin.x + offsets.x,
          y: dragPointBegin.y + offsets.y,
        };

        // maintain minimum hotspot size using opposite point as constraint
        const MINIMUM_SIZE_PX = 10;
        const constraintIndices = {
          x: (dragPointIndices.x + 2) % 4,  // opposite point x coords index
          y: (dragPointIndices.y + 2) % 4,  // opposite point y coords index
        };
        newPointPosition = {
          x: constraintIndices.x < dragPointIndices.x
            ? Math.max(newPointPosition.x, coords.get(constraintIndices.x) + MINIMUM_SIZE_PX)
            : Math.min(newPointPosition.x, coords.get(constraintIndices.x) - MINIMUM_SIZE_PX),
          y: constraintIndices.y < dragPointIndices.y
            ? Math.max(newPointPosition.y, coords.get(constraintIndices.y) + MINIMUM_SIZE_PX)
            : Math.min(newPointPosition.y, coords.get(constraintIndices.y) - MINIMUM_SIZE_PX),
        };

        // update point location in state
        this.setState({
          newCoords: Maybe.just(newCoords.valueOr(coords)
            .set(dragPointIndices.x, newPointPosition.x)
            .set(dragPointIndices.y, newPointPosition.y),
          ),
        });
      });
    }
  }

  beginMove(e) {
    const { coords } = this.props;
    const { clientX, clientY } = e.nativeEvent;

    this.setState({
      dragPointBegin: { x: coords.get(0), y: coords.get(1) },
      dragMouseBegin: { x: clientX, y: clientY },
    });

    // register global mouse listeners
    window.addEventListener('mousemove', this.onMoveDrag);
    window.addEventListener('mouseup', this.endMove);

    e.stopPropagation();
  }

  endMove(e) {
    const { onEdit } = this.props;
    const { newCoords } = this.state;

    // unregister global mouse listeners
    window.removeEventListener('mousemove', this.onMoveDrag);
    window.removeEventListener('mouseup', this.endMove);

    newCoords.lift(coords => onEdit(coords));

    this.setState({
      newCoords: Maybe.nothing<Immutable.List<number>>(),
      dragPointBegin: null,
      dragMouseBegin: null,
      dragPointIndices: null,
    });

    e.stopPropagation();
  }

  onMoveDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin } = this.state;
    const { clientX, clientY } = e;

    if (dragPointBegin) {
      boundingClientRect.lift((boundingClient) => {
        const { clientX, clientY } = e;

        const offsets = {
          x: clientX - dragMouseBegin.x,
          y: clientY - dragMouseBegin.y,
        };

        const { width, height } = mapCoordsToRectProps(coords);

        let calculatedCoords = {
          x1: dragPointBegin.x + offsets.x,
          y1: dragPointBegin.y + offsets.y,
          x2: (dragPointBegin.x + offsets.x) + width,
          y2: (dragPointBegin.y + offsets.y) + height,
        };

        // ensure new location is inside the hotspot area
        calculatedCoords = {
          x1: Math.min(Math.max(calculatedCoords.x1, 0), (boundingClient.width - width)),
          y1: Math.min(Math.max(calculatedCoords.y1, 0), (boundingClient.height - height)),
          x2: Math.min(
            Math.max(calculatedCoords.x2, width), boundingClient.width),
          y2: Math.min(
            Math.max(calculatedCoords.y2, height), boundingClient.height),
        };

        this.setState({
          newCoords: Maybe.just(newCoords.valueOr(coords)
            .set(0, calculatedCoords.x1)
            .set(1, calculatedCoords.y1)
            .set(2, calculatedCoords.x2)
            .set(3, calculatedCoords.y2),
          ),
        });
      });
    }
  }

  onSelect(id: string, e) {
    const { onSelect } = this.props;

    onSelect(Maybe.just(id));
    e.stopPropagation();
  }

  renderResizeHandles(coords: Immutable.List<number>) {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <circle
          className={classNames([classes.handle, classes.nwse])}
          cx={coords.get(0)}
          cy={coords.get(1)}
          onMouseDown={e => this.beginResize({ x: 0, y: 1 }, e)}
          onMouseUp={e => this.endResize(e)}
          onClick={e => e.stopPropagation()}
          r="5" />
        <circle
          className={classNames([classes.handle, classes.nesw])}
          cx={coords.get(0)}
          cy={coords.get(3)}
          onMouseDown={e => this.beginResize({ x: 0, y: 3 }, e)}
          onMouseUp={e => this.endResize(e)}
          onClick={e => e.stopPropagation()}
          r="5" />
        <circle
          className={classNames([classes.handle, classes.nesw])}
          cx={coords.get(2)}
          cy={coords.get(1)}
          onMouseDown={e => this.beginResize({ x: 2, y: 1 }, e)}
          onMouseUp={e => this.endResize(e)}
          onClick={e => e.stopPropagation()}
          r="5" />
        <circle
          className={classNames([classes.handle, classes.nwse])}
          cx={coords.get(2)}
          cy={coords.get(3)}
          onMouseDown={e => this.beginResize({ x: 2, y: 3 }, e)}
          onMouseUp={e => this.endResize(e)}
          onClick={e => e.stopPropagation()}
          r="5" />
      </React.Fragment>
    );
  }

  render() {
    const { className, classes, id, label, coords, selected } = this.props;
    const { newCoords } = this.state;

    const renderCoords = newCoords.valueOr(coords);

    return (
      <React.Fragment>
        <rect
          className={classNames([
            'RectangleEditor', classes.RectangleEditor,
            selected && classes.selected, className])}
          onMouseDown={(e) => {
            this.onSelect(id, e);
            this.beginMove(e);
          }}
          onMouseUp={e => this.endMove(e)}
          {...mapCoordsToRectProps(renderCoords)} />
        <text
          className={classes.label}
          x={renderCoords.get(0)
            + Math.floor((renderCoords.get(2) - renderCoords.get(0)) / 2) - 7}
          y={renderCoords.get(1)
            + Math.floor((renderCoords.get(3) - renderCoords.get(1)) / 2) + 7}>
          {label}
        </text>
        {selected && this.renderResizeHandles(renderCoords)}
      </React.Fragment>
    );
  }
}
