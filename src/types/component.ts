import { JSSProps } from 'styles/jss';

export type ComponentProps<P> = P & React.Attributes & React.ClassAttributes<P>;

export type StyledComponentProps<P> = ComponentProps<P> & JSSProps;
