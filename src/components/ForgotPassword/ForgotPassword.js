import { Grid, Link } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import logo from 'assets/img/favicon.png';
import Copyright from 'components/Copyright/Copyright';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useRef, useState } from 'react';

const ForgotPassword = () => {
  const emailRef = useRef();
  const [message, setMessage] = useState('');
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, emailRef.current.value);
      setMessage('Password reset email sent successfully');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'white' }}>
          <div className="logo-img">
            <img src={logo} alt="SkogApp-logo" />
          </div>
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            inputRef={emailRef}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Password Reset Email
          </Button>
          {message && (
            <Typography variant="body2" color="text.secondary" align="center">
              {message}
            </Typography>
          )}
        </Box>
        <Grid container sx={{ mt: 5 }}>
          <Grid item xs>
            <Copyright appName="SkogApp" appURL="https://skogapp.no/" />
          </Grid>
          <Grid item>
            {/* Privacy Policy Link */}
            <Link
              href={`${process.env.PUBLIC_URL}/privacy-policy.html`} // Adjust the path if necessary
              target="_blank" // Opens in a new tab
              rel="noopener noreferrer" // For security reasons
              variant="body2"
              style={{ marginLeft: '10px' }} // Add some spacing between Copyright and Privacy Policy
            >
              Privacy Policy
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
