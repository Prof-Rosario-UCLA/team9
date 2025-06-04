import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import furinaPic from './assets/furina.jpg';
import backgroundImg from './assets/landingpage.jpg';
import CalendarPanel2 from './CalendarPanel2';
import ProfilePanel from './ProfilePanel';
import ThemeToggle from './ThemeToggle';
import defaultAvatar from "./assets/defaultpfp.png";
import StatisticsPanel from './LeaderBoard';
import GroupPanel from './GroupPanel';
import ChorePanel from './ChorePanel';


export default function MainPage() {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial] = useState(() => localStorage.getItem('setupComplete') !== 'true');
  const [activePanel, setActivePanel] = useState(null);
  const [username, setUsername] = useState('Your Username');
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const navigate = useNavigate();

    // Fetch the existing profile
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      fetch("http://localhost:8080/getProfile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch profile");
          }
          return res.json();
        })
        .then((data) => {
          setUsername(data.user_name || "Fetching...");
  
          if (data.pfp) {
            setProfilePic(`data:${data.pfp_mime};base64,${data.pfp}`);
          } else {
            setProfilePic(defaultAvatar);
          }
        })
        .catch((err) => {
          console.error("Error loading profile:", err);
        });
    }, []);

    const renderPopup = () => {
      if (!activePanel) return null;
    
      let content = '';
      let popupStyle = {};
      if (activePanel === 'Profile') content = <ProfilePanel />;
      if (activePanel === 'Group') content = <GroupPanel />;
      if (activePanel === 'Statistics') content = <StatisticsPanel />;
      if (activePanel === 'Calendar2') {
        content = <CalendarPanel2 />;
        popupStyle = {
          overflow: 'hidden',
        };
      }
      if (activePanel === 'Chore') content = <ChorePanel />;
    
      return (
        <div
          className="absolute top-14 left-0 right-0 bottom-0 md:left-56 bg-base-100/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-base-content px-2 sm:px-6"
          style={popupStyle}
        >
          <div className="max-w-6xl w-full max-h-[85vh] flex flex-col justify-between items-center">
            <div className="flex-1 w-full overflow-auto rounded-box">
              {content}
            </div>
            <button className="mt-4 btn btn-outline btn-info" onClick={() => setActivePanel(null)}>
              Close
            </button>
          </div>
        </div>
      );
    };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="navbar h-12 sm:h-14 px-2 sm:px-4 bg-base-100 text-base-content shadow-md border-b border-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-info">GitBlame</a>
        </div>
        <div className="flex-none">
          <button
            className="btn btn-ghost btn-sm text-base-content"
            onClick={() => {
              localStorage.removeItem("authToken");
              navigate("/signin"); 
            }}
            aria-label="Log Out"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100%-4rem)] bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: `url(${backgroundImg})` }}>
        {/* ↑ ADDED overflow-hidden here to contain flex grow */}
        {/* Sidebar */}
        <div className="bg-base-100 w-full md:w-56 flex-shrink-0 flex flex-col justify-between overflow-auto">
          {/* ↑ ADDED overflow-auto to allow scroll on small screen sidebar */}
          <ul className="flex flex-row md:flex-col flex-wrap justify-center md:justify-start items-center gap-2 md:gap-1 p-2 text-info text-xs sm:text-sm">
          <li><button onClick={() => setActivePanel('Profile')}>Profile</button></li>
          <li><button onClick={() => setActivePanel('Group')}>Group</button></li>
          <li><button onClick={() => setActivePanel('Statistics')}>Statistics</button></li>
          <li><button onClick={() => setActivePanel('Chore')}>Chore</button></li>
          <li><button onClick={() => setActivePanel('Calendar2')}>Calendar</button></li>
          </ul>
          <div className="p-3 border-t border-base-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={profilePic} alt="Profile" />
                </div>
              </div>
              <div className="text-sm font-semibold text-base-content">{username}</div>
              {/* ↑ text-base-content auto-adjusts with theme */}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-auto">
          {showTutorial && tutorialStep === 1 && (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <button className="btn btn-info text-base-100 text-lg px-6 animate-pulse" onClick={() => navigate('/setup')}>
                Get Started
              </button>
            </div>
          )}
          {renderPopup()}
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50 max-w-full px-2">
          {/* ↑ ADDED max-w-full and px-2 to prevent it from going offscreen */}
          <div className="bg-base-100 text-base-content p-4 rounded-xl shadow-md max-w-sm w-full text-sm leading-relaxed translate-y-[-10px]">
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
