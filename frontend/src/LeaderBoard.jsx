import { useState } from 'react';

export default function StatisticsPanel() {
  const USERS_PER_PAGE = 5;
  const TOTAL_USERS = 40;
  const [currentPage, setCurrentPage] = useState(1);

  const users = [];
  for (let i = 1; i <= TOTAL_USERS; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      avatar: `https://img.daisyui.com/images/profile/demo/${(i % 5) + 1}@94.webp`,
      likes: Math.floor(Math.random() * 100),
      tasksCompleted: Math.floor(Math.random() * 50),
      tasksFailed: Math.floor(Math.random() * 20),
    });
  }

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <div className="w-full flex justify-center items-center p-1 sm:p-3 overflow-hidden">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl bg-base-100 rounded-box shadow-md flex flex-col h-full sm:max-h-[90vh] border border-base-300">

        {/* Header */}
        <div className="px-2 py-2 text-[10px] sm:text-xs opacity-60 tracking-wide border-b border-base-300 text-center">
          Leaderboard — Chore Completion Stats
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap justify-center gap-2 px-2 py-2 border-b border-base-300 text-[9px] sm:text-xs">
          <button className="btn btn-xs btn-outline btn-info">Sort by Likes</button>
          <button className="btn btn-xs btn-outline btn-info">Sort by Completed</button>
          <button className="btn btn-xs btn-outline btn-info">Sort by Ratio</button>
        </div>

        {/* Scrollable list */}
        <ul className="flex-1 overflow-y-auto divide-y divide-base-300">
          {paginatedUsers.map((user, index) => {
            const total = user.tasksCompleted + user.tasksFailed;
            const ratio = total > 0 ? `${Math.round((user.tasksCompleted / total) * 100)}%` : 'N/A';

            return (
              <li
                key={user.id}
                className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-2 text-[9px] sm:text-xs"
              >
                <img
                  className="w-6 h-6 sm:w-8 sm:h-8 min-w-6 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className="flex-grow overflow-hidden">
                  <div className="font-semibold truncate">{user.name}</div>
                  <div className="text-[9px] sm:text-xs opacity-60 break-words leading-tight">
                    Likes: {user.likes} | Completed: {user.tasksCompleted} | Failed: {user.tasksFailed} | Success Rate: {ratio}
                  </div>
                </div>
                <div className="text-[9px] sm:text-xs font-mono text-base-content/60">
                  #{(currentPage - 1) * USERS_PER_PAGE + index + 1}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pagination Controls */}
        <div className="px-2 py-2 border-t border-base-300 flex justify-center flex-wrap gap-1">
          <div className="join">
            {Array.from({ length: totalPages }).map((_, i) => (
              <input
                key={i}
                className="join-item btn btn-square btn-[22px] sm:btn-xs text-[9px] sm:text-xs"
                type="radio"
                name="page"
                aria-label={`${i + 1}`}
                checked={currentPage === i + 1}
                onChange={() => setCurrentPage(i + 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
