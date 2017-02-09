'use strict'

import * as React from 'react';

import Toolbar from './Toolbar';
import DraftWrapper from './DraftWrapper';
import { ContentState } from 'draft-js';

import { translateDraftToContent } from './translate';

interface PageEditor {
  lastContent: ContentState;
  timer: any;
  timerStart: number;
  id: string;
  title: string;
}

export interface PageEditorProps {
  content: any; 
  debug: boolean;
  authoringActions: any;
  modalActions: any;
  dataActions: any;
  rev: string;
  editHistory: Object[];
}



class PageEditor extends React.Component<PageEditorProps, {}> {

  constructor(props) {
    super(props);
    this.timerStart = 0;
    this.timer = null;

    this.id = (this.props.content as any)._id;
    this.title = (this.props.content as any).title;
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.content.content !== nextProps.content.content) {
       return true; 
    } else if (this.props.editHistory.length !== nextProps.editHistory.length) {
       return true;
    } else {
       return false;
    }
  }

  now() {
      return new Date().getTime();
  }

  translate(content: ContentState) {
    return Object.assign({}, translateDraftToContent(content), 
        { _rev: this.props.rev, _id: this.id, type: 'page', title: this.title});
  }

  onContentChange(content: ContentState) {
    this.lastContent = content;
    
    // Do not issue a save on every content state update,
    // instead wait until the user has paused editing for 
    // two seconds - but force a save after we have deferred
    // more than five seconds from the start of their editing

    let startTimer = () => setTimeout(() => {
          this.timer = null;
          this.props.dataActions.savePage(this.translate(this.lastContent));
        }, 2000);

    if (this.timer !== null) {
      
      clearTimeout(this.timer);
      this.timer = null;

      if (this.now() - this.timerStart > 5000) {
        this.props.dataActions.savePage(this.translate(this.lastContent));
      } else {
        this.timer = startTimer(); 
      }
    } else {
        this.timerStart = this.now();
        this.timer = startTimer();
    }
    
  }

  render() {
    return (
        <div className="container">
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                        <Toolbar
                            authoringActions={this.props.authoringActions} 
                            modalActions={this.props.modalActions} />
                        <DraftWrapper 
                            editHistory={this.props.editHistory} 
                            content={this.props.content} 
                            notifyOnChange={this.onContentChange.bind(this)} />
                    </div>
                </div>
                
                <div className="column col-1"></div>
            </div>
        </div>
      
    )
  }

  componentWillUnmount() {
    if (this.timer !== null) {
        clearTimeout(this.timer);
    }
    if (this.lastContent !== undefined) {
        this.props.dataActions.savePage(this.translate(this.lastContent));
    }
  }

}

export default PageEditor;


