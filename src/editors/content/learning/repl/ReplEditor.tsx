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
import Html from 'slate-html-serializer';
import * as $ from 'jquery';
import { Value } from 'slate';
import { plugins } from 'editors/content/learning/contiguoustext/render/render';

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

const renderNode = (props, editor, next) => {
  switch (props.node.type) {
    case 'code':
      return (
        <pre {...props.attributes}>
          <code>{props.children}</code>
        </pre>
      );
    case 'paragraph':
      return (
        <p {...props.attributes} className={props.node.data.get('className')}>
          {props.children}
        </p>
      );
    case 'quote':
      return <blockquote {...props.attributes}>{props.children}</blockquote>
    default:
      return next();
  }
};

const renderMark = (props, editor, next) => {
  const { mark, attributes } = props;
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{props.children}</strong>;
    case 'italic':
      return <em {...attributes}>{props.children}</em>;
    case 'underline':
      return <u {...attributes}>{props.children}</u>;
    case 'code':
      return <code {...attributes}>{props.children}</code>;
    default:
      return next();
  }
};

const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  pre: 'code',
};

const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
  code: 'code',
};

const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'block',
          type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'quote':
            return <blockquote>{children}</blockquote>;
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'mark',
          type,
          nodes: next(el.childNodes),
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underline':
            return <u>{children}</u>;
          case 'code':
            return <code>{children}</code>;
        }
      }
    },
  },
];

const html = new Html({ rules });

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
}

export interface ReplEditorState {
  maybePrompt: Maybe<Value>;
  showCodeEditor: boolean;
  editorText: string;
}

class ReplEditor
  extends AbstractContentEditor<EmbedActivityModel,
  StyledComponentProps<ReplEditorProps, typeof styles>, ReplEditorState> {
  replClient: any;

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
        maybePrompt: Maybe.just(
          html.deserialize(promptHtmlFromModel(nextProps.model)),
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
      maybePrompt: Maybe.just(html.deserialize(promptHtml)),
      showCodeEditor,
      editorText,
    });
    onFocus(model, null, Maybe.nothing());
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
      if (value.document !== prompt.document) {
        this.setState({
          maybePrompt: Maybe.just(value),
        }, () => this.saveActivityFromCurrentState());
      }
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
      just: prompt => html.serialize(prompt),
      nothing: () => '',
    });

    return renderLayoutHtml({
      prompt: promptInnerHtml,
      showCodeEditor,
      editorText,
    });
  }

  renderSidebar(): JSX.Element {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Custom">
        <SidebarGroup>
          <SidebarRow label="Type">
            <Discoverable id={DiscoverableId.ReplEditorDetails} focusChild>
              [Repl Activity Controls]
            </Discoverable>
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={3}>
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
   * We are overriding the parent render() method, so implement renderMain
   * to make appease abstract parent class even though it will be bypassed
   */
  renderMain() {
    return <div />;
  }

  render(): JSX.Element {
    const { className, classes, editMode } = this.props;
    const { maybePrompt, showCodeEditor, editorText } = this.state;

    return (
      <div className={classNames([classes.ReplEditor, className])}>
        <div className={classes.replActivityLabel}>REPL Activity</div>
        {maybePrompt.caseOf({
          just: prompt => (
            <React.Fragment>
              <Editor
                className={classNames([classes.prompt, classes.textarea])}
                value={prompt}
                placeholder="Enter prompt text for REPL activity"
                onChange={this.onEditPrompt}
                // Add the ability to render our nodes and marks...
                renderBlock={renderNode}
                renderMark={renderMark}
                plugins={plugins} />

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
                          // minLines={1}
                          // maxLines={40}
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
