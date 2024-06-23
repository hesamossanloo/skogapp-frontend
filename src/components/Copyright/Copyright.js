import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

// Define the component
const Copyright = ({ appName, appURL, ...rest }) => {
  return (
    <Typography variant="body2" color="text.secondary" {...rest}>
      {'Copyright © '}
      <Link color="inherit" href={appURL}>
        {appName}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

// Define propTypes for the component
Copyright.propTypes = {
  appName: PropTypes.string.isRequired,
  appURL: PropTypes.string.isRequired,
};

// Export the component
export default Copyright;
