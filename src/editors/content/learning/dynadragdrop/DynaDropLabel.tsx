import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';
import { TargetToggle } from 'editors/content/learning/dynadragdrop/TargetToggle';

import { styles } from 'editors/content/learning/dynadragdrop/DynaDropLabel.styles';

export interface DynaDropLabelProps {
  id: string;
  editMode: boolean;
  text: string;
  isHeader?: boolean;
  style?: any;
  canToggleType: boolean;
  onEdit: (text: string) => void;
  onToggleType: (id: string) => void;
}

export interface DynaDropLabelState {
  text: string;
}

/**
 * DynaDropLabel React Component
 */
class DynaDropLabel
  extends React.Component<StyledComponentProps<DynaDropLabelProps, typeof styles>,
  DynaDropLabelState> {
  caretPosition: any;
  direction: number;
  ref: any;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      text: this.props.text,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.text !== nextState.text) {
      return true;
    }

    return false;
  }

  onChange(e) {
    const target = e.target;
    const currentText = target.innerText;

    this.setState(
      { text: currentText },
      () => {
        const el = this.ref;

        if (el.firstChild) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(el.firstChild, this.caretPosition + this.direction);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
    );

    this.props.onEdit(currentText);
  }

  onKeyPress(e) {
    const BACKSPACE = 8;

    const text = document.getSelection();
    const startIndex = text.anchorOffset;
    const endIndex = text.focusOffset;

    // Keep track of the position of caret
    if (endIndex - startIndex > 0) {
      this.caretPosition = startIndex;

      if (e.keyCode === BACKSPACE) {
        this.direction = 0;
      } else {
        this.direction = 1;
      }
    } else {
      this.caretPosition = endIndex;
      if (e.keyCode === BACKSPACE) {
        this.direction = -1;
      } else {
        this.direction = 1;
      }
    }
  }

  onKeyUp(e) {
    e.stopPropagation();
  }

  renderEdit(): JSX.Element {
    const { className, classes, style, id, isHeader, canToggleType, onToggleType } = this.props;
    const html = { __html: this.state.text };

    const TCell = isHeader ? 'th' : 'td';

    return (
      <TCell
        className={classNames(['DynaDropLabel', classes.dynaDropLabel, className])}
        style={style}>
        <div
          className={classes.labelEditor}
          ref={r => this.ref = r}
          onInput={this.onChange}
          onKeyDown={this.onKeyPress}
          onKeyUp={this.onKeyUp}
          contentEditable
          dangerouslySetInnerHTML={html} />

        <TargetToggle id={id} onToggleType={onToggleType} canToggle={canToggleType} />
      </TCell>
    );
  }

  renderView(): JSX.Element {
    return <div>{this.props.text}</div>;
  }

  render() : JSX.Element {
    const { editMode } = this.props;

    return editMode ? this.renderEdit() : this.renderView();
  }
}

const StyledDynaDropLabel = withStyles<DynaDropLabelProps>(styles)(DynaDropLabel);
export { StyledDynaDropLabel as DynaDropLabel };
