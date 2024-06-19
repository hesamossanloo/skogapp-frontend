import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const Copyright = (props) => {
  const { appName, appURL } = props;
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href={appURL}>
        {appName}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

// Add props validation
Copyright.propTypes = {
  appName: PropTypes.string.isRequired,
  appURL: PropTypes.string.isRequired,
};

export default Copyright;
