import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { TextInput } from '../../content/common/TextInput';

export interface PageSelectionProps {  
  onChangeCurrent: (guid: string) => void;
  onEdit: (page: contentTypes.Page) => void;
  pages: Immutable.OrderedMap<string, contentTypes.Page>;
  current: contentTypes.Page;
}

export interface PageSelection {
  
}

export class PageSelection extends React.PureComponent<PageSelectionProps, { text }> {

  constructor(props) {
    super(props);

    this.state = {
      text: this.props.current.title.text,
    };

    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  onChange(page: contentTypes.Page) {
    this.props.onChangeCurrent(page.guid);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      text: nextProps.current.title.text,
    });
  }

  onTitleEdit(text) {
    this.setState(
      { text }, 
      () => this.props.onEdit(this.props.current.with(
        { title: this.props.current.title.with({ text }) })));
  }

  renderPage(page: contentTypes.Page) {
    return <a className="dropdown-item" 
      onClick={this.onChange.bind(this, page)}>{page.title.text}</a>;
  }
  
  render() {
    return (
      <div className="input-group">
        <TextInput
          value={this.props.current.title.text}
          onEdit={this.onTitleEdit}
          type="text"
          width="300px"
          label=""
          />
        
        <div className="dropdown">
          <button className="btn btn-secondary dropdown-toggle" 
            type="button" id="dropdownMenuButton" 
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Select
          </button>

          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {this.props.pages.map(p => this.renderPage(p))}
          </div>
        </div>
          
      </div>
    );
  }

}

export default PageSelection;
