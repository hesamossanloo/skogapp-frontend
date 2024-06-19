import '@fortawesome/fontawesome-free/css/all.min.css';
import 'assets/css/nucleo-icons.css';
import 'assets/demo/demo.css';
import 'assets/scss/black-dashboard-react.scss';
import ForgotPassword from 'components/ForgotPassword/ForgotPassword';
import PrivateRoute from 'components/PrivateRoute/PrivateRoute';
import SignIn from 'components/SignIn/SignIn';
import SignUp from 'components/SignUp/SignUp';
import { AuthProvider } from 'contexts/AuthContext';
import AdminLayout from 'layouts/Admin/Admin.js';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BackgroundColorWrapper from './components/BackgroundColorWrapper/BackgroundColorWrapper';
import ThemeContextWrapper from './components/ThemeWrapper/ThemeWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <AuthProvider>
    <ThemeContextWrapper>
      <BackgroundColorWrapper>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </BrowserRouter>
      </BackgroundColorWrapper>
    </ThemeContextWrapper>
  </AuthProvider>
);
