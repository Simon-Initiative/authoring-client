import colors from 'styles/colors';

export default {
  materials: {
    paddingLeft: '25px',
    display: 'flex',
    flexDirection: 'row',
  },
  materialsContents: {
    flexGrow: 1,
  },
  emptyMaterial: {
    height: '300px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '300px',
    border: '2px solid transparent',
    cursor: 'pointer',

    '&:hover': {
      border: '2px solid ' + colors.selection,
    },
  },
  emptyMaterialActive: {
    height: '300px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '300px',
    backgroundColor: colors.grayLight,
    border: '2px solid transparent',
  },
  material: {
    width: '100%',
  },
};
