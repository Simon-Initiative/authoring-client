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
    '&:hover': {
      border: '2px solid ' + colors.grayLight,
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
