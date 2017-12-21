import * as React from 'react';

import './TabContainer.scss';

export interface TabContainerProps {
  labels: string[];
}

export interface TabContainerState {
  currentTabIndex: number;
}

export class TabContainer
  extends React.PureComponent<TabContainerProps, TabContainerState> {

  constructor(props) {
    super(props);

    this.state = {
      currentTabIndex: 0,
    };

    this.onTabClick = this.onTabClick.bind(this);
  }

  onTabClick(index: number) {
    this.setState({ currentTabIndex: index });
  }

  renderTabs() {

    const tabs = this.props.labels
      .map((title, index) => {
        const active = index === this.state.currentTabIndex ? 'active' : '';
        const classes = 'nav-link ' + active;
        return <a key={title} className={classes}
          onClick={this.onTabClick.bind(this, index)}>{title}</a>;
      });

    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
    );
  }

  renderCurrentTab() {
    return React.Children.toArray(this.props.children)[this.state.currentTabIndex];
  }

  render() {
    return (
      <div className="tab-container">
        <div className="tab-header">
          {this.renderTabs()}
        </div>
        <div className="tab-content">
          {this.renderCurrentTab()}
        </div>
      </div>
    );
  }

}

