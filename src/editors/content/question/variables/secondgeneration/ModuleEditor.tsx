import * as React from 'react';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditorProps, AbstractContentEditor }
  from 'editors/content/common/AbstractContentEditor';
import { Variables } from 'data/content/assessment/variable';
import { SourcePanel } from 'editors/content/question/variables/secondgeneration/SourcePanel';
import { ResultsPanel } from 'editors/content/question/variables/secondgeneration/ResultsPanel';
import { Tooltip } from 'utils/tooltip';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { SidebarHelp } from 'editors/content/question/variables/secondgeneration/SidebarHelp';

import './ModuleEditor.scss';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

const NUMBER_OF_ATTEMPTS = 10;

export interface ModuleEditorProps extends AbstractContentEditorProps<Variables> {
  setSidebarContent: (content: JSX.Element) => void;
  resetSidebarContent: () => void;
  activeChild: Maybe<ContentElement>;
  onSwitchToOldVariableEditor: () => void;
}

export interface ModuleEditorState {
  results: Evaluation[];
  testing: boolean;
  testingCompleted: boolean;
  failed: boolean;
}

export class ModuleEditor extends AbstractContentEditor<Variables,
  ModuleEditorProps, ModuleEditorState> {

  activeContent: any;
  source: any;

  constructor(props) {
    super(props);

    this.onEvaluate = this.onEvaluate.bind(this);
    this.onExpressionEdit = this.onExpressionEdit.bind(this);
    this.onRun = this.onRun.bind(this);
    this.onSidebarInsert = this.onSidebarInsert.bind(this);

    this.state = {
      results: [],
      testing: false,
      testingCompleted: false,
      failed: false,
    };
  }

  componentWillReceiveProps(nextProps: ModuleEditorProps) {
    const { resetSidebarContent } = this.props;

    // This component extends AbstractContentEditor, so it hooks
    // into the `active` reducer. Focusing the editor will trigger the
    // updateContext action with the model as the activeChild, so we can
    // reset the sidebar content if the activeChild is anything other than the
    // model.
    nextProps.activeChild.lift((activeChild) => {
      if (activeChild !== this.props.model as any) {
        resetSidebarContent();
      }
    });
  }

  componentDidMount() {
    this.evaluateOnce();
  }

  componentWillUnmount() {
    this.props.resetSidebarContent();
  }

  shouldComponentUpdate() {
    return true;
  }

  onExpressionEdit(expression: string) {
    const { onEdit, model } = this.props;

    const variable = model.first();

    onEdit(
      model.set(variable.guid, variable.with({ expression })),
      null);
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  evaluateOnce() {
    // Reset results and evaluate
    this.setState(
      { results: [] },
      () => evaluate(this.props.model).then(results =>
        this.setState({ results })),
    );
  }

  onEvaluate(attempts = NUMBER_OF_ATTEMPTS): Promise<void> {
    return evaluate(this.props.model, attempts)
      .then(results => this.setState({ results }));
  }

  onRun() {
    this.setState(
      {
        testing: true,
        testingCompleted: false,
        results: [],
      },
      () => this.onEvaluate()
        .then(_ => this.setState({
          failed: false,
          testing: false,
          testingCompleted: true,
        }))
        .catch(_ => this.setState({
          failed: true,
          testing: false,
          testingCompleted: true,
        })));
  }

  onSidebarInsert(content: string) {
    const { editor } = this.source.reactAceComponent;
    editor.insert(content);
  }

  renderBottomPanel() {
    const { editMode } = this.props;

    const wrap = key => <span className="key-wrapper">{key}</span>;

    const runHotkeys = <React.Fragment>
      {wrap('⌘')} {wrap('Enter')} / {wrap('Ctrl')} {wrap('Enter')}
    </React.Fragment>;

    const runButton = <Tooltip html={runHotkeys} delay={100} distance={5}
      position="top" style={{ display: 'inline-block' }} size="small" arrowSize="small">
      <button className="btn btn-sm btn-link module-button run-button" type="button"
        disabled={!editMode}
        onClick={this.onRun}>
        <i className="fa fa-play"></i> Run
      </button>
    </Tooltip >;

    const testResults =
      this.state.testing
        ? <span className="vertical-center">
          <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> Testing...
        </span>
        : this.state.testingCompleted
          ? this.state.failed
            ? <span className="vertical-center">
              <i className="fa fa-ban fa-2x" style={{ color: '#f39c12' }}></i> Try again
            </span>
            : null
          : null;

    return (
      <div className="button-panel">
        {runButton}
        {testResults}
      </div>
    );
  }

  renderMain() {
    const { model, setSidebarContent, onSwitchToOldVariableEditor } = this.props;

    const variable = model.first();

    return (
      <div
        className="moduleEditor"
        onFocus={() => setSidebarContent(
          <SidebarHelp onInsert={this.onSidebarInsert} />,
        )}>
        {
          variable &&
          <div className="splitPane">
            <SourcePanel
              ref={ref => this.source = ref}
              {...this.props}
              model={variable}
              onExpressionEdit={this.onExpressionEdit}
              evaluate={this.onEvaluate}
              onSwitchToOldVariableEditor={onSwitchToOldVariableEditor} />
            <ResultsPanel
              evalResults={this.state.results}
              onSwitchToOldVariableEditor={onSwitchToOldVariableEditor} />
          </div>
        }
        {this.renderBottomPanel()}
      </div >
    );
  }
}
