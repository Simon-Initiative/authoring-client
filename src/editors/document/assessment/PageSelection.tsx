import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

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
        <input 
          value={this.props.current.title.text}
          onChange={this.onTitleEdit}
          type="text"
          style={ { width: '300px', maxWidth: '300px' } }
          className="form-control" 
          aria-label="Text input with dropdown button"/>
        <div className="input-group-btn">
          <button type="button" className="btn btn-secondary dropdown-toggle" 
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Select
          </button>
          <div className="dropdown-menu dropdown-menu-right">
            {this.props.pages.map(p => this.renderPage(p))}
          </div>
          
        </div>
      </div>
    );
  }

}

export default PageSelection;
