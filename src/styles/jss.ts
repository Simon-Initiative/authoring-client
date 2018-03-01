export { default as injectSheet } from 'react-jss';

export interface JSSProps {
  classes?: any;
}

export const classNames = (names: string | string[]) => {
  if (typeof names === 'string') {
    return names.trim();
  }

  return names.join(' ');
};
