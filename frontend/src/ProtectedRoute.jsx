import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Checks if authToken is expired
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const { exp } = JSON.parse(payloadJson);

  if (exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('authToken');
      return <Navigate to="/signin" replace />;
    }
  } catch (e) {
    localStorage.removeItem('authToken');
    return <Navigate to="/signin" replace />;
  }

  return children;
}