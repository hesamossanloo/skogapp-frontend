// src/components/PrivateRoute.js
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
