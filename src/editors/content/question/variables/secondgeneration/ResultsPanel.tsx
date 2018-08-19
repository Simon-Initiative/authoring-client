import * as React from 'react';
import * as Immutable from 'immutable';
import { Evaluation } from 'data/persistence/variables';
import AceEditor from 'react-ace';
import './ResultsPanel.scss';

import 'brace/theme/github';

interface ResultsPanelProps {
  evalResults: Immutable.Map<string, Evaluation>;
}

export class ResultsPanel extends React.Component<ResultsPanelProps, {}> {
  constructor(props) {
    super(props);
  }

  reactAceComponent: any;

  componentDidMount() {
    // Hide the cursor
    this.reactAceComponent.editor.renderer.$cursorLayer.element.style.display = 'none';
    // Disabled a console warning shown by AceEditor
    this.reactAceComponent.editor.$blockScrolling = Infinity;
  }

  render() {
    const { evalResults } = this.props;

    const resultLines = evalResults.toArray()
      .map(r => r.variable + ': ' + JSON.stringify(r.result))
      .join('\n');

    return (
      <div className="resultsPanel">
        <span className="panelTitle">Results</span>
        <AceEditor
          ref={ref => this.reactAceComponent = ref}
          className="evaluated"
          name="source"
          width="100%"
          height="100%"
          mode="javascript"
          theme="github"
          readOnly={true}
          minLines={3}
          value={resultLines}
          setOptions={{
            showLineNumbers: false,
            useWorker: false,
            showGutter: false,
            tabSize: 2,
            wrap: true,
          }}
        />
      </div>
    );
  }
}
