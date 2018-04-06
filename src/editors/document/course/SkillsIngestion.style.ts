import colors from 'styles/colors';

export default {
  error: {
    color: colors.danger,
  },
  uploader: {
    minWidth: '280px',
    maxWidth: '400px',
    height: '180px',
    '& label': {
      display: 'flex',
      justifyContent: 'space-around',
      flexDirection: 'column',
      paddingLeft: '20px',
      paddingTop: '10px',
      paddingBottom: '10px',
      color: '#999',
      fontSize: '.9em',
      minWidth: '280px',
      maxWidth: '400px',
      height: '100%',
      border: '3px solid #eee',
      borderRadius: '7px',
      transition: 'all .2s ease',
      '&:hover': {
        borderColor: colors.blue,
      },
      '& i': {
        fontSize: '2.5em',
        verticalAlign: 'middle',
        marginRight: '10px',
      },
      '& i.fa-check-circle': {
        color: colors.success,
      },
    },
  },
};
