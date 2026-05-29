import { Navigate } from 'react-router-dom';
import { getValidToken } from '../../utils/auth';

function RedirectIfAuth({ children }) {
  if (getValidToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RedirectIfAuth;
