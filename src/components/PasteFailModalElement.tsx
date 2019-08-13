import * as React from 'react';

export interface PasteFailModalElementProps {
  message: string;
  removed: string[];
}

export class PasteFailModalElement extends React.PureComponent<PasteFailModalElementProps, {}> {

  render() {
    const { message, removed } = this.props;

    return (
      <div>
        <div>
          <p>{message}</p>
        </div>
        <ul>
          {removed.map(r => (
            <li key={r}>{r === 'WbInline' ? 'Inline Assessment' : r}</li>
          ))}
        </ul> 
      </div>
    );
  }
}
