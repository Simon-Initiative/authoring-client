import { CSSProperties } from 'react';
import injectSheetJSS from 'react-jss';
import { StyledComponentProps } from 'types/component';

export interface JSSProps {
  classes?: any;
}

export interface JSSStyles {
  [key: string]: CSSProperties | JSSStyles;
}

export const classNames = (names: string | string[]) => {
  if (typeof names === 'string') {
    return names.trim();
  }

  return names.filter(n => n).join(' ');
};

export const injectSheet = injectSheetJSS;

export function injectSheetSFC<P>(style: any):
    (component:
      (props: StyledComponentProps<P>
        & Readonly<{ children?: React.ReactNode }>)
       => JSX.Element)
    => React.StatelessComponent<P> {
  return injectSheetJSS(style);
}
