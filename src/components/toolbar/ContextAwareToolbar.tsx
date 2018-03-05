import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps } from 'styles/jss';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { Maybe } from 'tsmonad';

import styles from './ContextAwareToolbar.style';

interface ToolbarGroupProps extends JSSProps {
  className: string;
  children: any;
  label: string;
}

export const ToolbarGroup = injectSheet(styles)
  (({ className, classes, label, children }: ToolbarGroupProps) => {
    return (
      <div className={`${classes.toolbarGroup} ${className}`}>
        <div className={classes.tbGroupItems}>{children}</div>
        <div className={classes.tbGroupLabel}>{label}</div>
      </div>
    );
  });

export const ToolbarLayoutInline = injectSheet(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutInline} ${className}`}>
        {children}
      </div>
    );
  });

export const ToolbarLayoutGrid = injectSheet(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutGrid} ${className}`}>
        {children}
      </div>
    );
  });

export interface ToolbarProps {
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
  insert: (content: Object) => void;
  edit: (content: Object) => void;
  hideLabels?: boolean;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.PureComponent<ToolbarProps & JSSProps, {}> {

  constructor(props) {
    super(props);
  }

  render() {
    const { insert, edit, content, supportedElements, classes } = this.props;

    const isText = content.caseOf({
      just: c => c instanceof contentTypes.ContiguousText,
      nothing: () => false,
    });

    const elementMap = supportedElements
      .toArray()
      .reduce(
        (m, c) => {
          m[c] = true;
          return m;
        },
        {});

    const iff = el => elementMap[el];

    return (
      <div className={classes.toolbar}>
        <ToolbarGroup className={classes.toolbarInsertGroup} label="Insert">
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Text Block">
              <i className={classes.unicodeIcon}>T</i>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Section">
              <i className={'fa fa-list-alt'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Quote Block">
              <i className={'fa fa-quote-right'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Table">
              <i className={'fa fa-table'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => insert(new contentTypes.CodeBlock())}
                tooltip="Code Block"
                disabled={!iff('codeblock')}>
              <i className={'fa fa-code'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Formula Block">
              <i className={classes.unicodeIcon}>&#8721;</i>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Image">
              <i className={'fa fa-image'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Audio Clip">
              <i className={'fa fa-volume-up'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Video Clip">
              <i className={'fa fa-film'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="YouTube Video">
              <i className={'fa fa-youtube'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="iFrame">
              <i className={'fa fa-html5'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Pullout">
              <i className={'fa fa-external-link-square'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => insert(new contentTypes.Example())}
                tooltip="Example"
                disabled={!iff('example')}>
              <i className={'fa fa-bar-chart'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Definition">
              <i className={'fa fa-book'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Inline Assessment">
              <i className={'fa fa-flask'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Activity">
              <i className={'fa fa-check'}/>
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarFormatGroup} label="Format">
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Bold));
                  })
                }
                tooltip="Bold"
                disabled={!isText}>
              <i className={'fa fa-bold'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Italic"
                disabled={!isText}>
              <i className={'fa fa-italic'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Strikethrough"
                disabled={!isText}>
              <i className={'fa fa-strikethrough'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Highlight"
                disabled={!isText}>
              <i className={'fa fa-pencil'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Superscript"
                disabled={!isText}>
              <i className={'fa fa-superscript'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Subscript"
                disabled={!isText}>
              <i className={'fa fa-subscript'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Code"
                disabled={!isText}>
              <i className={'fa fa-code'}/>
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarContextGroup} label="Text Block">
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Term">
              <i className={'fa fa-book'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Foreign">
              <i className={'fa fa-globe'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Quotation">
              <i className={'fa fa-quote-right'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Citation">
              <i className={'fa fa-asterisk'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="External Hyperlink">
              <i className={'fa fa-external-link'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="High Stakes Assessment Link">
              <i className={'fa fa-check'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Cross Reference Link">
              <i className={'fa fa-map-signs'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Ordered List">
              <i className={'fa fa-list-ol'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Unordered List">
              <i className={'fa fa-list-ul'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Unordered List"
                size={ToolbarButtonSize.Wide}>
              Hyperlink Details...
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarActionsGroup} label="Actions">
          <ToolbarLayoutGrid>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Undo"
                size={ToolbarButtonSize.Wide}>
              <i className={'fa fa-undo'}/> Undo
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Redo"
                size={ToolbarButtonSize.Wide}>
              <i className={'fa fa-repeat'}/> Redo
            </ToolbarButton>
          </ToolbarLayoutGrid>
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Edit Page Details" size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-info-circle"/></div>
              <div>Details</div>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Delete this Page" size={ToolbarButtonSize.Large}
                disabled>
              <div><i className="fa fa-trash-o"/></div>
              <div>Delete</div>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Preview" size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-eye"/></div>
              <div>Preview</div>
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>
      </div>
    );
  }

}
