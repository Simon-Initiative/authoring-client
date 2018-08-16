import * as React from 'react';
import { ModalMinimal } from 'utils/ModalMinimal';
import { ModuleEditor } from 'editors/content/question/variables/secondgeneration/ModuleEditor';
import { Variables } from 'data/content/assessment/variable';
import { AbstractContentEditorProps } from 'editors/content/common/AbstractContentEditor';

export interface ModuleModalProps extends AbstractContentEditorProps<Variables> {
  // displayModal: (component: any) => void;
  // dismissModal: () => void;
}

export interface ModuleModalState {
  // results: Immutable.Map<string, Evaluation>;
}

export class ModuleModal extends React.Component<ModuleModalProps, ModuleModalState> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ModalMinimal>
        <ModuleEditor
          {...this.props}
           />
        {/* <div className="ModuleModal modalEditor">
          <div className="splitPane">
            <SourcePanel
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit}
              onTestExpressions={this.onTestExpressions}
            />
            <ResultsPanel
              results={this.state.results} />
          </div>
       </div>
        <button className="btn btn-sm btn-primary" type="button"
          disabled={!editMode}
          onClick={() => this.onTestExpressions()}>
          Run Once
      </button>
        <button className="btn btn-sm btn-outline-primary" type="button"
          disabled={!editMode}
          onClick={() => this.onDetermineErrorCount()
            .then(count => console.log('errorCount', count))}>
          Test 1,000 Times
      </button> */}
      </ModalMinimal>
    );
  }
}
