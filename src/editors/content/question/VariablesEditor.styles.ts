import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

const BORDER_STYLE = '1px solid #ced4da';

export const styles: JSSStyles = {
  VariablesEditor: {
    display: 'flex',
    flexDirection: 'column',
    border: BORDER_STYLE,
    minWidth: 500,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    background: '#fafafa',
    borderBottom: BORDER_STYLE,
    padding: 2,
  },
  imageBody: {
    flex: 1,
  },
  hotspotBody: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.grayLighter,
  },
  hotspots: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  noImage: {
    minHeight: 300,
  },
  removeHotspotButton: {
    color: colors.remove,
  },
};
