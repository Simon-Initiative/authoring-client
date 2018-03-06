import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, JSSProps, classNames } from 'styles/jss';
import { InlineStyles } from 'data/content/learning/contiguous';
import { ToolbarButton, ToolbarButtonSize } from './ToolbarButton';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';

import styles from './ContextAwareToolbar.style';

interface ToolbarGroupProps extends JSSProps {
  className?: string;
  children: any;
  label: string;
  highlightColor?: string;
  hide?: boolean;
}

export const ToolbarGroup: React.StatelessComponent<ToolbarGroupProps> = injectSheet(styles)
  (({ className, classes, label, hide, children }: ToolbarGroupProps) => {
    return (
      <div className={classNames([classes.toolbarGroupContainer, hide && 'hide'])}>
        <div className={classNames([classes.toolbarGroup, className])}>
            <div className={classes.tbGroupItems}>{children}</div>
            <div className={classes.tbGroupLabel}>{label}</div>
        </div>
      </div>
    );
  });

interface ToolbarLayoutInlineProps extends JSSProps {
  className?: string;
}

export const ToolbarLayoutInline: React.StatelessComponent<ToolbarLayoutInlineProps> =
  injectSheet(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutInline} ${className}`}>
        {children}
      </div>
    );
  });

interface ToolbarLayoutGridProps extends JSSProps {
  className?: string;
}

export const ToolbarLayoutGrid: React.StatelessComponent<ToolbarLayoutGridProps> =
  injectSheet(styles)
  (({ className, classes, children }) => {
    return (
      <div className={`${classes.toolbarLayoutGrid} ${className}`}>
        {children}
      </div>
    );
  });

export interface ToolbarProps extends JSSProps {
  supportedElements: Immutable.List<string>;
  content: Maybe<Object>;
  insert: (content: Object) => void;
  edit: (content: Object) => void;
  hideLabels?: boolean;
}

@injectSheet(styles)
export class ContextAwareToolbar extends React.PureComponent<ToolbarProps, {}> {

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
                tooltip="Insert Text Block"
                disabled>
              <i className={classes.unicodeIcon}>T</i>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Section"
                disabled>
              <i className={'fa fa-list-alt'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Quote Block"
                disabled>
              <i className={'fa fa-quote-right'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Table"
                disabled>
              <i className={'fa fa-table'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => insert(new contentTypes.CodeBlock())}
                tooltip="Insert Code Block"
                disabled={!iff('codeblock')}>
              <i className={'fa fa-code'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Formula Block"
                disabled>
              <i className={classes.unicodeIcon}>&#8721;</i>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Image"
                disabled>
              <i className={'fa fa-image'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Audio Clip"
                disabled>
              <i className={'fa fa-volume-up'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Video Clip"
                disabled>
              <i className={'fa fa-film'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert YouTube Video"
                disabled>
              <i className={'fa fa-youtube'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert iFrame"
                disabled>
              <i className={'fa fa-html5'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Pullout"
                disabled>
              <i className={'fa fa-external-link-square'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => insert(new contentTypes.Example())}
                tooltip="Insert Example"
                disabled={!iff('example')}>
              <i className={'fa fa-bar-chart'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Definition"
                disabled>
              <i className={'fa fa-book'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Inline Assessment"
                disabled>
              <i className={'fa fa-flask'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Insert Activity"
                disabled>
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
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Italic));
                  })
                }
                tooltip="Italic"
                disabled={!isText}>
              <i className={'fa fa-italic'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Strikethrough));
                  })
                }
                tooltip="Strikethrough"
                disabled={!isText}>
              <i className={'fa fa-strikethrough'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Highlight));
                  })
                }
                tooltip="Highlight"
                disabled={!isText}>
              <i className={'fa fa-pencil'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Superscript));
                  })
                }
                tooltip="Superscript"
                disabled={!isText}>
              <i className={'fa fa-superscript'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Subscript));
                  })
                }
                tooltip="Subscript"
                disabled={!isText}>
              <i className={'fa fa-subscript'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Code));
                  })
                }
                tooltip="Code"
                disabled={!isText}>
              <i className={'fa fa-code'}/>
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarContextGroup} label="Text Block"
            highlightColor={colors.contentSelection} hide={!isText}>
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Term));
                  })
                }
                tooltip="Term">
              <i className={'fa fa-book'}/>
            </ToolbarButton>
            <ToolbarButton
                onClick={
                  () => content.lift((t) => {
                    const text = t as contentTypes.ContiguousText;
                    edit(text.toggleStyle(InlineStyles.Foreign));
                  })
                }
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
          </ToolbarLayoutInline>
        </ToolbarGroup>

        <ToolbarGroup className={classes.toolbarActionsGroup} label="Actions">
          <ToolbarLayoutGrid>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                size={ToolbarButtonSize.Wide}>
              <i className={'fa fa-undo'}/> Undo
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                size={ToolbarButtonSize.Wide}>
              <i className={'fa fa-repeat'}/> Redo
            </ToolbarButton>
          </ToolbarLayoutGrid>
          <ToolbarLayoutInline>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="View and Edit Page Details"
                size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-info-circle"/></div>
              <div>Details</div>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                size={ToolbarButtonSize.Large}
                tooltip="Delete this Page"
                disabled>
              <div><i className="fa fa-trash-o"/></div>
              <div>Delete</div>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => console.log('NOT IMPLEMENTED')}
                tooltip="Preview this Page"
                size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-eye"/></div>
              <div>Preview</div>
            </ToolbarButton>
          </ToolbarLayoutInline>
        </ToolbarGroup>
      </div>
    );
  }

}
