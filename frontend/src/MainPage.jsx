import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import furinaPic from './assets/furina.jpg';
import backgroundImg from './assets/landingpage.jpg';
import CalendarPanel2 from './CalendarPanel2';
import ProfilePanel from './ProfilePanel';
import ThemeToggle from './ThemeToggle';

export default function MainPage() {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial] = useState(() => localStorage.getItem('setupComplete') !== 'true');
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();

  const renderPopup = () => {
    if (!activePanel) return null;

    let content = '';
    if (activePanel === 'Profile') content = <ProfilePanel />;
    if (activePanel === 'Group') content = 'Here you manage your group.';
    if (activePanel === 'Statistics') content = 'Your chore stats and points.';
    if (activePanel === 'Calendar2') content = <CalendarPanel2 />;

    return (
      <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm p-6 z-10 flex flex-col items-center justify-center text-base-content border-l border-info">
        <div className="text-center max-w-6xl w-full">
          <div className="text-lg">{content}</div>
          <button className="mt-8 btn btn-outline btn-info" onClick={() => setActivePanel(null)}>
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="navbar bg-base-100 text-base-content shadow-md border-b border-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-info">GitBlame</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-square btn-ghost text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm space-y-1 text-base-content">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100%-4rem)] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImg})` }}>
        {/* Sidebar */}
        <div className="bg-base-100 w-full md:w-56 flex-shrink-0 flex flex-col justify-between">
          <ul className="menu p-2 rounded-box text-info">
            <li><button onClick={() => setActivePanel('Profile')}>Profile</button></li>
            <li><button onClick={() => setActivePanel('Group')}>Group</button></li>
            <li><button onClick={() => setActivePanel('Statistics')}>Statistics</button></li>
            <li><button onClick={() => setActivePanel('Calendar2')}>Calendar</button></li>
          </ul>
          <div className="p-3 border-t border-base-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                </div>
              </div>
              <div className="text-sm font-semibold text-base-content">Username</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {showTutorial && tutorialStep === 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="btn btn-info text-white text-lg px-6 animate-pulse" onClick={() => navigate('/setup')}>
                Get Started
              </button>
            </div>
          )}
          {renderPopup()}
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50">
          <div className="bg-base-100 text-base-content p-4 rounded-xl shadow-md max-w-sm text-sm leading-relaxed translate-y-[-10px]">
            {tutorialStep === 0 && (
              <>
                Welcome to <span className="text-info font-semibold">GitBlame</span>!
                This app helps manage chores fairly using groups, calendars, and leaderboards.
                <div className="mt-2 text-info font-semibold text-right cursor-pointer hover:underline" onClick={() => setTutorialStep(1)}>
                  Click to continue →
                </div>
              </>
            )}
            {tutorialStep === 1 && <>I’ll walk you through getting started. Begin by clicking the “Get Started” button!</>}
          </div>
          <div className="avatar animate-bounce">
            <div className="w-20 rounded-full ring-2 ring-info ring-offset-base-100 ring-offset-2">
              <img src={furinaPic} alt="Guide" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
