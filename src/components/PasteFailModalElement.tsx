import * as React from 'react';
import { removeNode } from 'editors/document/org/utils';

export interface PasteFailModalElementProps {
  message: string;
  removed?: Array<string>;
}

export class PasteFailModalElement extends React.PureComponent<PasteFailModalElementProps, {}> {

  render() {
    const { message, removed } = this.props;

    console.log("render()");
    console.log(removed);
    return (
      <div>
        <div>
          <p>{message}</p>
        </div>
        <ul>
          {removed.map((r) => (
            <li>{r}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export function generatePasteFailModalElement (displayMessage: string, removedElements: Array<string>) {

  return (
    <PasteFailModalElement
      message={displayMessage}
      removed={removedElements} />
  )
}
