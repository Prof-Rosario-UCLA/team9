export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="flex w-full max-w-6xl flex-col lg:flex-row items-stretch">
        {/* Left Card - What the app is */}
        <div className="card bg-base-300 rounded-box grid h-64 grow place-items-center p-6 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">What is Git Blame?</h2>
            <p className="text-gray-600">
              Git Blame is a roommate chore tracker that helps keep everyone accountable in a shared space.
              It’s like <code>git blame</code> — but for dishes, trash, and cleaning!
            </p>
          </div>
        </div>

        {/* Info-colored Divider */}
        <div className="divider lg:divider-horizontal divider-info">OR</div>

        {/* Right Card - Why use it */}
        <div className="card bg-base-300 rounded-box grid h-64 grow place-items-center p-6 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Why use it?</h2>
            <p className="text-gray-600">
              Because tracking chores with points and leaderboards motivates roommates to contribute equally —
              no more freeloaders or arguments. Just transparency and teamwork.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
