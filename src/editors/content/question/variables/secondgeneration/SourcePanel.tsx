import * as contentTypes from 'data/contentTypes';
import * as React from 'react';
import AceEditor from 'react-ace';
import './SourcePanel.scss';

import 'brace/theme/tomorrow_night_bright';

interface SourcePanelProps {
  editMode: boolean;
  model: contentTypes.Variable;
  onExpressionEdit: (expression: string) => void;
  evaluateVariables: () => void;
  testMultipleTimes: () => void;
}

export class SourcePanel extends React.Component<SourcePanelProps, {}> {
  constructor(props: SourcePanelProps) {
    super(props);
  }
  reactAceComponent: any;

  componentDidMount() {
    // Fixes an issue where editor was not being focused on load
    document.activeElement && (document.activeElement as any).blur();
    // Disables a console warning shown by AceEditor
    this.reactAceComponent.editor.$blockScrolling = Infinity;
  }

  render() {
    const { editMode, model, onExpressionEdit, evaluateVariables, testMultipleTimes } = this.props;

    return (
      <div className="sourcePanel">
        <span className="panelTitle">JavaScript</span>
        <AceEditor
          ref={ref => this.reactAceComponent = ref}
          className="source"
          name="source"
          width="100%"
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
                exec: () => evaluateVariables(),
              },
              {
                name: 'test',
                bindKey: { win: 'Ctrl-shift-enter', mac: 'Command-shift-enter' },
                exec: () => testMultipleTimes(),
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
    );
  }
}
