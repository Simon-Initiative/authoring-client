import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Evaluation, evaluate } from 'data/persistence/variables';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';

import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/html';
import 'brace/mode/xml';
import 'brace/mode/actionscript';
import 'brace/mode/sh';
import 'brace/mode/c_cpp';
import 'brace/mode/text';

import 'brace/theme/github';

import { styles } from './VariablesEditor.styles';

export interface VariablesEditorProps extends AbstractContentEditorProps<Variables> {

}

export interface VariablesEditorState {
  results: Immutable.Map<string, Evaluation>;
}

type Variables = Immutable.OrderedMap<string, contentTypes.Variable>;

/**
 * VariablesEditor React Component
 */
@injectSheet(styles)
export class VariablesEditor
  extends AbstractContentEditor<Variables,
  StyledComponentProps<VariablesEditorProps>, VariablesEditorState> {


  constructor(props) {
    super(props);

    this.onAddVariable = this.onAddVariable.bind(this);
    this.onTestExpressions = this.onTestExpressions.bind(this);

    this.state = {
      results: Immutable.Map<string, Evaluation>(),
    };
  }

  shouldComponentUpdate(nextProps, nextState: VariablesEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state.results !== nextState.results;
  }

  onExpressionEdit(variable, expression) {
    const { onEdit, model } = this.props;

    onEdit(
      model.set(variable.guid, variable.with({
        expression,
      })),
      null);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderVariable(variable: contentTypes.Variable) {
    const { classes, className, model, editMode } = this.props;

    const evaluation = this.state.results.has(variable.name)
      ? this.state.results.get(variable.name).errored
        ? <span className={classNames([classes.error, className])}>Error</span>
        : <span className={classNames([classes.evaluated, className])}>
            {this.state.results.get(variable.name).result}
          </span>
      : null;

    return (
      <tr>
        <td className={classNames([classes.variableLabel, className])}>
          {variable.name}
        </td>
        <td>
          <AceEditor
            name={variable.name}
            width="initial"
            mode="javascript"
            theme="github"
            readOnly={!editMode}
            minLines={1}
            maxLines={40}
            value={variable.expression}
            onChange={this.onExpressionEdit.bind(this, variable)}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: false,
              tabSize: 2,
              showPrintMargin: false,
              useWorker: false,
              showGutter: false,
              highlightActiveLine: false,
            }}
          />
        </td>
        <td className={classNames([classes.variableResult, className])}>
          {evaluation}
        </td>
        <td>
          <span className="remove-btn">
            <button
              disabled={!editMode}
              onClick={this.onRemoveVariable.bind(this, variable.guid)}
              type="button"
              className="btn btn-sm">
              <i className="fa fa-close"></i>
            </button>
          </span>
        </td>
      </tr>
    );
  }

  onTestExpressions() {

    const { model } = this.props;

    // Clear the current results and re-evaluate
    this.setState(
      { results: Immutable.Map<string, Evaluation>() },
      () => evaluate(model).then((results) => {
        this.setState({
          results: Immutable.Map<string, Evaluation>(results.map(r => [r.variable, r])),
        });
      }));


  }

  onRemoveVariable(guid: string) {
    const { onEdit, model } = this.props;

    let position = 0;
    onEdit(model.delete(guid).map((variable) => {
      position = position + 1;
      return variable.with({ name: 'V' + (position) });
    }).toOrderedMap());
  }

  onAddVariable() {
    const { onEdit, model } = this.props;

    const name = 'V' + (model.size + 1);

    const variable = new contentTypes.Variable().with({
      name,
    });

    onEdit(model.set(variable.guid, variable), null);
  }

  renderButtonPanel() {
    const { classes, className, model, editMode } = this.props;

    // Only show the "Test" button when there is one or more
    // variables
    const testButton = model.size > 0
      ? <button className="btn btn-sm btn-link" type="button"
      disabled={!editMode}
      onClick={() => this.onTestExpressions()}>
      Test Expressions
    </button>
    : null;

    return (
      <div className={classNames([classes.buttonPanel, className])}>
        <button className="btn btn-sm btn-link" type="button"
          disabled={!editMode}
          onClick={() => this.onAddVariable()}>
          Add Variable
        </button>
        {testButton}
      </div>
    );
  }

  renderHeader() {
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

    const tableOrNot = model.size > 0
      ? <table className={classNames(['table', 'table-sm'])}>
          <thead>
            <tr>
              <th>Var</th>
              <th>Expression</th>
              <th>Evaluation</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {model.toArray().map(v => this.renderVariable(v))}
          </tbody>
        </table>
      : null;

    return (
      <div className={classNames([classes.VariablesEditor, className])}>
        {this.renderHeader()}
        {tableOrNot}
        {this.renderButtonPanel()}
      </div>
    );
  }
}
