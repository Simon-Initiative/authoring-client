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

import { styles } from 'editors/content/question/VariableModuleEditor.styles';
import { Variables } from 'data/content/assessment/variable';
import ModalSelection from 'utils/selection/ModalSelection';
import { ModalMessage } from 'utils/ModalMessage';

export interface VariablesEditorProps extends AbstractContentEditorProps<Variables> {
  displayModal: (component: any) => void;
  dismissModal: () => void;
}

export interface VariablesEditorState {
  results: Immutable.Map<string, Evaluation>;
  // editorThemeIsDark: boolean;
}

export const MODULE_IDENTIFIER = 'module';

interface ModuleEditorProps {
  editMode: boolean;
  model: contentTypes.Variable;
  onExpressionEdit: (expression: string) => void;
}
@injectSheet(styles)
class ModuleEditor extends React.Component
<StyledComponentProps<ModuleEditorProps>, {}> {
  constructor(props) {
    super(props);
  }
  reactAceComponent: any;

  render() {
    const { classes, className, editMode, model, onExpressionEdit } = this.props;

    if (!(model.size > 0)) {
      return null;
    }

    return (
      <AceEditor
        ref={ref => this.reactAceComponent = ref}
        className={classes.source}
        name="source"
        width="500px"
        mode="javascript"
        theme="tomorrow_night_bright"
        readOnly={!editMode}
        minLines={3}
        maxLines={20}
        value={model.expression}
        onChange={onExpressionEdit}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          showPrintMargin: true,
          useWorker: false,
          showGutter: true,
          highlightActiveLine: false,
        }}
      />
    );
  }
}

interface ModuleEvaluationProps {
  editMode: boolean;
  model: contentTypes.Variable;
  results: Immutable.Map<string, Evaluation>;
}
@injectSheet(styles)
class ModuleEvaluation extends React.Component
<StyledComponentProps<ModuleEvaluationProps>, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { model, results, classes, className } = this.props;

    if (!(results.size > 0)) {
      return null;
    }

    const evaluation = results.has(model.name)
      ? results.get(model.name).errored
        ? <span className={classNames([classes.error, className])}>Error</span>
        : <span className={classNames([classes.evaluated, className])}>
          {results.get(model.name).result}
        </span>
      : null;

    return (
      <div className="evaluatedPanel">
        {evaluation}
      </div>
    );
  }
}


interface ModalModuleEditorProps {
  editMode: boolean;
  model: contentTypes.Variable;
  results: Immutable.Map<string, Evaluation>;
  onExpressionEdit: (expression: string) => void;
}
@injectSheet(styles)
class ModalModuleEditor extends React.Component
<StyledComponentProps<ModalModuleEditorProps>, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, className, model, results, onExpressionEdit } = this.props;

    return (
      <div className={classNames([classes.VariableModuleEditor, className])}>
        <div className={classes.splitPane}>
          <ModuleEditor
            {...this.props}
            model={model}
            onExpressionEdit={onExpressionEdit} />
          <ModuleEvaluation
            {...this.props}
            model={model}
            results={results} />
        </div>
      </div>
    );
  }
}

@injectSheet(styles)
export class VariableModuleEditor
  extends AbstractContentEditor<Variables,
  StyledComponentProps<VariablesEditorProps>, VariablesEditorState> {



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

  shouldComponentUpdate(nextProps, nextState: VariablesEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state.results !== nextState.results;
  }

  componentDidMount() {
    // this.setState({
    //   editorThemeIsDark: loadFromLocalStorage('editorTheme') as boolean
    //     || this.state.editorThemeIsDark,
    // });
  }

  onExpressionEdit(expression) {
    const { onEdit, model } = this.props;

    const variable = model.first();

    onEdit(
      model.set(variable.guid, variable.with({ expression })),
      null);
  }

  onOpenEditorPopup() {
    const { model, displayModal, dismissModal } = this.props;

    const variable = model.first();

    const modal = <ModalMessage
      onCancel={() => dismissModal()}
      okLabel="Okay">
      <ModalModuleEditor
        {...this.props}
        model={variable}
        onExpressionEdit={this.onExpressionEdit}
        results={this.state.results} />
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

    // Clear the current results and re-evaluate
    this.setState(
      { results: Immutable.Map<string, Evaluation>() },
      () => evaluate(model).then((results) => {
        console.log('results', results);
        this.setState({
          results: Immutable.Map<string, Evaluation>(results.map(r => [r.variable, r])),
        });
      }));
  }

  onEnableVariables() {
    const { onEdit, model } = this.props;

    const name = MODULE_IDENTIFIER;

    const variable = new contentTypes.Variable().with({
      name,
    });

    onEdit(model.set(variable.guid, variable), null);
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
      title={`Remove all variables?`}
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
    const { classes, className, model, editMode } = this.props;

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
      <div className={classNames([classes.buttonPanel, className])}>
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
    const { classes, className } = this.props;

    return (
      <div className={classNames([classes.header, className])}>
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
    const { classes, className, model } = this.props;

    const variable = model.first();

    return (
      <div className={classNames([classes.VariableModuleEditor, className])}>
        {this.renderHelpPopup()}
        {variable &&
          <div className={classes.splitPane}>
            <ModuleEditor
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit} />
            <ModuleEvaluation
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
