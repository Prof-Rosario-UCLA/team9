import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import LandingPage from './LandingPage.jsx';
import SignUp from './SignUp.jsx';
import SignIn from './SignIn.jsx';
import MainPage from './MainPage.jsx';
import SetupPage from './SetupPage';
import ProtectedRoute from './ProtectedRoute.jsx';
import LeaderBoard from './LeaderBoard';
import GlobalOfflineWrapper from './GlobalOfflineWrapper';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalOfflineWrapper>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        </Routes>
      </GlobalOfflineWrapper>
    </BrowserRouter>
  </StrictMode>
);
