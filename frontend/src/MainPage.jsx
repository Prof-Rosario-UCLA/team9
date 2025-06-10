import { useState, useEffect } from "react";
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
import InboxPanel from './InboxPanel';

export default function MainPage() {
  const [tutorialStep, setTutorialStep] = useState(0);
  const tutorialSteps = ['Profile', 'Group', 'Statistics', 'Chore', 'Calendar', 'Inbox'];
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    return localStorage.getItem('cookieConsent') !== 'true';
  });
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };
  const getTutorialMessage = (step) => {
    const labels = {
      Profile: "This is your profile where you can update your picture, info, and contact.",
      Group: "Manage your chore group here. Create, join, or invite friends.",
      Statistics: "Track leaderboard stats and see who’s doing the most work.",
      Chore: "Assign and claim chores in this panel.",
      Calendar: "View all tasks by date and interact with them on the calendar.",
      Inbox: "Receive invites and notifications here.",
    };
    return labels[step] || '';
  };
  const [showTutorial, setShowTutorial] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [username, setUsername] = useState('Your Username');
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/getProfile", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          navigate("/signin");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setUsername(data.user_name || "Fetching...");
        if (data.pfp) {
          setProfilePic(`data:${data.pfp_mime};base64,${data.pfp}`);
        } else {
          setProfilePic(defaultAvatar);
        }
        setShowTutorial(!data.tutorial_completed);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setShowTutorial(false);
      });
  }, []);

  const finishTutorial = async () => {
    try {
      await fetch("/completeTutorial", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error('Error completing tutorial:', err);
    }
    setShowTutorial(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed', err);
    }
    navigate('/signin');
  };

  const renderPopup = () => {
    if (!activePanel) return null;
    let content = '';
    let popupStyle = {};
    if (activePanel === 'Profile') content = <ProfilePanel username={username} setUsername={setUsername} profilePic={profilePic} setProfilePic={setProfilePic} />;
    if (activePanel === 'Group') content = <GroupPanel />;
    if (activePanel === 'Statistics') content = <StatisticsPanel />;
    if (activePanel === 'Inbox') content = <InboxPanel />;
    if (activePanel === 'Calendar') {
      content = <CalendarPanel2 />;
      popupStyle = { overflow: 'hidden' };
    }
    if (activePanel === 'Chore') content = <ChorePanel />;

    return (
      <section
        className="absolute top-14 left-0 right-0 bottom-0 md:left-56 bg-base-100/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-base-content px-2 sm:px-6"
        style={popupStyle}
        aria-label="Panel Content"
      >
        <article className="max-w-6xl w-full max-h-[85vh] flex flex-col justify-between items-center">
          <div className="flex-1 w-full overflow-auto rounded-box">{content}</div>
          <button className="mt-4 btn btn-outline btn-info" onClick={() => setActivePanel(null)}>Close</button>
        </article>
      </section>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <header className={`navbar h-12 sm:h-14 px-2 sm:px-4 bg-base-100 text-base-content shadow-md border-b border-base-300 ${showTutorial ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex-1">
          <span className="btn btn-ghost text-xl text-info">GitBlame</span>
        </div>
        <nav className="flex-none">
          <button className="btn btn-ghost btn-sm text-base-content" onClick={handleLogout}>Log Out</button>
        </nav>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100%-4rem)] bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: `url(${backgroundImg})` }}>
        <aside className={`bg-base-100 w-full md:w-56 flex-shrink-0 flex flex-col justify-between overflow-auto ${showTutorial ? 'pointer-events-none opacity-60' : ''}`}>
          <nav aria-label="Sidebar Navigation">
            <ul className="flex flex-row md:flex-col flex-wrap justify-center md:justify-start items-center gap-2 md:gap-1 p-2 text-info text-xs sm:text-sm">
              {tutorialSteps.map((step, i) => (
                <li key={step}>
                  <button
                    className={tutorialSteps[tutorialStep - 1] === step ? 'ring-4 ring-info rounded-md' : ''}
                    onClick={() => setActivePanel(step)}
                  >
                    {step}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <footer className="p-3 border-t border-base-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={profilePic} alt="Profile" />
                </div>
              </div>
              <strong className="text-sm font-semibold text-base-content">{username}</strong>
            </div>
            <ThemeToggle />
          </footer>
        </aside>

        <main className="flex-1 relative overflow-auto">{renderPopup()}</main>
      </div>

      {showTutorial && (
        <section className="absolute inset-0 z-50 flex items-center justify-center px-2" aria-label="Tutorial Overlay">
          <article className="relative flex flex-col items-center text-center w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] h-auto p-6 bg-base-100 text-base-content rounded-2xl shadow-md text-sm sm:text-base leading-relaxed">
            <div className="w-full">
              {tutorialStep === 0 ? (
                <>
                  <p className="mb-2 text-base sm:text-lg">
                    Welcome to <strong className="text-info">GitBlame</strong>!
                  </p>
                  <p className="mb-2">
                    I’m <strong className="text-info">Furina</strong>, your guide.
                  </p>
                  <p className="mb-2">This app helps you manage chores and stay accountable with your group.</p>
                  <p className="mb-4 font-semibold">Would you like a quick tutorial?</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button className="btn btn-sm btn-outline" onClick={finishTutorial}>Skip</button>
                    <button className="btn btn-sm btn-info text-white shadow" onClick={() => setTutorialStep(1)}>Start Tutorial</button>
                  </div>
                </>
              ) : tutorialStep <= tutorialSteps.length ? (
                <>
                  <p className="mb-4">{getTutorialMessage(tutorialSteps[tutorialStep - 1])}</p>
                  <button className="btn btn-sm btn-info text-white shadow" onClick={() => setTutorialStep(tutorialStep + 1)}>Next</button>
                </>
              ) : (
                <>
                  <p className="mb-4">That's it! You’ve completed the tutorial.</p>
                  <button className="btn btn-sm btn-success text-white shadow" onClick={finishTutorial}>Finish Tutorial</button>
                </>
              )}
            </div>
            <div className="self-end mt-6">
              <div className="avatar animate-bounce">
                <div className="w-20 rounded-full ring-2 ring-info ring-offset-base-100 ring-offset-2">
                  <img src={furinaPic} alt="Furina Guide" />
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {showCookieBanner && (
        <footer className="fixed bottom-0 inset-x-0 z-50 bg-base-200 text-base-content text-sm p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
          <p>
            This site uses cookies for authentication and functionality. By using this app, you accept our use of cookies.
          </p>
          <button className="btn btn-sm btn-info text-white" onClick={acceptCookies}>
            I Understand
          </button>
        </footer>
      )}
    </div>
  );
}
