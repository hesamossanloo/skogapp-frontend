import '@fortawesome/fontawesome-free/css/all.min.css';
import 'assets/css/nucleo-icons.css';
import 'assets/demo/demo.css';
import 'assets/scss/black-dashboard-react.scss';
import ForgotPassword from 'components/ForgotPassword/ForgotPassword';
import PrivacyPolicy from 'components/PrivacyPolicy/PrivacyPolicy';
import PrivateRoute from 'components/PrivateRoute/PrivateRoute';
import SignIn from 'components/SignIn/SignIn';
import SignUp from 'components/SignUp/SignUp';
import { AuthProvider, useAuth } from 'contexts/AuthContext';
import { FeatureInfosProvider } from 'contexts/FeatureInfosContext';
import AdminLayout from 'layouts/Admin/Admin.js';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BackgroundColorWrapper from './components/BackgroundColorWrapper/BackgroundColorWrapper';
import ThemeContextWrapper from './components/ThemeWrapper/ThemeWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
const CheckPersistentLogin = () => {
  const { currentUser } = useAuth();
  return currentUser ? (
    <Navigate to="/admin/map" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
};
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
                  <FeatureInfosProvider>
                    <AdminLayout />
                  </FeatureInfosProvider>
                </PrivateRoute>
              }
            />
            <Route path="/privacy-policy.html" element={<PrivacyPolicy />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<CheckPersistentLogin />} />
          </Routes>
        </BrowserRouter>
      </BackgroundColorWrapper>
    </ThemeContextWrapper>
  </AuthProvider>
);
