import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';
import { throttle } from 'utils/timing';

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
  // registerParentMouseUp:
}

export interface RectangleEditorState {
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
      dragPointBegin: null,
      dragMouseBegin: null,
      dragPointIndices: null,
    };

    this.beginResize = this.beginResize.bind(this);
    this.endResize = this.endResize.bind(this);
    this.onResizeDrag = throttle(this.onResizeDrag.bind(this), 100);
    this.onSelect = this.onSelect.bind(this);
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
    // unregister mouse movements
    window.removeEventListener('mousemove', this.onResizeDrag);

    e.stopPropagation();
  }

  onResizeDrag(e) {
    const { coords, onEdit } = this.props;
    const { dragPointBegin, dragMouseBegin, dragPointIndices } = this.state;
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

      onEdit(
        coords
          .set(dragPointIndices.x, newPointPosition.x)
          .set(dragPointIndices.y, newPointPosition.y),
      );
    }
  }

  onSelect(id: string, e) {
    const { onSelect } = this.props;

    onSelect(id);
    e.stopPropagation();
  }

  render() {
    const { className, classes, id, coords, selected, onSelect } = this.props;

    return (
      <React.Fragment>
      <rect
        className={classNames([
          'RectangleEditor', classes.RectangleEditor,
          selected && classes.selected, className])}
        onClick={e => this.onSelect(id, e)}
        {...mapCoordsToRectProps(coords)} />
        {selected && this.renderResizeHandles(coords)}
      </React.Fragment>
    );
  }
}
