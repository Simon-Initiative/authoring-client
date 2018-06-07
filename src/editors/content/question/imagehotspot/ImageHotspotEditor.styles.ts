import { JSSStyles } from 'styles/jss';
import colors from 'styles/colors';

const BORDER_STYLE = '1px solid #ced4da';

export const styles: JSSStyles = {
  ImageHotspotEditor: {
    display: 'flex',
    flexDirection: 'column',
    border: BORDER_STYLE,
    maxWidth: 800,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    background: '#fafafa',
    borderBottom: BORDER_STYLE,
    padding: 2,
  },
  imageBody: {
    position: 'relative',
    overflow: 'hidden',
  },
  hotspots: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  hotspot: {
    fill: colors.selection,
    fillOpacity: 0.5,
    stroke: colors.selection,
    strokeWidth: 2,
    strokeOpacity: 0.8,
    cursor: 'grab',

    '&:hover': {
      fill: colors.hover,
      stroke: colors.hover,
    },
  },
  noImage: {
    flex: 1,
    minHeight: 300,
    backgroundColor: colors.grayLighter,
  },
  removeHotspotButton: {
    color: colors.remove,
  },
};
