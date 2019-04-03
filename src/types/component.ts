import { WithStyles, JSSStyles } from 'styles/jss';

export type ComponentProps<P> = P & React.Attributes
  & Readonly<Partial<{ className: string; children: React.ReactNode }>>;

export type StyledComponentProps<P, S extends JSSStyles> = ComponentProps<P> & WithStyles<S>;
