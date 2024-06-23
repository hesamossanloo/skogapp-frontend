// src/components/SignUp.js
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import logo from 'assets/img/favicon.png';
import Copyright from 'components/Copyright/Copyright';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const { signUp } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(
        emailRef.current.value,
        passwordRef.current.value,
        firstNameRef.current.value,
        lastNameRef.current.value
      );
      setMessage('Sign up was successful! Please sign in to continue.');
      navigate('/signin'); // Navigate to the sign-in page
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
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                inputRef={firstNameRef}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                inputRef={lastNameRef}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                inputRef={emailRef}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                inputRef={passwordRef}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          {message && (
            <Typography variant="body2" color="text.secondary" align="center">
              {message}
            </Typography>
          )}
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/signin" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
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

export default SignUp;
