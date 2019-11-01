import * as React from 'react';
import { List } from 'immutable';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
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
import { ContiguousTextEditor } from '../contiguoustext/ContiguousTextEditor.controller';
import { TextInput } from 'editors/content/common/controls';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown';
import * as $ from 'jquery';

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
import { webContentsPath } from 'editors/content/media/utils';
import { LoadingSpinner, LoadingSpinnerSize } from 'components/common/LoadingSpinner';
import guid from 'utils/guid';
import { ContentElement } from 'data/content/common/interfaces';

export const renderLayoutHtml = ({ prompt, showCodeEditor }) => `
<div id="q1" class="question">
  <p id="q1_prompt" class="prompt">${prompt}</p>
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

export interface ReplEditorProps extends AbstractContentEditorProps<EmbedActivityModel> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface ReplEditorState {
  isLayoutLoaded: boolean;
  prompt: Maybe<ContentElements>;
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
      isLayoutLoaded: false,
      prompt: Maybe.nothing<ContentElements>(),
      showCodeEditor: true,
      editorText: '',
    };
  }

  shouldComponentUpdate(
    nextProps: StyledComponentProps<ReplEditorProps, JSSStyles>, nextState: ReplEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state.isLayoutLoaded !== nextState.isLayoutLoaded
      || this.state.prompt !== nextState.prompt
      || this.state.showCodeEditor !== nextState.showCodeEditor;
  }

  componentDidMount() {
    const { model } = this.props;

    // this should always execute
    Maybe.maybe(model.assets.find(asset => asset.name === 'layout')).caseOf({
      just: (layoutAsset) => {
        const html = layoutAsset.content.caseOf({
          just: html => html,
          nothing: () => renderLayoutHtml({ prompt: '', showCodeEditor }),
        });
        const parsedHtmlLayout = $(html);
        const prompt = $('p', parsedHtmlLayout)[0] && $('p', parsedHtmlLayout)[0].textContent || '';
        const showCodeEditor = $('#editor')[0] !== undefined;
        // const editorText =

        this.setState({
          isLayoutLoaded: true,
          prompt: Maybe.just(
            ContentElements.fromText(prompt, guid(), ['#text', 'em', 'sub', 'sup']),
          ),
          showCodeEditor,
        });
      },
      nothing: () => {
        this.setState({
          isLayoutLoaded: true,
          prompt: Maybe.just(
            ContentElements.fromText('', guid(), ['#text', 'em', 'sub', 'sup']),
          ),
        });
      },
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

  onEditPrompt(updated: ContentElements) {
    const { model, onEdit } = this.props;

    const layoutAssetIndex = model.assets.findIndex(asset => asset.name === 'layout');
    const layoutAsset = model.assets.get(layoutAssetIndex);

    this.setState({
      prompt: Maybe.just(updated),
    }, () => this.saveActivityFromCurrentState());
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
    });
  // }, () => this.saveActivityFromCurrentState());
  }

  saveActivityFromCurrentState() {
    const { model, onEdit } = this.props;

    const layoutAssetIndex = model.assets.findIndex(asset => asset.name === 'layout');
    const layoutAsset = model.assets.get(layoutAssetIndex);

    onEdit(model.with({
      assets: model.assets.set(
        layoutAssetIndex,
        layoutAsset.with({
          content: Maybe.just(this.getActivityLayoutHTML()),
        }),
      ),
    }));
  }

  getActivityLayoutHTML() {
    const { prompt, showCodeEditor } = this.state;

    const promptText = prompt.caseOf({
      just: p => p.extractPlainText().valueOr(''),
      nothing: () => '',
    });

    return renderLayoutHtml({ prompt: promptText, showCodeEditor });
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

  renderMain() {
    return <div />;
  }

  render(): JSX.Element {
    const { className, classes, model, editMode, context, services } = this.props;
    const { isLayoutLoaded, prompt, showCodeEditor, editorText } = this.state;

    return (
      <div className={classNames([classes.ReplEditor, className])}>
        {isLayoutLoaded
        ? (
            <React.Fragment>
              <ContentContainer
                context={context}
                services={services}
                editMode={editMode}
                model={prompt.caseOf({
                  just: prompt => prompt,
                  nothing: () => new ContentElements().with({
                    supportedElements: List(['#text', 'em', 'sub', 'sup']),
                  }),
                })}
                hover={null}
                onUpdateHover={() => {}}
                onFocus={() => {}}
                renderContext={RenderContext.MainEditor}
                onEdit={updated => this.onEditPrompt(updated)}
                hideContentLabel
                activeContentGuid={model.guid} />

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
          )
          :(
            <LoadingSpinner size={LoadingSpinnerSize.Large} message="Loading REPL Activity..."/>
          )
        }
      </div>
    );
  }
}

const StyledReplEditor = withStyles<ReplEditorProps>(styles)(ReplEditor);
export { StyledReplEditor as ReplEditor };
