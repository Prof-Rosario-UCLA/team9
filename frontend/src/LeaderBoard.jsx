import { useState, useEffect } from 'react';
import defaultAvatar from "./assets/defaultpfp.png";

export default function StatisticsPanel() {
  const USERS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [inGroup, setInGroup] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const resp = await fetch('/groupLeaderboard', {
          credentials: 'include'
        });

        if (resp.status === 401 || resp.status === 403) {
          setInGroup(false);
          return;
        }
        const data = await resp.json();
        if (!resp.ok || data.inGroup === false) {
          setInGroup(false);
        } else {
          setUsers(data.leaderboard);
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setInGroup(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (!inGroup) {
    return (
      <section className="w-full flex justify-center items-center p-4">
        <p className="text-center text-sm text-base-content/70">
          You are not in a group yet. Join or create one to see the leaderboard.
        </p>
      </section>
    );
  }

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <section
      aria-label="Group Leaderboard"
      className="w-full flex justify-center items-center p-1 sm:p-3 overflow-hidden"
    >
      <article className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl bg-base-100 rounded-box shadow-md flex flex-col h-full sm:max-h-[90vh] border border-base-300">

        {/* Leaderboard Header */}
        <header className="px-2 py-2 text-[10px] sm:text-xs opacity-60 tracking-wide border-b border-base-300 text-center">
          Group Leaderboard - By Points
        </header>

        {/* User List */}
        <ul className="flex-1 overflow-y-auto divide-y divide-base-300" role="list">
          {paginatedUsers.map((user, index) => {
            const rank = (currentPage - 1) * USERS_PER_PAGE + index + 1;
            const avatarSrc = user.pfp ? `data:${user.pfp_mime};base64,${user.pfp}` : defaultAvatar;

            return (
              <li
                key={user.user_id}
                className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-2 text-[9px] sm:text-xs"
                role="listitem"
              >
                <img
                  className="w-6 h-6 sm:w-8 sm:h-8 min-w-6 rounded-full"
                  src={avatarSrc}
                  alt={`${user.user_name}'s profile picture`}
                />
                <div className="flex-grow overflow-hidden">
                  <div className="font-semibold truncate">{user.user_name}</div>
                  <div className="text-[9px] sm:text-xs opacity-60 break-words leading-tight">
                    Points: {user.points}
                  </div>
                </div>
                <div className="text-[9px] sm:text-xs font-mono text-base-content/60">
                  #{rank}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pagination */}
        <nav
          className="px-2 py-2 border-t border-base-300 flex justify-center flex-wrap gap-1"
          role="navigation"
          aria-label="Leaderboard Pagination"
        >
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
        </nav>
      </article>
    </section>
  );
}
