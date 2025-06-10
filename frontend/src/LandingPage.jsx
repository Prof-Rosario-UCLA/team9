import { Link } from 'react-router-dom';
import bgImage from './assets/landingpage.jpg';

export default function LandingPage() {
  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10"></div>

      <nav className="w-full px-4 py-4 flex items-center justify-between bg-base-100/20 backdrop-blur-sm rounded-none sm:rounded-xl max-w-screen-xl mx-auto">
        <div className="text-white font-bold text-lg sm:text-xl">
          <span className="text-info">Git-Blame</span>
        </div>
        <Link to="/signin">
          <button className="btn btn-sm btn-outline btn-info">Sign In</button>
        </Link>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-info text-center mt-6 mb-6">
          Welcome to Git-Blame
        </h1>


        <div className="w-full max-w-5xl h-[45vh] sm:h-[50vh] md:h-[55vh] overflow-y-auto bg-base-100/20 backdrop-blur-md border border-info rounded-xl p-4 sm:p-6 shadow-lg mb-8 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">

            <div className="card bg-transparent border border-info rounded-box p-4 sm:p-6 text-center shadow-md flex flex-col justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white">
                What is Git Blame?
              </h2>
              <p className="text-sm sm:text-base text-gray-300">
                Git Blame is a roommate chore tracker that helps keep everyone accountable in a shared space.
                It’s like <code>git blame</code> — but for dishes, trash, and cleaning!
              </p>
            </div>

            <div className="card bg-transparent border border-info rounded-box p-4 sm:p-6 text-center shadow-md flex flex-col justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white">
                Why use it?
              </h2>
              <p className="text-sm sm:text-base text-gray-300">
                Points and leaderboards motivate roommates to contribute — no freeloaders, just teamwork.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 animate-bounce text-blue-400 -rotate-6 text-xl sm:text-2xl font-black">
            Here
          </div>
          <Link to="/signup">
            <button className="btn btn-info text-white text-base sm:text-lg px-6 py-2">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
