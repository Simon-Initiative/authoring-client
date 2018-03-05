import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarButton } from './ToolbarButton';
import { Maybe } from 'tsmonad';

export interface ToolbarProps {
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
  insert: (content: Object) => void;
  edit: (content: Object) => void;
}


export class ContextAwareToolbar extends React.PureComponent<ToolbarProps, {}> {

  constructor(props) {
    super(props);
  }

  btn(command, icon: string, tooltip: string, enabled: boolean) {
    return (
      <ToolbarButton
        command={command}
        icon={icon}
        tooltip={tooltip}
        enabled={enabled}
      />
    );
  }

  renderButtons() {

    const { insert, edit, content, supportedElements } = this.props;
    const btn = this.btn;

    const elementMap = supportedElements
      .toArray()
      .reduce(
        (m, c) => {
          m[c] = true;
          return m;
        },
        {});

    const iff = el => elementMap[el];

    console.dir(elementMap);

    const isText = content.caseOf({
      just: c => c instanceof contentTypes.ContiguousText,
      nothing: () => false,
    });

    const buttons = [
      btn(
        () => {
          this.props.content.lift((t) => {
            const text = t as contentTypes.ContiguousText;
            edit(text.toggleStyle(InlineStyles.Bold));
          });
        },
        'bold', 'Bold the selected text', isText),
      btn(
        () => insert(new contentTypes.CodeBlock()),
        'code', 'Add a block of source code', iff('codeblock')),
      btn(
        () => insert(new contentTypes.Example()),
        'bar-chart', 'Add an example', iff('example')),
    ];

    return buttons;
  }

  render() {

    const { insert, edit, content, supportedElements } = this.props;
    const btn = this.btn;

    const style = {
      boxShadow: '5px 5px 5px #888888',
      backgroundColor: 'black',
    };
    return (
      <div style={style} className="btn-toolbar"
        role="toolbar" aria-label="Toolbar with button groups">
        <div className="btn-group btn-group-vertical btn-group-sm"
          role="group" aria-label="First group">
          {this.renderButtons()}
        </div>
      </div>);
  }

}
