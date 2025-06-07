import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState('pending');

  useEffect(() => {
    fetch('http://localhost:8080/getProfile', {
      method: 'GET',
      credentials: 'include',   // ← send your httpOnly cookie
    })
      .then(res => {
        if (res.ok) {
          setAuthState('ok');
        } else {
          setAuthState('fail');
        }
      })
      .catch(() => {
        setAuthState('fail');
      });
  }, []);

  if (authState === 'pending') {
    return null; 
  }
  if (authState === 'fail') {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
}