import * as React from 'react';
import * as Immutable from 'immutable';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditorProps, AbstractContentEditor }
  from 'editors/content/common/AbstractContentEditor';
import { Variables } from 'data/content/assessment/variable';
import { SourcePanel } from 'editors/content/question/variables/secondgeneration/SourcePanel';
import { ResultsPanel } from 'editors/content/question/variables/secondgeneration/ResultsPanel';
import { Tooltip } from 'utils/tooltip';
import { Maybe, Either } from 'tsmonad';
import { TestResults } from 'editors/content/question/variables/secondgeneration/TestResults';
import { ContentElement } from 'data/content/common/interfaces';

import './ModuleEditor.scss';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';
import { SidebarHelp } from 'editors/content/question/variables/secondgeneration/SidebarHelp';

const NUMBER_OF_ATTEMPTS = 10;

export interface ModuleEditorProps extends AbstractContentEditorProps<Variables> {
  setSidebarContent: (content: JSX.Element) => void;
  resetSidebarContent: () => void;
  activeChild: Maybe<ContentElement>;
}

export interface ModuleEditorState {
  results: Evaluation[];
  // errorCount: number;
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

    this.onEvaluateVariables = this.onEvaluateVariables.bind(this);
    this.onExpressionEdit = this.onExpressionEdit.bind(this);
    this.onTestMultipleTimes = this.onTestMultipleTimes.bind(this);
    this.onSetActiveContent = this.onSetActiveContent.bind(this);
    this.onSidebarInsert = this.onSidebarInsert.bind(this);

    this.state = {
      results: [],
      // errorCount: undefined,
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
    this.onEvaluateVariables();
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
    return (
      <div>this is a sidebar</div>
    );
  }

  renderToolbar() {
    return null;
  }

  onSetActiveContent() {

  }

  onEvaluateVariables() {

    const { model } = this.props;
    // Clear the current results and re-evaluate
    this.setState(
      { results: [] },
      () => evaluate(model).then((results) => {
        this.setState({
          results: results.first(),
        });
      }));
  }

  // Return the error count. `evaluate` returns a list of evaluations,
  // one for each attempt. We iterate through each attempt to see if
  // any of the variables in that evaluation failed. If so, we consider
  // the whole attempt as a failure and increment the error count.
  onTestMultipleTimes(attempts = NUMBER_OF_ATTEMPTS): Promise<Evaluation[]> {

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

    const didFail = evaluation =>
      evaluation.result === null ||
      evaluation.result === undefined;

    // const test = (results: Immutable.List<Evaluation[]>) =>
    //   results.reduce(
    //     (either, evals) => either.bind(
    //       evals.some(evaluation => evaluation.errored)
    //         ? Either.left(evals[0].result)
    //         : Either.right(evals.map(eval => didFail(eval)
    //           ? Object.assign(eval, result: )
    //           :
    //         ))),
    //     // Either<error, eval[]>
    //     Either.right<string, Evaluation[]>([]));

    return this.runTests(attempts).then((results) => {
      const map: any = { errored: false, error: '', results: {} };
      results.forEach((attempt) => {
        attempt.forEach((evaluation) => {
          console.log('evaluation', evaluation);
          if (evaluation.errored) {
            map.errored = true;
            map.error = evaluation.result;
          } else if (didFail(eval)) {
            map.results[evaluation.variable] = 'Failed';
          } else if (!map[evaluation.variable]) {
            map.results[evaluation.variable] = evaluation.result;
          }
        });
        console.log('map', map);
      });
      if (map.errored) {
        console.log(
          'results',
          [{ variable: 'module', result: map.error, errored: true } as Evaluation]);
        return [{ variable: 'module', result: map.error, errored: true } as Evaluation];
      }
      console.log(
        'results',
        map.results.values());
      return map.results.values();
    });
  }

  runTests(attempts = NUMBER_OF_ATTEMPTS): Promise<Immutable.List<Evaluation[]>> {
    const { model } = this.props;

    return evaluate(model, attempts);
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
        onClick={() => {
          // this.setState({
          //   testing: true,
          //   testingCompleted: false,
          // });
          // this.onTestMultipleTimes()
          //   .then(results => this.setState({
          //     testing: false,
          //     testingCompleted: true,
          //     results,
          //     failed: false,
          //   }))
          //   .catch(_ => this.setState({
          //     failed: true,
          //     testing: false,
          //     testingCompleted: true,
          //   }));
          this.onEvaluateVariables();
        }}>
        <i className="fa fa-play"></i> Run
      </button>
    </Tooltip>;

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
          // : <TestResults />
          : null;

    return (
      <div className="button-panel">
        {runButton}
        {/* {testButton} */}
        {testResults}
      </div>
    );
  }

  renderMain() {
    const { model, setSidebarContent } = this.props;

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
              evaluateVariables={this.onEvaluateVariables}
              testMultipleTimes={this.onTestMultipleTimes} />
            <ResultsPanel
              evalResults={this.state.results} />
          </div>
        }
        {this.renderBottomPanel()}
      </div >
    );
  }
}
