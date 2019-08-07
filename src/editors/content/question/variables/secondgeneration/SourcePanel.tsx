import * as contentTypes from 'data/contentTypes';
import * as React from 'react';
import AceEditor from 'react-ace';
import './SourcePanel.scss';
import Measure from 'react-measure';
// KEVIN-2012  next replace <Measure> with my own custom component
// https://stackoverflow.com/questions/25371926/...
// (url continued): how-can-i-respond-to-the-width-of-an-auto-sized-dom-element-in-react
// requires lodash.throttle (0 dependencies) and shallowEqual (0 dependencies)

import 'brace/theme/tomorrow_night_bright';

interface SourcePanelProps {
  editMode: boolean;
  model: contentTypes.Variable;
  onExpressionEdit: (expression: string) => void;
  evaluate: () => void;
  onSwitchToOldVariableEditor: () => void;
}

interface SourcePanelState {
  componentWidth: number; // needed to automatically resize
  innerComponentPct: string; // toggle b/t 99% and 100%
}

// AceEditor is inside here!
export class SourcePanel extends React.Component<SourcePanelProps, SourcePanelState> {
  constructor(props: SourcePanelProps) {
    super(props);

    this.state = {
      componentWidth: 0, // who cares, just init at zero
      innerComponentPct: '100%',
    };
  }

  reactAceComponent: any;

  componentDidMount() {
    // Fixes an issue where editor was not being focused on load
    document.activeElement && (document.activeElement as any).blur();
    // Disables a console warning shown by AceEditor
    this.reactAceComponent.editor.$blockScrolling = Infinity;
  }

  render() {
    const { editMode, model, onExpressionEdit, evaluate, onSwitchToOldVariableEditor }
      = this.props;

      // div class="ace_content" has a style attribute "width" that changes.
      // we can force this change by changing the innerComponentPct state
    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          this.setState({
            componentWidth: contentRect.bounds.width,
            innerComponentPct: this.state.innerComponentPct === '99%' ? '100%' : '99%',
          });
        }}
      >
        {({ measureRef }) => (
      <div className="sourcePanel" ref={measureRef}>
        <span className="panelTitle">JavaScript</span>
        <AceEditor
          ref={ref => this.reactAceComponent = ref}
          className="source"
          name="source"
          width={this.state.innerComponentPct}
          height="100%"
          mode="javascript"
          theme="tomorrow_night_bright"
          readOnly={!editMode}
          minLines={3}
          focus={true}
          value={model.expression}
          onChange={onExpressionEdit}
          commands={
            [
              {
                name: 'evaluate',
                bindKey: { win: 'Ctrl-enter', mac: 'Command-enter' },
                exec: () => evaluate(),
              },
              {
                name: 'switchToOldVariableEditor',
                bindKey: { win: 'Ctrl-Shift-0', mac: 'Command-Shift-0' },
                exec: () => onSwitchToOldVariableEditor(),
              },
            ]
          }
          annotations={[{ row: 0, column: 2, type: 'error', text: 'Some error.' }]}
          markers={[{
            startRow: 0, startCol: 2, endRow: 1, endCol: 20,
            className: 'error-marker', type: 'background',
          }]}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            showPrintMargin: true,
            useWorker: false,
            showGutter: true,
            highlightActiveLine: true,
            wrap: true,
          }}
        />
      </div>
      )}
      </Measure>
    );
  }
}
