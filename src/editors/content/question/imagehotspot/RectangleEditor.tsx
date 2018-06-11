import * as React from 'react';
import * as Immutable from 'immutable';
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

export interface RectangleEditorProps {
  id: string;
  coords: Immutable.List<number>;
  selected: boolean;
  onSelect: (guid: string) => void;
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

    // register mouse movements
    window.addEventListener('mousemove', this.onResizeDrag);

    e.stopPropagation();
  }

  endResize(e) {
    const { onEdit } = this.props;
    const { newCoords } = this.state;

    // unregister mouse movements
    window.removeEventListener('mousemove', this.onResizeDrag);

    newCoords.lift(coords => onEdit(coords));

    this.setState({
      newCoords: Maybe.nothing<Immutable.List<number>>(),
    });

    e.stopPropagation();
  }

  onResizeDrag(e) {
    const { coords } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin, dragPointIndices } = this.state;
    const { clientX, clientY } = e;

    if (dragPointIndices) {
      const offsets = {
        x: clientX - dragMouseBegin.x,
        y: clientY - dragMouseBegin.y,
      };
      const newPointPosition = {
        x: dragPointBegin.x + offsets.x,
        y: dragPointBegin.y + offsets.y,
      };

      this.setState({
        newCoords: Maybe.just(newCoords.valueOr(coords)
          .set(dragPointIndices.x, newPointPosition.x)
          .set(dragPointIndices.y, newPointPosition.y),
        ),
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

    // register mouse movements
    window.addEventListener('mousemove', this.onMoveDrag);

    e.stopPropagation();
  }

  endMove(e) {
    const { onEdit } = this.props;
    const { newCoords } = this.state;

    // unregister mouse movements
    window.removeEventListener('mousemove', this.onMoveDrag);

    newCoords.lift(coords => onEdit(coords));

    this.setState({
      newCoords: Maybe.nothing<Immutable.List<number>>(),
    });

    e.stopPropagation();
  }

  onMoveDrag(e) {
    const { coords } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin } = this.state;
    const { clientX, clientY } = e;

    if (dragPointBegin) {
      const offsets = {
        x: clientX - dragMouseBegin.x,
        y: clientY - dragMouseBegin.y,
      };

      const { width, height } = mapCoordsToRectProps(coords);

      const calculatedCoords = {
        x1: dragPointBegin.x + offsets.x,
        y1: dragPointBegin.y + offsets.y,
        x2: (dragPointBegin.x + offsets.x) + width,
        y2: (dragPointBegin.y + offsets.y) + height,
      };

      this.setState({
        newCoords: Maybe.just(newCoords.valueOr(coords)
          .set(0, calculatedCoords.x1)
          .set(1, calculatedCoords.y1)
          .set(2, calculatedCoords.x2)
          .set(3, calculatedCoords.y2),
        ),
      });
    }
  }

  onSelect(id: string, e) {
    const { onSelect } = this.props;

    onSelect(id);
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
    const { className, classes, id, coords, selected } = this.props;
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
        {selected && this.renderResizeHandles(renderCoords)}
      </React.Fragment>
    );
  }
}
