import { Link } from 'react-router-dom';
import bgImage from './assets/landingpage.jpg';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10"></div>

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between bg-base-100/20 backdrop-blur-sm rounded-xl mt-6 mb-6">
        {/* Logo / Title */}
        <div className="text-white font-bold text-xl">
          <span className="text-info"> Git-Blame</span>
        </div>

        {/* Sign In button */}
        <Link to="/signin">
          <button className="btn btn-sm btn-outline btn-info">Sign In</button>
        </Link>
      </nav>

      {/* Centered main content */}
      <div className="flex-1 flex flex-col items-center justify-center pb-12">
        {/* Page heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-info text-center mb-10">
          Welcome to Git-Blame
        </h1>

        {/* Two-column card layout */}
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
          {/* Left Card */}
          <div className="card grow bg-transparent border border-info rounded-box p-6 text-center shadow-md backdrop-blur-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">What is Git Blame?</h2>
              <p className="text-sm sm:text-base text-gray-300">
                Git Blame is a roommate chore tracker that helps keep everyone accountable in a shared space.
                It’s like <code>git blame</code> — but for dishes, trash, and cleaning!
              </p>
            </div>
          </div>

          {/* Right Card */}
          <div className="card grow bg-transparent border border-info rounded-box p-6 text-center shadow-md backdrop-blur-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Why use it?</h2>
              <p className="text-sm sm:text-base text-gray-300">
                Because tracking chores with points and leaderboards motivates roommates to contribute equally —
                no more freeloaders or arguments. Just transparency and teamwork.
              </p>
            </div>
          </div>
        </div>

        {/*Get Started Button with Tooltip */}
        <div className="mt-20 tooltip tooltip-top tooltip-open" data-tip="">
          <div className="tooltip-content mb-2">
            <div className="animate-bounce text-blue-400 -rotate-10 text-2xl font-black">
              Here
            </div>
          </div>
          <Link to="/signup">
            <button className="btn btn-info text-white text-lg px-6 py-2">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
