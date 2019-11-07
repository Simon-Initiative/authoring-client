import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './ReplEditor.styles';
import { EmbedActivityModel } from 'data/models/embedactivity';
import { Maybe, maybe } from 'tsmonad';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Editor } from 'slate-react';
import * as $ from 'jquery';
import { Value } from 'slate';
import { plugins } from 'editors/content/learning/contiguoustext/render/render';
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

type RenderLayoutHtmlOptions = {
  prompt?: string,
  showCodeEditor?: boolean,
  editorText?: string,
};

export const renderLayoutHtml = ({
  prompt = '',
  showCodeEditor = true,
  editorText = '',
}: RenderLayoutHtmlOptions = {}) => `
<div id="q1" class="question">
  <div id="prompt">${prompt}</div>
  <div id="editor_text" style="display: none">${editorText}</div>
  ${showCodeEditor
    ? `
    <div>
      <button id="run" class="btn btn-primary btn-xs">Run</button>
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="editor"></div>
    <div id="console"></div>`
    : `
    <div>
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="console"></div>`
  }
</div>
`;

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

const editorTextFromModel = (model: EmbedActivityModel) => {
  const parsedLayoutHtml = parseLayoutHtmlFromModel(model);

  return $('#editor_text', parsedLayoutHtml)[0]
    && $('#editor_text', parsedLayoutHtml)[0].textContent || '';
};

export interface ReplEditorProps extends AbstractContentEditorProps<EmbedActivityModel> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
  onRichTextFocus: (
    model: contentTypes.RichText,
    editor: Editor,
    textSelection:  Maybe<TextSelection>,
  ) => void;
  onUpdateEditor: (editor) => void;
}

export interface ReplEditorState {
  maybePrompt: Maybe<RichText>;
  showCodeEditor: boolean;
  editorText: string;
}

class ReplEditor
  extends AbstractContentEditor<EmbedActivityModel,
  StyledComponentProps<ReplEditorProps, typeof styles>, ReplEditorState> {
  replClient: any;
  promptEditor: Editor;

  constructor(props) {
    super(props);

    this.state = {
      maybePrompt: Maybe.nothing(),
      showCodeEditor: true,
      editorText: '',
    };
  }

  shouldComponentUpdate(
    nextProps: StyledComponentProps<ReplEditorProps, JSSStyles>, nextState: ReplEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.props.model !== nextProps.model
      || this.state.maybePrompt !== nextState.maybePrompt
      || this.state.showCodeEditor !== nextState.showCodeEditor;
  }

  componentWillReceiveProps(nextProps: StyledComponentProps<ReplEditorProps, JSSStyles>) {
    if (this.state.editorText !== editorTextFromModel(nextProps.model)) {
      this.setState({
        editorText: editorTextFromModel(nextProps.model),
      });
    }

    if (this.props.context.undoRedoActionGuid !== nextProps.context.undoRedoActionGuid) {
      this.setState({
        maybePrompt: maybe(
          RichText.fromHtml(promptHtmlFromModel(nextProps.model)),
        ),
      });
    }
  }

  componentDidMount() {
    const { model, onFocus } = this.props;

    const promptHtml = promptHtmlFromModel(model);
    const showCodeEditor = isCodeEditorVisibleFromModel(model);
    const editorText = editorTextFromModel(model);

    this.setState({
      maybePrompt: maybe(RichText.fromHtml(promptHtml)),
      showCodeEditor,
      editorText,
    });
  }

  onConsoleLoad(consoleDiv: HTMLDivElement) {
    if (!this.replClient) {
      const ReplClient = (window as any).ReplClient;

      this.replClient = new ReplClient({
        host: 'repl.oli.cmu.edu',
        language: 'python3',
        terminalOptions: {
          convertEol: true,
          cursorBlink: true,
          fontSize: 12,
        },
      });

      this.replClient.attach(consoleDiv);
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

  onShowCodeEditorToggle(show: boolean) {
    this.setState({
      showCodeEditor: show,
    }, () => {
      this.saveActivityFromCurrentState();

      this.replClient.terminal.fit();
    });
  }

  onRunBtnClick () {
    const ReplClient = (window as any).ReplClient;
    const { editorText } = this.state;

    this.replClient.clearScreen();
    this.replClient.writeln(editorText);
    this.replClient.disableStdin();

    ReplClient.exec(editorText, { host: 'repl.oli.cmu.edu', language: 'python3' })
      .then((result) => {
        this.replClient.writeln('---------------------------------------');
        this.replClient.write(result.combined);
      });
  }

  onClearBtnClick() {
    this.replClient.clearScreen();
    this.replClient.writeStdin('\n');
    this.replClient.disableStdin(false);
  }

  onEditEditorText(editorText: string) {
    this.setState({
      editorText,
    }, () => this.saveActivityFromCurrentState());
  }

  saveActivityFromCurrentState() {
    const { model, onEdit } = this.props;

    const layoutAssetIndex = model.assets.findIndex(asset => asset.name === 'layout');
    const layoutAsset = model.assets.get(layoutAssetIndex);

    const updated = model.with({
      assets: model.assets.set(
        layoutAssetIndex,
        layoutAsset.with({
          content: Maybe.just(this.getActivityLayoutHTML()),
        }),
      ),
    });

    onEdit(updated);
  }

  getActivityLayoutHTML() {
    const { maybePrompt, showCodeEditor, editorText } = this.state;

    const promptInnerHtml = maybePrompt.caseOf({
      just: prompt => prompt.toHtml(),
      nothing: () => '',
    });

    return renderLayoutHtml({
      prompt: promptInnerHtml,
      showCodeEditor,
      editorText,
    });
  }

  captureEditorRef = (ref: Editor) => {
    this.promptEditor = ref;
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

  render(): JSX.Element {
    const { className, classes, editMode, onRichTextFocus } = this.props;
    const { maybePrompt, showCodeEditor, editorText } = this.state;

    return (
      <div className={classNames([classes.ReplEditor, className])}>
        <div className={classes.replActivityLabel}>REPL Activity</div>
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
                  onFocus={() =>
                    onRichTextFocus(
                      prompt,
                      this.promptEditor,
                      maybe(new TextSelection(prompt.value.selection)),
                    )
                  }
                  // Add the ability to render our nodes and marks...
                  renderBlock={renderNode}
                  renderMark={renderMark}
                  plugins={plugins} />
              </div>
              <ToggleSwitch
                label="Show Code Editor"
                checked={showCodeEditor}
                className={classes.showCodeEditorBtn}
                onClick={() => this.onShowCodeEditorToggle(!showCodeEditor)}
                editMode={editMode}/>
              <ToggleSwitch
                label="Activity is Graded"
                checked={false}
                onClick={() => {}}
                editMode={false} />

              <div className={classes.combined}>
                <div>
                  <button
                    id="run"
                    className="btn btn-primary btn-xs"
                    onClick={() => this.onRunBtnClick()}
                    disabled={!showCodeEditor}>Run</button>
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
                          mode="python"
                          theme="chrome"
                          readOnly={!editMode}
                          value={editorText}
                          onChange={text => this.onEditEditorText(text)}
                          setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                            useWorker: false,
                            showGutter: true,
                            highlightActiveLine: false,
                          }} />
                    </div>
                  }
                  <div
                    className={classes.console}
                    style={{ width: showCodeEditor ? 350 : 700 }}
                    ref={div => this.onConsoleLoad(div)}></div>
                </div>
              </div>
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
