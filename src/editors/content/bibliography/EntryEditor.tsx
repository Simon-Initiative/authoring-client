import * as React from 'react';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';
import { CONTENT_COLORS } from
  'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TextInput } from 'editors/content/common/TextInput';
import { Select } from 'editors/content/common/Select';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import { Maybe } from 'tsmonad';
import {
  makeVolume, makeNumber, makeAuthor, makeEditor,
} from 'data/content/bibtek/common';
import { ignoredAttributes } from './common';
import { styles } from './EntryEditor.styles';

export interface EntryEditorProps
  extends AbstractContentEditorProps<contentTypes.Entry> {
  onShowSidebar: () => void;
  label: any;
}

export interface EntryEditorState {

}

function toFriendlyLabel(key: string) {
  if (key === '') return '';
  const words = key.replace(/([A-Z])/g, ' $1');
  return words.charAt(0).toUpperCase() + words.slice(1);
}


@injectSheet(styles)
export default class EntryEditor
  extends AbstractContentEditor
  <contentTypes.Entry, EntryEditorProps & JSSProps, EntryEditorState> {

  constructor(props) {
    super(props);
  }


  renderSidebar() {
    return (
      <SidebarContent title="Entry" />
    );
  }

  onEditString(key: string, value: string) {
    const model = (this.props.model as any).with({ [key]: value });
    this.props.onEdit(model, model);
  }

  onEditMaybeString(key: string, value: string) {
    const v = value.trim() === '' ? Maybe.nothing() : Maybe.just(value);
    const model = (this.props.model as any).with({ [key]: v });
    this.props.onEdit(model, model);
  }


  onEditAuthorEditor(whichType: string, value: string) {
    let v = null;
    if (whichType === 'author') {
      v = makeAuthor(value);
    } else {
      v = makeEditor(value);
    }
    const model = (this.props.model as any).with({ authorEditor: v });
    this.props.onEdit(model, model);
  }


  onEditVolumeNumber(whichType: string, value: string) {
    let v = null;
    if (whichType === 'volume') {
      v = makeVolume(value);
    } else {
      v = makeNumber(value);
    }
    const model = (this.props.model as any).with({ volumeNumber: Maybe.just(v) });
    this.props.onEdit(model, model);
  }

  renderStringEditor(key: string, value: string) {
    return (
      <TextInput
        editMode={this.props.editMode}
        width="100%"
        value={value}
        label=""
        type="string"
        onEdit={this.onEditString.bind(this, key)}
      />
    );
  }

  renderMaybeStringEditor(key: string, value: Maybe<string>) {
    const v = value.caseOf({
      just: v => v,
      nothing: () => '',
    });
    return (
      <TextInput
        editMode={this.props.editMode}
        width="100%"
        value={v}
        label=""
        type="string"
        onEdit={this.onEditMaybeString.bind(this, key)}
      />
    );
  }

  renderAuthorEditor(key: string, value) {
    let v = null;
    let k = null;
    if (value.has('author')) {
      v = value.get('author');
      k = 'author';
    } else {
      v = value.get('editor');
      k = 'editor';
    }
    return (
      <TextInput
        editMode={this.props.editMode}
        width="100%"
        value={v}
        label=""
        type="string"
        onEdit={this.onEditAuthorEditor.bind(this, k)}
      />
    );
  }

  renderVolumeNumber(key: string, value) {
    let v = null;
    let k = null;
    value.caseOf({
      just: (m) => {
        if (m.has('volume')) {
          v = m.get('volume');
          k = 'volume';
        } else {
          v = m.get('number');
          k = 'number';
        }
      },
      nothing: () => {
        v = '';
        k = 'volume';
      },
    });


    return (
      <TextInput
        editMode={this.props.editMode}
        width="100%"
        value={v}
        label=""
        type="string"
        onEdit={this.onEditVolumeNumber.bind(this, k)}
      />
    );
  }

  onAuthorEditorSwitch(v: string) {
    let authorEditor = null;
    if (v === 'author') {
      authorEditor = makeAuthor((this.props.model as any).authorEditor.get('editor'));
    } else {
      authorEditor = makeEditor((this.props.model as any).authorEditor.get('author'));
    }
    const model = (this.props.model as any).with({ authorEditor });
    this.props.onEdit(model, model);
  }


  onVolumeNumberSwitch(v: string) {
    let volumeNumber = null;
    if (v === 'volume') {
      volumeNumber = Maybe.just(makeVolume(''));
    } else {
      volumeNumber = Maybe.just(makeNumber(''));
    }
    const model = (this.props.model as any).with({ volumeNumber });
    this.props.onEdit(model, model);
  }

  renderLabel(key, value) {
    if (key === 'authorEditor') {
      return (
        <Select
          editMode={this.props.editMode}
          value={value.has('author') ? 'author' : 'editor'}
          onChange={v =>
            this.onAuthorEditorSwitch(v)}>
          <option key="author" value="author">Author</option>
          <option key="editor" value="editor">Editor</option>
        </Select>
      );
    }
    if (key === 'volumeNumber') {
      let v = 'volume';
      value.lift(m => v = m.has('number') ? 'number' : 'volume');
      return (
        <Select
          editMode={this.props.editMode}
          value={v}
          onChange={v => this.onVolumeNumberSwitch(v)}>
          <option key="volume" value="volume">Volume</option>
          <option key="number" value="number">Number</option>
        </Select>
      );
    }
    return toFriendlyLabel(key);
  }

  renderPair(key1: string, value1, key2: string, value2) {
    const labelStyle = { width: '125px', textAlign: 'right', paddingRight: '5px' };
    return (
      <tr>
        <td style={labelStyle}>{this.renderLabel(key1, value1)}</td>
        <td>
          {this.renderAttributeEditor(key1, value1)}
        </td>
        <td style={labelStyle}>{this.renderLabel(key2, value2)}</td>
        <td>
          {this.renderAttributeEditor(key2, value2)}
        </td>
      </tr>
    );
  }

  renderAttributeEditor(key: string, value) {
    if (value === undefined) {
      return null;
    }
    if (key === 'authorEditor') {
      return this.renderAuthorEditor(key, value);
    }
    if (key === 'volumeNumber') {
      return this.renderVolumeNumber(key, value);
    }
    if (typeof value === 'string') {
      return this.renderStringEditor(key, value);
    }
    if (typeof value === 'object' && value.lift !== undefined) {
      return this.renderMaybeStringEditor(key, value);
    }
  }

  renderAttributeEditors(root: contentTypes.Entry) {

    const attrs = Object.keys((root as any).toJSON()).filter(key => !ignoredAttributes[key]);
    const padded = attrs.length % 2 === 1 ? [...attrs, ''] : attrs;

    const editors = [];
    for (let i = 0; i < padded.length / 2; i += 1) {
      const left = padded[i];
      const right = padded[i + (padded.length / 2)];
      editors.push(this.renderPair(left, root[left], right, root[right]));
    }

    return editors;
  }


  renderToolbar() {
    return (
      <ToolbarGroup label="Entry" highlightColor={CONTENT_COLORS.Entry} />
    );
  }

  renderMain() {
    const { classes, label } = this.props;

    return (
      <div className={classNames([classes.entry])}>

        <div className={classNames([classes.entryLabel])}>
          {label}. {toFriendlyLabel(this.props.model.contentType)}
        </div>
        <table style={{ width: '100%' }}>
          <tbody>
            {this.renderAttributeEditors(this.props.model)}
          </tbody>
        </table>

      </div>
    );
  }
}
