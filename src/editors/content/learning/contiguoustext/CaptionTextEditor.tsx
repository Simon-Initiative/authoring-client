import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Maybe } from 'tsmonad';
import { ParentContainer, TextSelection } from 'types/active';
import { styles } from 'editors/content/learning/contiguoustext/CaptionTextEditor.styles';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import guid from 'utils/guid';
import { Remove } from 'components/common/Remove';

export interface CaptionTextEditorProps {
  hover: string;
  model: ContentElements;
  activeContentGuid: string;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  parent: ParentContainer;
  onEdit: (updated: ContentElements, source?: Object) => void;
  onUpdateHover: (hover: string) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

export interface CaptionTextEditorState {
  isEditing: boolean;
}

/**
 * CaptionTextEditor React Component
 */
@injectSheet(styles)
export class CaptionTextEditor
    extends React.PureComponent<StyledComponentProps<CaptionTextEditorProps>,
    CaptionTextEditorState> {
  ref: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };
  }

  renderCreateButton = () => {
    const { classes, editMode } = this.props;

    return editMode && (
      <div
        className={classes.createCaptionBtn}
        onMouseDown={(e) => {
          this.setState({
            isEditing: true,
          });
        }}>
        Add a Caption
      </div>
    );
  }

  render() {
    const {
      className, classes, context, services, model, onUpdateHover,
      editMode, onEdit, onFocus, hover, activeContentGuid,
    } = this.props;
    const { isEditing } = this.state;

    return (
      <div className={classNames([
        'CaptionTextEditor',
        classes.captionTextEditor,
        !editMode && classes.disabled,
        className])}>
        {isEditing || model.extractPlainText().caseOf({
          just: plainText => plainText !== '',
          nothing: () => false,
        })
            ? (
              <div className={classes.content}>
                <div className={classes.flex}>
                  <ContentContainer
                    editMode={editMode}
                    activeContentGuid={activeContentGuid}
                    context={context}
                    services={services}
                    onFocus={onFocus}
                    hover={hover}
                    onUpdateHover={onUpdateHover}
                    onEdit={onEdit}
                    model={model} />
                </div>
                <Remove
                  className={classes.removeBtn}
                  editMode={editMode}
                  onRemove={() => {
                    onEdit(ContentElements.fromText('', guid(), INLINE_ELEMENTS));
                    this.setState({
                      isEditing: false,
                    });
                  }} />
              </div>
            )
            : this.renderCreateButton()
        }
      </div>
    );
  }
}
