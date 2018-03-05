import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';


export interface PageSelectionProps {
  onChangeCurrent: (guid: string) => void;
  onEdit: (page: contentTypes.Page) => void;
  onRemove: (page: contentTypes.Page) => void;
  editMode: boolean;
  pages: Immutable.OrderedMap<string, contentTypes.Page>;
  current: contentTypes.Page;
  context: AppContext;
  services: AppServices;
}

export interface PageSelection {

}

export class PageSelection extends React.PureComponent<PageSelectionProps, {}> {

  constructor(props) {
    super(props);
  }

  onChange(page: contentTypes.Page) {
    this.props.onChangeCurrent(page.guid);
  }

  onTitleEdit(page: contentTypes.Page, text: string) {
    this.props.onEdit(page.with({ title: new contentTypes.Title({
      text: ContentElements.fromText(text, '', TEXT_ELEMENTS) }) }));
  }

  renderPage(page: contentTypes.Page, pageNumber: number) {

    const isCurrent = page === this.props.current;

    const pageLabel = isCurrent
      ? <b>Page {pageNumber}</b>
      : 'Page ' + pageNumber;

    const linkStyle = {
      color: '#0067cb',
      cursor: 'pointer',
    };

    return (
      <tr key={page.guid}>

        <td style={ { minWidth: '75px' } } key="label">
          <a style={linkStyle} onClick={this.onChange.bind(this, page)}>
            {pageLabel}
          </a>
        </td>

        <td style={ { width: '100%' } } key="title">

          <ContentContainer
            {...this.props}
            parent={null}
            model={page.title.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit.bind(this, page)}
          />

        </td>

        <td key="remove">
          <span>
            <button
              disabled={!this.props.editMode}
              onClick={this.props.onRemove.bind(this, page)}
              type="button"
              className="btn btn-sm btn-outline-secondary">
              <i className="fa fa-close"></i>
            </button>
          </span>
        </td>
      </tr>
    );

  }

  renderRows() {
    return this.props.pages.toArray().map((page, index) => this.renderPage(page, index + 1));
  }

  render() {

    const headStyle = {
      backgroundColor: 'white',
    };

    return (
      <table className="table table-sm">
        <thead style={headStyle}>
          <tr>
            <th key="placeholder"></th>
            <th key="title">Title</th>
            <th key="placeholder2"></th>
          </tr>

        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </table>
    );
  }

}

export default PageSelection;
