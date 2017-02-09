'use strict'

import * as React from 'react';
import { connect }  from 'react-redux';

import { viewActions } from '../actions/view';
import { dataActions } from '../actions/data';

interface AllPages {
  onCreate: () => void;
}

export interface AllPagesProps {
  dispatch: any;
  pages: Object[]
}

class AllPages extends React.PureComponent<AllPagesProps, {}> {

  constructor(props) {
    super(props);

    this.onCreate = this._onCreate.bind(this);
  }

  _onCreate() {
    this.props.dispatch(dataActions.createPage((this.refs as any).title.value));
  }

  renderCurrentPages() {

    if (this.props.pages.length === 0) {

      return <div>No pages created, yet...</div>;

    } else {

      let pages = this.props.pages.map(p => {
        const { _id, title} = (p as any);
        return <tr key={_id}><td>
            <button key={_id} onClick={() => this.props.dispatch(dataActions.setActivePage(_id))} 
              className="btn btn-link">{title}</button>
          </td></tr>
      });

      return (
        <table className="table table-striped table-hover"> 
          <thead>
              <tr>
                  <th>Pages</th>
              </tr>
          </thead>
          <tbody>
            {pages}
          </tbody>
        </table>);
    }

  }

  render() {

    
    return (
      <div className="container"> 
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                      {this.renderCurrentPages()}
                      <div className="divider"></div>
                      <div className="input-group">
                        <span className="input-group-addon">New page</span>
                        <input ref="title" type="text" className="form-input" placeholder="Page title" />
                        <button onClick={this.onCreate} className="btn btn-primary input-group-btn">Create</button>
                      </div>
                    </div>
                </div>
                <div className="column col-1"></div>
            </div>
      </div>


      );
  }
}


function subscribedState(state: any): Object {

  const {
    pages
  } = state;

  return {
    pages
  }
}


export default connect(subscribedState)(AllPages);



