import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { throttle } from 'utils/timing';
import { Maybe } from 'tsmonad';
import { BoundingClientRect, Point } from 'types/common';

import { styles } from 'editors/content/question/imagehotspot/CircleEditor.styles';

const mapCoordsToCircleProps = (coords: Immutable.List<number>) => {
  return {
    cx: coords.get(0),
    cy: coords.get(1),
    r: coords.get(2),
  };
};

export interface CircleEditorProps {
  id: string;
  label: string;
  coords: Immutable.List<number>;
  selected: boolean;
  boundingClientRect: Maybe<BoundingClientRect>;
  onSelect: (guid: Maybe<string>) => void;
  onEdit: (coords: Immutable.List<number>) => void;
}

export interface CircleEditorState {
  newCoords: Maybe<Immutable.List<number>>;
  dragPointBegin: Maybe<Point>;
  dragMouseBegin: Maybe<Point>;
}

/**
 * CircleEditor React Component
 */
class CircleEditor
    extends React.PureComponent<StyledComponentProps<CircleEditorProps, typeof styles>,
    CircleEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      newCoords: Maybe.nothing<Immutable.List<number>>(),
      dragPointBegin: Maybe.nothing<Point>(),
      dragMouseBegin: Maybe.nothing<Point>(),
    };

    this.beginResize = this.beginResize.bind(this);
    this.endResize = this.endResize.bind(this);
    this.onResizeDrag = throttle(this.onResizeDrag.bind(this), 25);
    this.beginMove = this.beginMove.bind(this);
    this.endMove = this.endMove.bind(this);
    this.onMoveDrag = throttle(this.onMoveDrag.bind(this), 25);
    this.onSelect = this.onSelect.bind(this);
  }

  beginResize(e) {
    const { coords } = this.props;
    const { clientX, clientY } = e.nativeEvent;

    this.setState({
      dragPointBegin: Maybe.just({ x: coords.get(0) + coords.get(2), y: coords.get(1) }),
      dragMouseBegin: Maybe.just({ x: clientX, y: clientY }),
    });

    // register global mouse listeners
    window.addEventListener('mousemove', this.onResizeDrag);
    window.addEventListener('mouseup', this.endResize);

    // stop event propagation to keep item selected
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
    });
  }

  onResizeDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin } = this.state;

    dragPointBegin.lift((dragPointBeginVal) => {
      dragMouseBegin.lift((dragMouseBeginVal) => {
        boundingClientRect.lift((boundingClient) => {
          const { width, height } = boundingClient;
          const { clientX, clientY } = e;

          // calculate the offset distance from where the drag began to where the mouse is
          const offsets = {
            x: clientX - dragMouseBeginVal.x,
            y: clientY - dragMouseBeginVal.y,
          };

          // calculate the new point position using the offsets
          let newRadius = (dragPointBeginVal.x - newCoords.valueOr(coords).get(0)) + offsets.x;

          // maintain minimum hotspot size using opposite point as constraint
          const MINIMUM_SIZE_PX = 15;
          newRadius = Math.min(
            Math.max(newRadius, MINIMUM_SIZE_PX),
            Math.max(
              newCoords.valueOr(coords).get(0),
              width - newCoords.valueOr(coords).get(0),
              newCoords.valueOr(coords).get(1),
              height - newCoords.valueOr(coords).get(1),
            ),
          );

          // update point location in state
          this.setState({
            newCoords: Maybe.just(newCoords.valueOr(coords).set(2, newRadius),
            ),
          });
        });
      });
    });
  }

  beginMove(e) {
    const { coords } = this.props;
    const { clientX, clientY } = e.nativeEvent;

    this.setState({
      dragPointBegin: Maybe.just({ x: coords.get(0), y: coords.get(1) }),
      dragMouseBegin: Maybe.just({ x: clientX, y: clientY }),
    });

    // register global mouse listeners
    window.addEventListener('mousemove', this.onMoveDrag);
    window.addEventListener('mouseup', this.endMove);
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
    });
  }

  onMoveDrag(e) {
    const { coords, boundingClientRect } = this.props;
    const { newCoords, dragPointBegin, dragMouseBegin } = this.state;

    dragPointBegin.lift((dragPointBeginVal) => {
      dragMouseBegin.lift((dragMouseBeginVal) => {
        boundingClientRect.lift((boundingClient) => {
          const { clientX, clientY } = e;

          const offsets = {
            x: clientX - dragMouseBeginVal.x,
            y: clientY - dragMouseBeginVal.y,
          };

          let calculatedCoords = {
            cx: dragPointBeginVal.x + offsets.x,
            cy: dragPointBeginVal.y + offsets.y,
          };
          const radius = newCoords.valueOr(coords).get(2);

          // ensure new location is inside the hotspot area
          calculatedCoords = {
            cx: Math.min(
              Math.max(calculatedCoords.cx, 0), boundingClient.width),
            cy: Math.min(
              Math.max(calculatedCoords.cy, 0), boundingClient.height),
          };

          this.setState({
            newCoords: Maybe.just(newCoords.valueOr(coords)
              .set(0, calculatedCoords.cx)
              .set(1, calculatedCoords.cy)
              .set(2, radius),
            ),
          });
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
        <circle
          className={classNames([classes.handle, classes.ew])}
          cx={coords.get(0) + coords.get(2)}
          cy={coords.get(1)}
          onMouseDown={e => this.beginResize(e)}
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
        <circle
          className={classNames([
            'CircleEditor', classes.CircleEditor,
            selected && classes.selected, className])}
          onMouseDown={(e) => {
            this.onSelect(id, e);
            this.beginMove(e);
          }}
          onMouseUp={e => this.endMove(e)}
          {...mapCoordsToCircleProps(renderCoords)} />
        <text
          className={classes.label}
          x={renderCoords.get(0) - 7}
          y={renderCoords.get(1) + 7}>
          {label}
        </text>
        {selected && this.renderResizeHandles(renderCoords)}
      </React.Fragment>
    );
  }
}

const StyledCircleEditor = withStyles<CircleEditorProps>(styles)(CircleEditor);
export { StyledCircleEditor as CircleEditor };
