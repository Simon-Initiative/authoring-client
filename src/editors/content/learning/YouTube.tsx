import * as React from 'react';

import { YouTube as YouTubeType } from '../../../data/content/learning/youtube';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { TextInput } from '../common/TextInput';
import { Collapse } from '../common/Collapse';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import colors from 'styles/colors';

export interface YouTubeProps extends AbstractContentEditorProps<YouTubeType> {

}

export interface YouTubeState {

}

/**
 * The content editor for Table.
 */
export class YouTube
  extends AbstractContentEditor<YouTubeType, YouTubeProps, YouTubeState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    // this.onPopoutEdit = this.onPopoutEdit.bind(this);
    // this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.model !== this.props.model;
  }

  // onPopoutEdit(content: string) {
  //   const popout = this.props.model.popout.with({ content });
  //   this.props.onEdit(this.props.model.with({ popout }));
  // }

  // onAlternateEdit(content: ContentElements) {
  //   const alternate = this.props.model.alternate.with({ content });
  //   this.props.onEdit(this.props.model.with({ alternate }));
  // }

  onSrcEdit(src: string) {
    const model = this.props.model.with({ src });
    this.props.onEdit(model, model);
  }

  onHeightEdit(height: string) {
    const model = this.props.model.with({ height });
    this.props.onEdit(model, model);
  }

  onWidthEdit(width: string) {
    const model = this.props.model.with({ width });
    this.props.onEdit(model, model);
  }


  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentElements) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  row(text: string, width: string, control: any) {
    const widthClass = 'col-' + width;
    return (
      <div className="form-group row">
        <label className="col-1 col-form-label">{text}</label>
        <div className={widthClass}>
          {control}
        </div>
      </div>
    );
  }


  renderSidebar(): JSX.Element {
    const { model } = this.props;

    return (
      <SidebarContent title="YouTube">
        <SidebarGroup label="Video Source">
          <TextInput
            {...this.props}
            width="100%"
            type="text"
            label=""
            value={this.props.model.src}
            onEdit={this.onSrcEdit} />
        </SidebarGroup>
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup
        label="YouTube"
        highlightColor={colors.contentSelection}>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {

    const { titleContent, caption, popout, height, width } = this.props.model;

    return (
      <div className="itemWrapper container">
        <br/>

        <p>Enter the id of the YouTube video you wish to display:</p>

        {this.row('', '9', <div className="input-group">
            <span className="input-group-addon">https://youtube.com/watch?v=</span>
            <input type="text" value={this.state.src}
              onChange={this.onSrcEdit.bind(this)} className="form-control"/>
            </div>)}

        <Collapse caption="Additional properties">

        {this.row('Height', '2', <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}

        {this.row('Width', '2', <div className="input-group input-group-sm">
           <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

          {this.row('Popout', '8', <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit}
            />)}

          {this.row('Title', '8', <ContentContainer
            {...this.props}
            model={titleContent.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
          />)}

          {this.row('Caption', '8', <ContentContainer
          {...this.props}
          model={caption.content}
          editMode={this.props.editMode}
          onEdit={this.onCaptionEdit}
          />)}
        </Collapse>

      </div>);
  }

}










// import * as React from 'react';
// import { YouTube as YouTubeType } from 'data/content/learning/youtube';
// import {
//   InteractiveRenderer, InteractiveRendererProps, InteractiveRendererState,
// } from './InteractiveRenderer';
// import ModalMediaEditor from 'editors/content/media/ModalMediaEditor';
// import { YouTubeEditor } from 'editors/content/media/YouTubeEditor';
// import AutoHideEditRemove from './AutoHideEditRemove';

// import './markers.scss';

// type Data = {
//   youtube: YouTubeType;
// };

// export interface YouTubeProps extends InteractiveRendererProps {
//   data: Data;
// }

// export interface YouTubeState extends InteractiveRendererState {

// }

// export interface YouTubeProps {

// }


// export class YouTube extends InteractiveRenderer<YouTubeProps, YouTubeState> {

//   constructor(props) {
//     super(props, {});

//     this.onClick = this.onClick.bind(this);
//     this.onRemove = this.onRemove.bind(this);
//   }

//   onClick() {
//     const b = this.props.blockProps;
//     this.props.blockProps.services.displayModal(
//       <ModalMediaEditor
//         editMode={true}
//         context={b.context}
//         services={b.services}

//         model={this.props.data.youtube}
//         onCancel={() => this.props.blockProps.services.dismissModal()}
//         onInsert={(youtube) => {
//           this.props.blockProps.services.dismissModal();
//           this.props.blockProps.onEdit({ youtube });
//         }
//       }>
//         <YouTubeEditor
//           onFocus={null}
//           model={this.props.data.youtube}
//           context={b.context}
//           services={b.services}
//           editMode={true}
//           onEdit={c => true}/>
//       </ModalMediaEditor>,
//     );
//   }

//   onRemove() {
//     this.props.blockProps.onRemove();
//   }

//   render() : JSX.Element {

//     const { src, height, width } = this.props.data.youtube;
//     const fullSrc = 'https://www.youtube.com/embed/'
//       + (src === '' ? 'C0DPdy98e4c' : src);

//     return (
//       <div ref={c => this.focusComponent = c} onFocus={this.onFocus} onBlur={this.onBlur}>
//         <AutoHideEditRemove onEdit={this.onClick} onRemove={this.onRemove}
//           editMode={this.props.blockProps.editMode} >
//           <iframe src={fullSrc} height={height} width={width}/>
//         </AutoHideEditRemove>

//       </div>);
//   }
// }

// export default YouTube;
