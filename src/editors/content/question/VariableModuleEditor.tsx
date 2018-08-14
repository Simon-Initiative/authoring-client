import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import AceEditor from 'react-ace';

import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/github';

import 'editors/content/question/VariableModuleEditor.scss';
import { Variables, MODULE_IDENTIFIER } from 'data/content/assessment/variable';
import ModalSelection from 'utils/selection/ModalSelection';
import { ModalMessage } from 'utils/ModalMessage';

interface EditorPanelProps {
  editMode: boolean;
  model: contentTypes.Variable;
  onExpressionEdit: (expression: string) => void;
  onTestExpressions: () => void;
}

class EditorPanel extends React.Component<EditorPanelProps, {}> {
  constructor(props: EditorPanelProps) {
    super(props);
  }
  reactAceComponent: any;

  componentDidMount() {
    // this.reactAceComponent.editor.commands.addCommand();
  }

  render() {
    const { editMode, model, onExpressionEdit, onTestExpressions } = this.props;

    if (!(model.size > 0)) {
      return null;
    }
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
          value={model.expression}
          onChange={onExpressionEdit}
          commands={
            [
              {
                name: 'evaluate',
                bindKey: { win: 'Ctrl-enter', mac: 'Command-enter' },
                exec: () => console.log('hey') || onTestExpressions,
              },
            ]
          }
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

interface EvaluatedPanelProps {
  editMode: boolean;
  model: contentTypes.Variable;
  results: Immutable.Map<string, Evaluation>;
}

class EvaluatedPanel extends React.Component<EvaluatedPanelProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { model, results } = this.props;

    const resultLines = results.toArray()
      .map(r => r.variable + ': ' + JSON.stringify(r.result))
      .join('\n');

    return (
      <div className="evaluatedPanel">
        <span className="panelTitle">Results</span>
        <AceEditor
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
            tabSize: 2,
            wrap: true,
          }}
        />
      </div>
    );
  }
}


interface ModalModuleEditorProps {
  editMode: boolean;
  model: contentTypes.Variable;
  results: Immutable.Map<string, Evaluation>;
  onExpressionEdit: (expression: string) => void;
  onTestExpressions: () => void;
}

class ModalModuleEditor extends React.Component<ModalModuleEditorProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { model, results, onExpressionEdit, onTestExpressions } = this.props;
    console.log('results in modal', results);

    return (
      <div className="variableModuleEditor modalEditor">
        <div className="splitPane">
          <EditorPanel
            {...this.props}
            model={model}
            onExpressionEdit={onExpressionEdit}
            onTestExpressions={onTestExpressions}
          />
          <EvaluatedPanel
            {...this.props}
            model={model}
            results={results} />
        </div>
      </div>
    );
  }
}

interface TestSuiteProps {

}
export class TestSuite extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      null
    );
  }
}

export interface VariableModuleEditorProps extends AbstractContentEditorProps<Variables> {
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

export interface VariableModuleEditorState {
  results: Immutable.Map<string, Evaluation>;
  // editorThemeIsDark: boolean;
}

export class VariableModuleEditor
  extends AbstractContentEditor<Variables, VariableModuleEditorProps, VariableModuleEditorState> {

  constructor(props) {
    super(props);

    this.onEnableVariables = this.onEnableVariables.bind(this);
    this.onDisableVariables = this.onDisableVariables.bind(this);
    this.onTestExpressions = this.onTestExpressions.bind(this);
    this.onOpenEditorPopup = this.onOpenEditorPopup.bind(this);
    this.onExpressionEdit = this.onExpressionEdit.bind(this);

    this.state = {
      results: Immutable.Map<string, Evaluation>(),
      // editorThemeIsDark: true,
    };
  }

  shouldComponentUpdate(
    nextProps: VariableModuleEditorProps,
    nextState: VariableModuleEditorState) {
    // return super.shouldComponentUpdate(nextProps, nextState)
    //   || this.state.results !== nextState.results;
    return true;
  }

  componentDidMount() {
    this.evaluateVariablesIfPresent();
    // this.setState({
    //   editorThemeIsDark: loadFromLocalStorage('editorTheme') as boolean
    //     || this.state.editorThemeIsDark,
    // });
  }

  evaluateVariablesIfPresent() {
    const { model } = this.props;
    if (model.size > 0) {
      this.onTestExpressions();
    }
  }

  onExpressionEdit(expression) {
    const { onEdit, model } = this.props;

    const variable = model.first();

    onEdit(
      model.set(variable.guid, variable.with({ expression })),
      null);
  }

  onOpenEditorPopup() {
    const { editMode, model, displayModal, dismissModal } = this.props;

    const variable = model.first();

    const modal = <ModalMessage
      onCancel={() => dismissModal()}
      okLabel="Okay">
      <ModalModuleEditor
        {...this.props}
        model={variable}
        onExpressionEdit={this.onExpressionEdit}
        results={this.state.results}
        onTestExpressions={this.onTestExpressions} />
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
      </button>
    </ModalMessage>;

    displayModal(modal);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  onTestExpressions() {

    const { model } = this.props;
    console.log('model', model);
    // Clear the current results and re-evaluate
    this.setState(
      { results: Immutable.Map<string, Evaluation>() },
      () => evaluate(model).then((results) => {
        console.log('results', results);
        this.setState({
          results: Immutable.Map<string, Evaluation>(results.get(0).map(r => [r.variable, r])),
        });
      }));
  }

  onTestMultipleTimes(attempts = 1000): Promise<Immutable.List<Evaluation[]>> {
    const { model } = this.props;

    return evaluate(model, attempts);
  }

  // Return the error count. `evaluate` returns a list of evaluations,
  // one for each attempt. We iterate through each attempt to see if
  // any of the variables in that evaluation failed. If so, we consider
  // the whole attempt as a failure and increment the error count.
  onDetermineErrorCount(attempts = 1000): Promise<number> {

    // We count as variable evaluation as 'errored' if the evaluator throws an error,
    // or if the variable evaluates to null or undefined (which occurs from array indexing
    // or by other logic errors)
    const hasError = (hasError, evaluation: Evaluation): boolean =>
      hasError ||
      evaluation.errored ||
      evaluation.result === null ||
      evaluation.result === undefined;

    const attemptHasError = (evaluations: Evaluation[]): boolean =>
      evaluations.reduce(hasError, false);

    const countAttemptErrors = (results: Immutable.List<Evaluation[]>): number =>
      results.reduce(
        (errorCount, evaluations) =>
          attemptHasError(evaluations)
            ? errorCount + 1
            : errorCount,
        0);

    return this.onTestMultipleTimes(attempts).then(results => countAttemptErrors(results));
  }

  onEnableVariables() {
    const { onEdit, model } = this.props;

    const name = MODULE_IDENTIFIER;

    const variable = new contentTypes.Variable().with({
      name,
    });

    onEdit(model.set(variable.guid, variable), null);
    // onTestExpressions does not have the updated model since the component has not been
    // rerendered with new props
  }

  onDisableVariables() {
    const { dismissModal, displayModal, onEdit, editMode } = this.props;

    const deleteAndDismiss = () => {
      this.setState(
        { results: Immutable.Map<string, Evaluation>() },
        () => onEdit(Immutable.OrderedMap<string, contentTypes.Variable>(), null));
      dismissModal();
    };

    const modal = <ModalSelection
      title="Remove all variables?"
      onCancel={dismissModal}
      onInsert={deleteAndDismiss}
      okClassName="danger"
      okLabel="Remove Variables"
      disableInsert={!editMode}>
      Are you sure you want to remove all variables from this question?
    </ModalSelection>;

    displayModal(modal);
  }

  renderButtonPanel() {
    const { model, editMode } = this.props;

    const testButton = <button className="btn btn-sm btn-link" type="button"
      disabled={!editMode}
      onClick={() => this.onTestExpressions()}>
      Test Expressions
    </button>;

    const openButton = model.size > 0
      ? <button className="btn btn-sm btn-link" type="button"
        disabled={!editMode}
        onClick={() => this.onOpenEditorPopup()}>
        Open in full window
    </button>
      : null;

    const createOrRemove = model.size > 0
      ? <button className="btn btn-sm btn-outline-danger" type="button"
        disabled={!editMode}
        onClick={() => this.onDisableVariables()}>
        Remove Variables
    </button>
      : <button className="btn btn-sm btn-outline-primary" type="button"
        disabled={!editMode}
        onClick={() => this.onEnableVariables()}>
        Create Variables
      </button>;

    return (
      <div className="buttonPanel">
        {createOrRemove}
        {openButton}
        {testButton}

        {/* <ToggleSwitch
          checked={this.state.editorThemeIsDark}
          labelBefore={<i className="fa fa-sun"></i>}
          label={<i className="fa fa-moon"></i>}
          onClick={() => {
            const isDark = !this.state.editorThemeIsDark;
            this.setState(
              { editorThemeIsDark: isDark },
              this.reactAceComponent.editor.setOptions({
                theme: isDark ? 'tomorrow_night_bright' : 'github',
              }));
          }} /> */}
      </div>
    );
  }

  renderHelpPopup() {

    return (
      <div className="variableHeader">
        Variables

        <HelpPopover activateOnClick>
          <div>
            <p>Use <b>variables</b> to create <b>templated</b> questions.
            A templated, or parameterized, question allows the creation
            of a question that can vary parts of the question.</p>

            <p>Once you have defined your variables, use them in your
              question by typing the variable name surrounded by &quot;@@&quot;</p>

            <p>For example, a question using two variables:</p>

            <blockquote>
              <code>
                What is the value @@V1@@ divided by @@V2@@ equal to?
              </code>
            </blockquote>

          </div>
        </HelpPopover>
      </div>
    );
  }

  renderMain() {
    const { model } = this.props;

    const variable = model.first();

    return (
      <div className="variableModuleEditor">
        {this.renderHelpPopup()}
        {variable &&
          <div className="splitPane">
            <EditorPanel
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit}
              onTestExpressions={this.onTestExpressions} />
            <EvaluatedPanel
              {...this.props}
              model={variable}
              results={this.state.results} />
          </div>
        }
        {this.renderButtonPanel()}
      </div>
    );
  }
}
