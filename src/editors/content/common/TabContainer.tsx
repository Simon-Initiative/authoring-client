import * as React from 'react';
import { convertStringToCSS } from 'utils/style';

import './TabContainer.scss';

export type TabElement = {
  label: string;
  content: JSX.Element;
};

export interface TabContainerProps {
  className?: string;
  labels: string[];
  controls?: JSX.Element[];
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

  renderTabControls() {
    const { controls } = this.props;

    return controls && controls.map((control, i) => (
      <div key={`control-${i}`} className="tab-control">
        {control}
      </div>
    ));
  }

  renderCurrentTab() {
    return React.Children.toArray(this.props.children)[this.state.currentTabIndex];
  }

  render() {
    const { className } = this.props;

    return (
      <div className={`tab-container ${className || ''}`}>
        <div className="tab-header">
          {this.renderTabs()}
          <div className="flex-spacer" />
          {this.renderTabControls()}
        </div>
        <div className="tab-content">
          {this.renderCurrentTab()}
        </div>
      </div>
    );
  }

}

type TabProps = {
  className?: string;
};

export const Tab: React.StatelessComponent<TabProps> = ({
  className,
  children,
}) => (
  <div className={`tab ${className || ''}`}>
    {children}
  </div>
);

type TabSectionHeaderProps = {
  className?: string;
  title: string,
};

export const TabSectionHeader: React.StatelessComponent<TabSectionHeaderProps> = ({
  className,
  title,
  children,
}) => (
  <div className={`tab-section-header ${className || ''}`}>
    <h3>{title}</h3>
    <div className="flex-spacer" />
    <div className="controls">
      {children}
    </div>
  </div>
);

type TabSectionContentProps = {
  className?: string;
};

export const TabSectionContent:
  React.StatelessComponent<TabSectionContentProps> = ({ children, className }) => (
  <div className={`tab-section-content ${className || ''}`}>{children}</div>
);

type TabSectionProps = {
  className?: string,
};

export const TabSection: React.StatelessComponent<TabSectionProps> = ({ className, children }) => (
  <div className={`tab-section ${className || ''}`}>{children}</div>
);

type TabOptionControlProps = {
  className?: string;
  name: string,
  hideLabel?: boolean,
  onClick?: (e, name: string) => void;
};

export const TabOptionControl: React.StatelessComponent<TabOptionControlProps>
  = ({ name, hideLabel, onClick, children, className }) => (
  <div
    className={`control clickable ${convertStringToCSS(name)} ${className || ''}`}
    onClick={e => onClick && onClick(e, name)}>
    {!hideLabel &&
      <div className="control-label">{name}</div>
    }
    {children}
  </div>
);
