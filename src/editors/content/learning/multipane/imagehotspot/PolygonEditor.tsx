import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { throttle } from 'utils/timing';
import { Maybe } from 'tsmonad';
import { BoundingClientRect, Point } from 'types/common';

import { styles } from 'editors/content/question/imagehotspot/PolygonEditor.styles';

const mapCoordsToPolygonProps = (coords: Immutable.List<number>) => {
  return {
    points: coords.join(','),
  };
};

const calculateCentroid = (coords: Immutable.List<number>): Point => {
  const x = coords.filter((x, index) => index % 2 === 0);
  const y = coords.filter((y, index) => index % 2 !== 0);
  const cx = (Math.min(...x.toArray()) + Math.max (...x.toArray())) / 2;
  const cy = (Math.min(...y.toArray()) + Math.max (...y.toArray())) / 2;

  return { x: cx, y: cy };
};

export interface PolygonEditorProps {
  id: string;
  label: string;
  coords: Immutable.List<number>;
  selected: boolean;
  boundingClientRect: Maybe<BoundingClientRect>;
  onSelect: (guid: Maybe<string>) => void;
  onEdit: (coords: Immutable.List<number>) => void;
}

export interface PolygonEditorState {
  newCoords: Maybe<Immutable.List<number>>;
  dragPointBegin: Maybe<Point>;
  dragMouseBegin: Maybe<Point>;
  dragPointIndices: Maybe<Point>;
}

/**
 * PolygonEditor React Component
 */
@injectSheet(styles)
export class PolygonEditor
    extends React.PureComponent<StyledComponentProps<PolygonEditorProps>,
    PolygonEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      newCoords: Maybe.nothing<Immutable.List<number>>(),
      dragPointBegin: Maybe.nothing<Point>(),
      dragMouseBegin: Maybe.nothing<Point>(),
      dragPointIndices: Maybe.nothing<Point>(),
    };

    this.beginResize = this.beginResize.bind(this);
    this.endResize = this.endResize.bind(this);
    this.onResizeDrag = throttle(this.onResizeDrag.bind(this), 25);
    this.beginMove = this.beginMove.bind(this);
    this.endMove = this.endMove.bind(this);
    this.onMoveDrag = throttle(this.onMoveDrag.bind(this), 25);
    this.onSelect = this.onSelect.bind(this);
  }

  beginResize(pointIndex: number, e) {
    const { coords } = this.props;
    const { clientX, clientY } = e.nativeEvent;

    const coordIndex = pointIndex * 2;

    this.setState({
      dragPointBegin: Maybe.just({ x: coords.get(coordIndex), y: coords.get(coordIndex + 1) }),
      dragMouseBegin: Maybe.just({ x: clientX, y: clientY }),
      dragPointIndices: Maybe.just({ x: coordIndex, y: coordIndex + 1 }),
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
      dragPointBegin: Maybe.nothing<Point>(),
      dragMouseBegin: Maybe.nothing<Point>(),
      dragPointIndices: Maybe.nothing<Point>(),
    });

    e.stopPropagation();
  }

  onResizeDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin, dragPointIndices } = this.state;

    dragPointIndices.lift((dragPointIndicesVal) => {
      dragPointBegin.lift((dragPointBeginVal) => {
        dragMouseBegin.lift((dragMouseBeginVal) => {
          boundingClientRect.lift((boundingClient) => {
            const { left, top, width, height } = boundingClient;
            const { clientX, clientY } = e;

            // ensure new position is inside the bounds of the image
            const dragMouse = {
              x: Math.min(Math.max(clientX, left), left + width),
              y: Math.min(Math.max(clientY, top), top + height),
            };

            // calculate the offset distance from where the drag began to where the mouse is
            const offsets = {
              x: dragMouse.x - dragMouseBeginVal.x,
              y: dragMouse.y - dragMouseBeginVal.y,
            };

            // calculate the new point position using the offsets
            const newPointPosition = {
              x: dragPointBeginVal.x + offsets.x,
              y: dragPointBeginVal.y + offsets.y,
            };

            // update point location in state
            this.setState({
              newCoords: Maybe.just(newCoords.valueOr(coords)
                .set(dragPointIndicesVal.x, newPointPosition.x)
                .set(dragPointIndicesVal.y, newPointPosition.y),
              ),
            });
          });
        });
      });
    });
  }

  beginMove(e) {
    const { clientX, clientY } = e.nativeEvent;

    this.setState({
      dragMouseBegin: Maybe.just({ x: clientX, y: clientY }),
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
      dragPointBegin: Maybe.nothing<Point>(),
      dragMouseBegin: Maybe.nothing<Point>(),
      dragPointIndices: Maybe.nothing<Point>(),
    });

    e.stopPropagation();
  }

  onMoveDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragMouseBegin } = this.state;

    dragMouseBegin.lift((dragMouseBeginVal) => {
      boundingClientRect.lift((boundingClient) => {
        const { left, top, width, height } = boundingClient;
        const { clientX, clientY } = e;

        const dragMouse = {
          x: Math.min(Math.max(clientX, left), left + width),
          y: Math.min(Math.max(clientY, top), top + height),
        };

        const offsets = {
          x: dragMouse.x - dragMouseBeginVal.x,
          y: dragMouse.y - dragMouseBeginVal.y,
        };

        // transform all points according to the offsets
        const calculatedCoords = newCoords.valueOr(coords)
          .map((coord, index) => index % 2 === 0
            ? coords.get(index) + offsets.x
            : coords.get(index) + offsets.y,
          )
          .toList();

        this.setState({
          newCoords: Maybe.just(calculatedCoords),
        });
      });
    });
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
        {coords.toArray()
        .reduce(
          (acc: Point[], val, index, array) => index % 2 === 0
            ? acc.concat({ x: array[index], y: array[index + 1] })
            : acc
          ,
          [])
        .map((coord, i) => (
          <circle
            className={classNames([classes.handle])}
            cx={coord.x}
            cy={coord.y}
            onMouseDown={e => this.beginResize(i, e)}
            onMouseUp={e => this.endResize(e)}
            onClick={e => e.stopPropagation()}
            r="5" />
        ))}
      </React.Fragment>
    );
  }

  render() {
    const { className, classes, id, label, coords, selected } = this.props;
    const { newCoords } = this.state;

    const renderCoords = newCoords.valueOr(coords);

    // get the center point of the polygon
    const centeroid = calculateCentroid(newCoords.valueOr(coords));

    return (
      <React.Fragment>
        <polygon
          className={classNames([
            'PolygonEditor', classes.PolygonEditor,
            selected && classes.selected, className])}
          onMouseDown={(e) => {
            this.onSelect(id, e);
            this.beginMove(e);
          }}
          onMouseUp={e => this.endMove(e)}
          {...mapCoordsToPolygonProps(renderCoords)} />
        <text
          className={classes.label}
          x={centeroid.x - 7}
          y={centeroid.y + 7}>
          {label}
        </text>
        {selected && this.renderResizeHandles(renderCoords)}
      </React.Fragment>
    );
  }
}
