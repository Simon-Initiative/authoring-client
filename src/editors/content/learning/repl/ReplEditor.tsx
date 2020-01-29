import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';
import { styles } from './ReplEditor.styles';
import { EmbedActivityModel } from 'data/models/embedactivity';
import { Maybe, maybe } from 'tsmonad';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Editor } from 'slate-react';
import * as $ from 'jquery';
import { Value } from 'slate';
import * as contentTypes from 'data/contentTypes';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/html';
import 'brace/mode/xml';
import 'brace/mode/actionscript';
import 'brace/mode/sh';
import 'brace/mode/c_cpp';
import 'brace/mode/text';
import 'brace/theme/chrome';
import { RichText, renderMark, renderNode } from 'data/content/rich_text';
import { TextSelection } from 'types/active';
import {
  renderLayoutHtml, renderQuestionsXml, renderSolutionsXml, Question,
} from './repl_assets';
import guid from 'utils/guid';
import { Button } from 'components/common/Button';
import { Tooltip } from 'utils/tooltip';
import colors from 'styles/colors';
import { Badge } from 'editors/content/common/Badge';
import { markHotkey } from '../contiguoustext/render/render';
import { caseOf, valueOr } from 'utils/utils';
import { ConfirmModal } from 'components/ConfirmModal';
import { AppServices } from 'editors/common/AppServices';

const ACE_EDITOR_OPTIONS = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: false,
  showLineNumbers: true,
  tabSize: 2,
  useWorker: false,
  showGutter: true,
  highlightActiveLine: false,
};

const RICH_TEXT_EDITOR_PLUGINS = [
  markHotkey({ key: 'b', type: 'bold' }),
  markHotkey({ key: 'i', type: 'italic' }),
  markHotkey({ key: 'u', type: 'underline' }),
  markHotkey({ key: 'h', type: 'highlight' }),
];


const parseLayoutHtmlFromModel = (model: EmbedActivityModel) => {
  const layoutHtml = maybe(model.assets.find(asset => asset.name === 'layout')).caseOf({
    just: layoutAsset => layoutAsset.content.caseOf({
      just: html => html,
      nothing: () => renderLayoutHtml(),
    }),
    nothing: () => renderLayoutHtml(),
  });

  return $(layoutHtml);
};
const parseQuestionsXmlFromModel = (model: EmbedActivityModel) => {
  const questionsXml = maybe(model.assets.find(asset => asset.name === 'questions')).caseOf({
    just: questionsAsset => questionsAsset.content.caseOf({
      just: xml => xml,
      nothing: () => renderQuestionsXml(),
    }),
    nothing: () => renderQuestionsXml(),
  });

  return $.parseXML(questionsXml);
};
const parseSolutionXmlFromModel = (model: EmbedActivityModel) => {
  const solutionsXml = maybe(model.assets.find(asset => asset.name === 'solutions')).caseOf({
    just: solutionsAsset => solutionsAsset.content.caseOf({
      just: xml => xml,
      nothing: () => renderSolutionsXml(),
    }),
    nothing: () => renderSolutionsXml(),
  });

  return $.parseXML(solutionsXml);
};

const promptHtmlFromModel = (model: EmbedActivityModel) => {
  const parsedLayoutHtml = parseLayoutHtmlFromModel(model);
  const promptHtml = $('#prompt', parsedLayoutHtml)[0]
      && $('#prompt', parsedLayoutHtml)[0].innerHTML
    || $('#q1_prompt', parsedLayoutHtml)[0]
      && $('#q1_prompt', parsedLayoutHtml)[0].innerHTML
    || '<p></p>';

  return promptHtml;
};

const isCodeEditorVisibleFromModel = (model: EmbedActivityModel) => {
  const parsedLayoutHtml = parseLayoutHtmlFromModel(model);

  return $('#editor', parsedLayoutHtml)[0] !== undefined;
};

const questionFromModel = (model: EmbedActivityModel) => {
  const parsedQuestionsXmlFromModel = parseQuestionsXmlFromModel(model);

  const q1 = $('question', parsedQuestionsXmlFromModel)[0];
  return q1 && {
    id: q1.getAttribute('id'),
    initeditortext: $('initeditortext', q1).text().trim(),
    language: $('language', q1).text().trim() || 'python',
    functionname: $('functionname', q1).text().trim(),
    testCases: $('testcase', q1).map(function () {
      return {
        guid: guid(),
        input: $('input', this).text().trim(),
        output: $('output', this).text().trim(),
      };
    }).toArray(),
    hints: $('hint', q1).map(function () {
      return {
        id: this.getAttribute('id'),
        content: RichText.fromHtml(valueOr(this.innerHTML, '<div></div>').trim()),
      };
    }).toArray(),
  };
};

const defaultQuestion = () => ({
  id: guid(),
  initeditortext: '',
  language: 'python',
  functionname: '',
  testCases: [],
  hints: [],
});

const solutionTextFromModel = (model: EmbedActivityModel) => {
  const parsedSolutionXmlFromModel = parseSolutionXmlFromModel(model);
  return $('solution', parsedSolutionXmlFromModel)[0] &&
    $('solution', parsedSolutionXmlFromModel).text().trim();
};

const replLangFromQuetsion = (q: Question) => caseOf(q.language)({
  python: 'python3',
  java: 'java9',
})(q.language);

export interface ReplEditorProps extends AbstractContentEditorProps<EmbedActivityModel> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
  onRichTextFocus: (
    model: contentTypes.RichText,
    editor: Editor,
    textSelection:  Maybe<TextSelection>,
  ) => void;
  onUpdateEditor: (editor) => void;
  services: AppServices;
}

export interface ReplEditorState {
  maybePrompt: Maybe<RichText>;
  showCodeEditor: boolean;
  solutionText: string;
  question: Question;
  isRunning: boolean;
  isSubmitting: boolean;
  hintEditors: Immutable.Map<string, Editor>;
}

class ReplEditor
  extends AbstractContentEditor<EmbedActivityModel,
  StyledComponentProps<ReplEditorProps, typeof styles>, ReplEditorState> {
  replClient: any;
  promptEditor: Editor;
  consoleDiv: HTMLDivElement;

  constructor(props) {
    super(props);

    this.state = {
      maybePrompt: Maybe.nothing(),
      showCodeEditor: true,
      solutionText: '',
      question: defaultQuestion(),
      isRunning: false,
      isSubmitting: false,
      hintEditors: Immutable.Map(),
    };
  }

  shouldComponentUpdate(
    nextProps: StyledComponentProps<ReplEditorProps, JSSStyles>, nextState: ReplEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.props.model !== nextProps.model
      || Object.keys(this.state).some(key => this.state[key] !== nextState[key]);
  }

  componentWillReceiveProps(nextProps: StyledComponentProps<ReplEditorProps, JSSStyles>) {
    if (this.props.context.undoRedoActionGuid !== nextProps.context.undoRedoActionGuid) {
      this.loadStateFromProps();
    }
  }

  componentDidMount() {
    this.loadStateFromProps();
  }

  loadStateFromProps() {
    const { model } = this.props;

    const promptHtml = promptHtmlFromModel(model);
    const showCodeEditor = isCodeEditorVisibleFromModel(model);
    const question = questionFromModel(model) || this.state.question;
    const solutionText = solutionTextFromModel(model);

    this.setState({
      maybePrompt: maybe(RichText.fromHtml(promptHtml)),
      showCodeEditor,
      question,
      solutionText,
    }, () => {
      if (question.language !== this.state.question.language) {
        if (this.replClient) {
          this.replClient.detach();
          this.replClient = undefined;
        }

        this.onConsoleLoad(this.consoleDiv);
      }
    });
  }

  onConsoleLoad(consoleDiv: HTMLDivElement) {
    const { question } = this.state;
    this.consoleDiv = consoleDiv;

    if (!this.replClient) {
      const ReplClient = (window as any).ReplClient;

      if (ReplClient) {
        this.replClient = new ReplClient({
          host: 'repl.oli.cmu.edu',
          language: replLangFromQuetsion(question),
          terminalOptions: {
            convertEol: true,
            cursorBlink: true,
            fontSize: 12,
          },
        });

        this.replClient.attach(consoleDiv);
      }
    }
  }

  onEditPrompt = ({ value }: { value: Value }) => {
    const { maybePrompt } = this.state;

    maybePrompt.lift((prompt) => {
      const edited = value.document !== prompt.value.document;
      const updateSelection = value.selection !== prompt.value.selection;

      // Always update local state with the new slate value
      this.setState({ maybePrompt: maybe(prompt.with({ value })) }, () => {
        if (edited) {
          // But only notify our parent of an edit when something
          // has actually changed
          this.saveActivityFromCurrentState();

          // We must always broadcast the latest version of the editor
          this.props.onUpdateEditor(this.promptEditor);
          this.promptEditor.focus();

        } else if (updateSelection) {
          // Broadcast the fact that the editor updated
          this.props.onUpdateEditor(this.promptEditor);
        }

      });
    });

  }

  onFocusPrompt = () => {
    const { onRichTextFocus } = this.props;
    const { maybePrompt } = this.state;

    maybePrompt.lift((prompt) => {
      onRichTextFocus(
        prompt,
        this.promptEditor,
        maybe(new TextSelection(prompt.value.selection)),
      );
    });
  }

  setShowCodeEditor(show: boolean) {
    const { services } = this.props;
    const { question, solutionText } = this.state;

    const confirmSetShowEditor = () => {
      this.setState({
        showCodeEditor: show,
        question: show
          ? question
          : {
            ...question,
            functionname: '',
            testCases: [],
            hints: [],
          },
        solutionText: '',
      }, () => {
        this.saveActivityFromCurrentState();

        this.replClient.terminal.fit();
      });
    };

    const userWillLoseQuestionData = !(
      question.functionname === ''
      && question.testCases.length === 0
      && question.hints.length === 0
      && solutionText === ''
    );

    if (userWillLoseQuestionData && this.state.showCodeEditor) {
      // make sure the user confirms when hiding the code editor and having data to lose
      services.displayModal(
        <ConfirmModal
          title="Disable Code Editor"
          confirmLabel="Continue"
          onCancel={() => {
            services.dismissModal();
          }}
          onConfirm={() => {
            services.dismissModal();
            confirmSetShowEditor();
          }}>
          <div className="message alert alert-warning">
            <b><i className="fa fa-info-circle" /> Warning</b>
            <br />
            <br />
            Disabling the Code Editor will <b>permanently remove</b> the <b>Test Cases</b>,
            {' '}<b>Hints</b> and <b>Solutions</b> defined for this activity.
          </div>
          <br />
          Do you want to continue?
        </ConfirmModal>,
      );
    } else {
      confirmSetShowEditor();
    }
  }

  onRunBtnClick () {
    const ReplClient = (window as any).ReplClient;
    const { question } = this.state;
    const editorText = question.initeditortext;

    this.replClient.clearScreen();
    this.replClient.writeln('EXECUTING CODE:');
    this.replClient.writeln(editorText);
    this.replClient.disableStdin();

    this.setState({ isRunning: true });

    ReplClient.exec(
      editorText, {
        host: 'repl.oli.cmu.edu',
        language: replLangFromQuetsion(question),
      })
      .then((result) => {
        this.replClient.writeln('---------------------------------------');
        this.replClient.writeln('RESULT:');
        this.replClient.write(result.combined);
        this.replClient.terminal.scrollToBottom();
      })
      .catch((err) => {
        console.error(err);
        this.replClient.writeln('An unexpected error occurred: ' + err);
        this.replClient.writeln('Please try reloading the page or contact support if the issue persists');
      })
      .finally(() => {
        this.setState({ isRunning: false });
      });
  }

  onSubmitBtnClick () {
    const ReplClient = (window as any).ReplClient;
    const { question } = this.state;
    const editorText = question.initeditortext;

    this.replClient.clearScreen();
    this.replClient.writeln('EXECUTING CODE:');
    this.replClient.writeln(editorText);
    this.replClient.disableStdin();

    this.setState({ isSubmitting: true });

    ReplClient.exec(
      editorText, {
        host: 'repl.oli.cmu.edu',
        language: replLangFromQuetsion(question),
      })
      .then((result) => {
        this.replClient.writeln('---------------------------------------');
        this.replClient.writeln('RESULT:');
        this.replClient.write(result.combined);
        this.replClient.terminal.scrollToBottom();

        // TODO: Send the submission off to a grading service that will return and
        // display the results
      })
      .catch((err) => {
        console.error(err);
        this.replClient.writeln('An unexpected error occurred: ' + err);
        this.replClient.writeln('Please try reloading the page or contact support if the issue persists');
      })
      .finally(() => {
        this.setState({ isSubmitting: false });
      });
  }

  onClearBtnClick() {
    this.replClient.clearScreen();
    this.replClient.writeStdin('\n');
    this.replClient.disableStdin(false);
  }

  onEditEditorText(editorText: string) {
    const question = this.state.question;
    question.initeditortext = editorText;
    this.setState({
      question,
    }, () => this.saveActivityFromCurrentState());
  }

  onEditSolutionText(solutionText: string) {
    this.setState({
      solutionText,
    }, () => this.saveActivityFromCurrentState());
  }

  onEditFunctionName(value) {
    const question = this.state.question;
    question.functionname = value;

    this.setState({
      question,
    }, () => this.saveActivityFromCurrentState());
  }

  onEditTestCaseInput(guid, value) {
    const question = this.state.question;
    question.testCases = question.testCases.map((testCase) => {
      if (testCase.guid === guid) {
        testCase.input = value;
      }
      return testCase;
    });

    this.setState({
      question,
    }, () => this.saveActivityFromCurrentState());
  }

  onEditTestCaseOutput(guid, value) {
    const question = this.state.question;
    question.testCases = question.testCases.map((testCase) => {
      if (testCase.guid === guid) {
        testCase.output = value;
      }
      return testCase;
    });

    this.setState({
      question,
    }, () => this.saveActivityFromCurrentState());
  }

  onRemoveTestCase(guid) {
    const question = this.state.question;
    question.testCases = question.testCases.filter(testCase =>
      testCase.guid !== guid);

    this.setState({
      question,
    }, () => this.saveActivityFromCurrentState());
  }

  saveActivityFromCurrentState() {
    const { model, onEdit } = this.props;

    const updated = model.with({
      assets: model.assets.map((asset) => {
        switch (asset.name) {
          case 'layout':
            return asset.with({
              content: Maybe.just(this.getActivityLayoutHTML()),
            });
          case 'questions':
            return asset.with({
              content: Maybe.just(this.getActivityQuestionsXml()),
            });
          case 'solutions':
            return asset.with({
              content: Maybe.just(this.getActivitySolutionsXml()),
            });
          default:
            return asset;
        }
      }).toList(),
    });

    onEdit(updated);
  }

  getActivityLayoutHTML() {
    const { maybePrompt, showCodeEditor, question } = this.state;

    const promptInnerHtml = maybePrompt.caseOf({
      just: prompt => prompt.toHtml(),
      nothing: () => '',
    });

    const isGraded = question.testCases.length > 0 && showCodeEditor;

    return renderLayoutHtml({
      prompt: promptInnerHtml,
      showCodeEditor,
      isGraded,
    });
  }

  getActivityQuestionsXml() {
    const { question } = this.state;

    return renderQuestionsXml({
      questions: [question],
    });
  }

  getActivitySolutionsXml() {
    const { solutionText, question } = this.state;

    return renderSolutionsXml({
      solutions: [{
        language: question.language,
        value: solutionText,
      }],
    });
  }

  captureEditorRef = (ref: Editor) => {
    this.promptEditor = ref;
  }

  onAddTestCase() {
    const { question } = this.state;

    const updatedQuestion = question;
    updatedQuestion.testCases.push({
      guid: guid(),
      input: '',
      output: '',
    });

    this.setState({
      question: updatedQuestion,
    }, () => this.saveActivityFromCurrentState());
  }

  onAddHint() {
    const { question } = this.state;

    const updatedQuestion = question;
    updatedQuestion.hints.push({
      id: guid(),
      content: RichText.fromHtml('<div></div>'),
    });

    this.setState({
      question: updatedQuestion,
    }, () => this.saveActivityFromCurrentState());
  }

  onEditHint(id: string, value: Value) {
    const { onUpdateEditor } = this.props;
    const { question, hintEditors } = this.state;

    let edited = false;
    let updateSelection = false;

    // find the relevant hint and update its content
    question.hints = question.hints.map((hint) => {
      if (hint.id === id) {
        edited = value.document !== hint.content.value.document;
        updateSelection = value.selection !== hint.content.value.selection;
        hint.content = hint.content.with({ value });
      }
      return hint;
    });

    const activeHintEditor = hintEditors.get(id);

    this.setState({
      question,
    }, () => {
      if (edited) {
        // But only notify our parent of an edit when something
        // has actually changed
        this.saveActivityFromCurrentState();

        // We must always broadcast the latest version of the editor
        onUpdateEditor(activeHintEditor);
        activeHintEditor.focus();

      } else if (updateSelection) {
        // Broadcast the fact that the editor updated
        onUpdateEditor(activeHintEditor);

        // fixes an issue where hints dont re-render when selection changes
        this.forceUpdate();
      }
    });
  }

  onFocusHint = (hint) => {
    const { onRichTextFocus } = this.props;

    const hintEditor = this.state.hintEditors.get(hint.id);

    onRichTextFocus(
      hint.content,
      hintEditor,
      maybe(new TextSelection(hint.content.value.selection)),
    );
  }

  onRemoveHint(id) {
    const question = this.state.question;
    question.hints = question.hints.filter(hint =>
      hint.id !== id);

    this.setState({
      question,
      hintEditors: this.state.hintEditors.delete(id),
    }, () => this.saveActivityFromCurrentState());
  }

  onSelectLanguage(language: string) {
    const { question } = this.state;

    question.language = language;
    this.setState({
      question,
    }, () => {
      this.saveActivityFromCurrentState();

      if (this.replClient) {
        this.replClient.detach();
        this.replClient = undefined;
      }

      this.onConsoleLoad(this.consoleDiv);
    });
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="REPL Activity" />
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="REPL Activity">
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.ReplEditorDetails);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fas fa-sliders-h" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  /**
   * We are overriding the render() method, so implement renderMain
   * to appease abstract parent class even though it will be bypassed
   */
  renderMain() {
    return <div />;
  }

  renderGradingEditor() {
    const { classes, editMode } = this.props;
    const { solutionText, question, hintEditors } = this.state;

    const HelpPopover = ({ children }) => (
      <Tooltip
        theme="light"
        animation="shift"
        interactive={true}
        arrow={true}
        style={{ color: colors.blue }}
        html={children}>
        <i className={'fa fa-question-circle'}></i>
      </Tooltip>
    );

    return (
      <div className={classes.gradingEditor}>

      {/** Test Cases */}
      <h4>Test Cases <Badge>{question.testCases.length}</Badge></h4>
      <div className={classes.explanation}>
        Student responses can be evaluated for correctness by specifying
        a set of test cases below. <HelpPopover>
          <div className={classes.helpPopover}>
            Each test case below should specify an expected result
            given a particular set of parameters for the function
            specified.
            <br /><br />
            <b>Parameters</b> and <b>Expected Result</b> must be
            specified in the exact syntax of the language being evaluated.
            <br /><br />
            For example, in python <b>parameters</b> should be
            comma-separated: <code>param1, param2</code> and <b>
            Expected Result</b> should contain quotes if it
            is a string: <code>"result string"</code>.
          </div>
      </HelpPopover>
      </div>
      <label>Function Name</label> <input type="text"
        className={classNames([classes.monospace , 'text-input'])}
        placeholder="Enter a function name"
        onChange={({ target: { value } }) => this.onEditFunctionName(value)}
        style={{ marginLeft: 10, width: 300, color: '#e83e8c' }}
        value={question.functionname} />
      <div className={classes.testCases}>
        {question.testCases.map((testCase, index) => (
          <div key={testCase.guid} className={classes.testCase}>
            <div className={classes.testCaseNumber}>
              {index + 1}.
            </div>
            <div>
              <div className={classes.monospace}>
                <span style={{ color: '#e83e8c' }}>{question.functionname}</span> (
                <input type="text"
                  className={classes.codeInput}
                  onChange={({ target: { value } }) =>
                    this.onEditTestCaseInput(testCase.guid, value)}
                  value={testCase.input} />)
              </div>
              <div className={classes.resultLabel}>
                <b>Expected Result</b> <input type="text"
                  className={classes.codeInput}
                  onChange={({ target: { value } }) =>
                    this.onEditTestCaseOutput(testCase.guid, value)}
                  value={testCase.output} />
              </div>
            </div>
            <div className="flex-spacer" />
            <div>
              <Button
                editMode={editMode}
                type="secondary"
                className="btn-remove"
                onClick={() => this.onRemoveTestCase(testCase.guid)}>Remove</Button>
            </div>
          </div>
        ))}
        {question.testCases.length < 1 && (
          <div className={classes.noTestCasesMsg}>
            No test cases have been created for this activity, therefore it
            will be scored based on whether execution is successful or not.
          </div>
        )}
      </div>
      <div className={classes.testCaseButtons}>
        <div className="flex-spacer" />
        <div>
          <Button
            type="secondary"
            editMode={editMode}
            onClick={() => this.onAddTestCase()}>Add Test Case</Button>
        </div>
      </div>

      {/** Hints */}
      <h4>Hints <Badge>{question.hints.length}</Badge></h4>
      <div className={classes.explanation}>
        Students can request a hint from the set of hints specified below.
      </div>
      <div className={classes.hints}>
        {question.hints.map((hint, index) => (
          <div key={hint.id} className={classes.hint}>
            <div className={classes.hintNumber}>
              {index + 1}.
            </div>
            {/* Prevent click event from propagating through to parent to keep correct focus */}
            <div className="flex-spacer" onClick={e => e.stopPropagation()}>
              <Editor
                ref={ref => this.setState({ hintEditors: hintEditors.set(hint.id, ref) })}
                className={classNames([classes.hintContent, classes.textarea])}
                value={hint.content.value}
                placeholder="Enter a hint"
                onChange={({ value }) => this.onEditHint(hint.id, value)}
                onFocus={() => this.onFocusHint(hint)}
                renderBlock={renderNode}
                renderMark={renderMark}
                plugins={RICH_TEXT_EDITOR_PLUGINS} />
            </div>
            <div>
              <Button
                editMode={editMode}
                type="secondary"
                className="btn-remove"
                onClick={() => this.onRemoveHint(hint.id)}>Remove</Button>
            </div>
          </div>
        ))}
        {question.hints.length < 1 && (
          <div className={classes.noHintsMsg}>
            No hints have been added to this activity
          </div>
        )}
      </div>
      <div className={classes.hintButtons}>
        <div className="flex-spacer" />
        <div>
          <Button
            type="secondary"
            editMode={editMode}
            onClick={() => this.onAddHint()}>Add Hint</Button>
        </div>
      </div>

      {/** Solution */}
      <div className={classes.solution}>
        <h4>Solution</h4>
        <div className={classes.explanation}>
          Students can request to see the solution after an activity has been submitted.
        </div>
        <AceEditor
            name="REPL_CODE_EDITOR"
            width="700px"
            height="250px"
            mode={question.language}
            theme="chrome"
            readOnly={!editMode}
            value={solutionText}
            onChange={text => this.onEditSolutionText(text)}
            setOptions={ACE_EDITOR_OPTIONS} />
      </div>
    </div>
    );
  }

  render(): JSX.Element {
    const { className, classes, editMode, onRichTextFocus } = this.props;
    const {
      maybePrompt, showCodeEditor, question, isRunning, isSubmitting,
    } = this.state;
    const editorText = question.initeditortext;
    const isGraded = question.testCases.length > 0 && showCodeEditor;

    const languageToReadableLabel = (language: string) => caseOf(language)({
      python3: 'Python 3',
      python: 'Python 3',
      java9: 'Java 9',
      java: 'Java 9',
    })('Python 3');

    return (
      <div className={classNames([classes.ReplEditor, className])}>
        <div className={classes.replActivityLabel}>REPL Activity</div>

        <div className={classes.options}>
          <ToggleSwitch
            label="Show Code Editor"
            checked={showCodeEditor}
            className={classes.showCodeEditorToggle}
            onClick={() => this.setShowCodeEditor(!showCodeEditor)}
            editMode={editMode}/>

          <span className={classes.languageDropdown}>
            <div className="btn-group">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-toggle="dropdown">
                Language: {languageToReadableLabel(question.language)}
              </button>
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => this.onSelectLanguage('python')}>
                    {languageToReadableLabel('python')}
                </div>
                {/* TODO: Add support for other languages
                  <div
                    className="dropdown-item"
                    onClick={() => this.onSelectLanguage('java')}>
                      {languageToReadableLabel('java')}
                    </div>
                */}
              </div>
            </div>
          </span>
        </div>

        {maybePrompt.caseOf({
          just: prompt => (
            <React.Fragment>
              {/* Prevent click event from propagating through to parent to keep correct focus */}
              <div onClick={e => e.stopPropagation()}>
                <Editor
                  ref={this.captureEditorRef}
                  className={classNames([classes.prompt, classes.textarea])}
                  value={prompt.value}
                  placeholder="Enter a prompt for this REPL activity"
                  onChange={this.onEditPrompt}
                  onFocus={this.onFocusPrompt}
                  renderBlock={renderNode}
                  renderMark={renderMark}
                  plugins={RICH_TEXT_EDITOR_PLUGINS} />
              </div>

              <div className={classes.combined}>
                <div className={classes.explanation}>
                  Run your activity below using the {isGraded ? 'Run, Submit' : 'Run'} and
                  Clear buttons, similar to how students will see it.
                </div>
                <div className={classes.activityControls}>
                  {showCodeEditor &&
                    <button
                      id="run"
                      className="btn btn-primary btn-xs"
                      style={{ marginRight: 5 }}
                      onClick={() => this.onRunBtnClick()}
                      disabled={!showCodeEditor || isRunning}>
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                  }
                  {isGraded &&
                    <button
                      id="run"
                      className="btn btn-primary btn-xs"
                      onClick={() => this.onSubmitBtnClick()}
                      disabled={!showCodeEditor || isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  }
                  <button
                    id="clear"
                    className="btn btn-primary btn-xs"
                    onClick={() => this.onClearBtnClick()}
                    style={{ float: 'right' }}>
                    Clear
                  </button>
                </div>
                <div className={classes.splitPanel}>
                  {showCodeEditor &&
                    <div className={classes.editor}>
                      <AceEditor
                          name="REPL_CODE_EDITOR"
                          width="initial"
                          height="250px"
                          mode={question.language}
                          theme="chrome"
                          readOnly={!editMode}
                          value={editorText}
                          onChange={text => this.onEditEditorText(text)}
                          setOptions={ACE_EDITOR_OPTIONS} />
                    </div>
                  }
                  <div
                    className={classes.console}
                    style={{ width: showCodeEditor ? 350 : 700 }}
                    ref={div => this.onConsoleLoad(div)}></div>
                </div>

                {showCodeEditor &&
                  <div className={classes.explanation}>
                    Use the editor above to specify any initial code
                    to begin the activity with. This code <b>should not</b> contain
                    the solution to the activity.
                  </div>
                }
              </div>

              {showCodeEditor && this.renderGradingEditor()}

            </React.Fragment>
          ),
          nothing: () => undefined,
        })}
      </div>
    );
  }
}

const StyledReplEditor = withStyles<ReplEditorProps>(styles)(ReplEditor);
export { StyledReplEditor as ReplEditor };
