import { CSSProperties } from 'react';
import injectStyles from 'react-jss';
import { ComponentProps, StyledComponentProps } from 'types/component';

export { CSSProperties };

export type JssValue =
  | string
  | number
  | (string | number | (string | number)[] | '!important')[]
  | null
  | false;

type JSSStyle = CSSProperties | JSSStyles | {
  [K in keyof CSSProperties]: JssValue | JSSStyle | ((props: any) => (JssValue | JSSStyle))
} | {
  extend: JSSStyle[],
};

export interface JSSStyles {
  [displayName: string]: JSSStyle | ((props: any) => JSSStyle);
}

export type JSSThemedStyles = (theme: any) => JSSStyles;

export const classNames = (names: string | string[]) => {
  if (typeof names === 'string') {
    return names.trim();
  }

  return names.filter(n => n).join(' ');
};

// This is really not ideal, the typing here is completely broken using inference.
// Therefore, we must force the types we need using 'any' annotations. This function
// should be replaced with the official JSS withStyles in jss@10 when it becomes more stable
export const withStyles = <Props>(styles: JSSStyles | JSSThemedStyles) =>
  (component: (
    React.ComponentClass<StyledComponentProps<Props, JSSStyles>>
    | ((props: StyledComponentProps<Props, JSSStyles>) => any)
  )) =>
    (injectStyles(styles as any)(component as any) as any) as React.ComponentClass<
    ComponentProps<Props>>;

export interface WithStyles<S extends JSSStyles | JSSThemedStyles> {
  classes: { [P in keyof S]: string };
}

export const injectSheetRE = (style, component) => withStyles(style)(component);
