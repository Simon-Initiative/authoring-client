import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import * as React from 'react';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import SIDEBAR_ITEMS from './SidebarHelpItems';
import './SidebarHelp.scss';

export function createUrl(resource: string, anchor: string = '') {
  const baseUrl = 'https://docs.oli.cmu.edu';
  const directory = 'dynamic-questions/docs';
  return [baseUrl, directory, resource].join('/') + (anchor ? '#' + anchor : '');
}

interface SidebarHelpProps {
  onInsert: (content: string) => void;
}

const TemplateButton = ({ onClick, name, children, link }) =>
  <div className="card">
    <div className="card-body">
      <h5 className="content">{name}</h5>
      <h6 className="card-subtitle mb-2 text-muted">{children}</h6>
      <a onClick={onClick} className="btn btn-link">Insert</a>
      <a href={link} target="_blank" className="open-docs">
        Docs <i className="fa fa-arrow-right"></i>
      </a>
    </div>
  </div>;

export class SidebarHelp extends React.Component<SidebarHelpProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SidebarContent title="Dynamic Questions">
        <SidebarGroup label="Links">
          <div className="sidebar-help-links">
            <a className="btn btn-outline-primary" target="_blank"
              href={createUrl('overview.html')}>Docs</a>
            <a className="btn btn-outline-primary" target="_blank"
              href={createUrl('examples.html')}>Examples</a>
          </div>
        </SidebarGroup>
        <SidebarGroup label="Built-in Functions">
          <div className="sidebar-help-cards">
            {SIDEBAR_ITEMS.map(item =>
              <TemplateButton
                name={item.name}
                link={item.link}
                onClick={() => this.props.onInsert(item.content)}>
                {item.description}
              </TemplateButton>,
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
    );
  }
}
