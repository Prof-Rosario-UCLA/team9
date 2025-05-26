import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import furinaPic from './assets/furina.jpg';
import backgroundImg from './assets/landingpage.jpg';

export default function MainPage() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Dark Navbar */}
      <div className="navbar bg-neutral text-neutral-content shadow-md border-b border-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-info">GitBlame</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-square btn-ghost text-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm space-y-1">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar + Main Panel with background */}
      <div
        className="flex flex-col md:flex-row h-[calc(100%-4rem)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >
        {/* Sidebar */}
        <div className="bg-base-100 w-full md:w-56 flex-shrink-0 flex flex-col justify-between">
          <ul className="menu p-2 rounded-box text-info">
            <li><a>Profile</a></li>
            <li><a>Group</a></li>
            <li><a>Calendar</a></li>
            <li><a>Statistics</a></li>
          </ul>

          <div className="p-3 border-t border-base-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                </div>
              </div>
              <div className="text-sm font-semibold text-white">Username</div>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => alert('Settings clicked')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.57.939c.83-.462 1.91.279 1.648 1.2a1.724 1.724 0 001.2 2.57c.921.3.921 1.603 0 1.902a1.724 1.724 0 00-.939 2.57c.462.83-.279 1.91-1.2 1.648a1.724 1.724 0 00-2.57 1.2c-.3.921-1.603.921-1.902 0a1.724 1.724 0 00-2.57-.939c-.83.462-1.91-.279-1.648-1.2a1.724 1.724 0 00-1.2-2.57c-.921-.3-.921-1.603 0-1.902a1.724 1.724 0 00.939-2.57c-.462-.83.279-1.91 1.2-1.648a1.724 1.724 0 002.57-1.2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 relative overflow-hidden flex items-center justify-center">
          {showTutorial && tutorialStep === 1 && (
            <div className="text-center">
              <button
                className="btn btn-info text-white text-lg px-6 animate-pulse"
                onClick={() => navigate('/setup')}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Guide */}
      {showTutorial && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50">
          <div className="bg-base-100 p-4 rounded-xl shadow-md max-w-sm text-sm leading-relaxed translate-y-[-10px]">
            {tutorialStep === 0 && (
              <>
                👋 Welcome to <span className="text-info font-semibold">GitBlame</span>!<br />
                This app helps manage chores fairly using groups, calendars, and leaderboards.
                <div
                  className="mt-2 text-info font-semibold text-right cursor-pointer hover:underline"
                  onClick={() => setTutorialStep(1)}
                >
                  Click to continue →
                </div>
              </>
            )}
            {tutorialStep === 1 && (
              <>
                I’ll walk you through getting started.<br />
                Begin by clicking the “Get Started” in the middle of the screen!
              </>
            )}
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
