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
import { useAuth } from 'contexts/AuthContext';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { signIn, signInWithGoogle } = useAuth();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(emailRef.current.value, passwordRef.current.value);
      setMessage('Sign in was successful!');
      navigate('/admin/map'); // Navigate to the dashboard
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setMessage('Sign in with Google was successful!');
      navigate('/admin/map'); // Navigate to the dashboard
    } catch (error) {
      setMessage(`Error signing in with Google: ${error.message}`);
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            inputRef={emailRef}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            inputRef={passwordRef}
          />
          {/* TODO Implement this */}
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 1, mb: 2 }}
            onClick={handleGoogleSignIn}
          >
            Sign In with Google
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      {message && (
        <Typography variant="body2" color="text.secondary" align="center">
          {message}
        </Typography>
      )}
      <Copyright
        sx={{ mt: 5 }}
        appName="SkogApp"
        appURL="https://skogapp.no/"
      />
    </Container>
  );
}
