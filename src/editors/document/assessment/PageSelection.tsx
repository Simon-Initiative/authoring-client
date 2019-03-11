import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { Remove } from 'components/common/Remove';
import { Button } from 'editors/content/common/Button';

export interface PageSelectionProps {
  onChangeCurrent: (guid: string) => void;
  onEdit: (page: contentTypes.Page) => void;
  onRemove: (page: contentTypes.Page) => void;
  onFocus: (child, parent) => void;
  editMode: boolean;
  pages: Immutable.OrderedMap<string, contentTypes.Page>;
  current: contentTypes.Page;
  context: AppContext;
  services: AppServices;
}

export class PageSelection extends React.PureComponent<PageSelectionProps, {}> {

  onChange = (page: contentTypes.Page) => {
    this.props.onChangeCurrent(page.guid);
  }

  onTitleEdit = (page: contentTypes.Page, text: ContentElements) => {
    this.props.onEdit(page.with({
      title: page.title.with({ text }),
    }));
  }

  renderPage(page: contentTypes.Page, pageNumber: number) {
    return (
      <tr key={page.guid}>

        <td style={{ minWidth: '75px', border: 'none' }} key="label">
          <Button
            editMode={true}
            onClick={() => this.onChange(page)}
            type="link">
            <span style={{ fontWeight: page === this.props.current ? 'bolder' : 'normal' }}>
              Page {pageNumber}
            </span>
          </Button>
        </td>

        <td style={{ width: '100%', border: 'none' }} key="title">
          <ContentContainer
            {...this.props}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            parent={null}
            onFocus={this.props.onFocus}
            model={page.title.text}
            editMode={this.props.editMode}
            onEdit={text => this.onTitleEdit(page, text)}
          />
        </td>

        <td key="remove" style={{ border: 'none' }}>
          <span>
            <Remove
              editMode={this.props.editMode && this.props.pages.size > 1}
              onRemove={this.props.onRemove.bind(this, page)} />
          </span>
        </td>
      </tr>
    );

  }

  renderRows() {
    return this.props.pages.toArray().map((page, index) => this.renderPage(page, index + 1));
  }

  render() {
    return (
      <table className="table table-sm">
        <tbody>
          {this.renderRows()}
        </tbody>
      </table>
    );
  }
}

