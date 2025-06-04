import { useState, useEffect } from "react";

export default function InboxPanel() {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // Sample data — replace with real fetch later
    const sampleNotices = Array.from({ length: 23 }, (_, i) => ({
      group: `Group ${i + 1}`,
    }));
    setNotices(sampleNotices);
  }, []);

  const totalPages = Math.ceil(notices.length / ITEMS_PER_PAGE);
  const currentNotices = notices.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-xl mx-auto bg-base-100 p-4 sm:p-6 rounded-lg shadow-md border border-base-300">
      <h2 className="text-info font-bold text-lg sm:text-xl text-center mb-4">Inbox</h2>

      <ul className="space-y-3">
        {currentNotices.map((notice, idx) => (
          <li key={idx} className="flex justify-between items-center border-b border-base-300 pb-2">
            <div className="text-sm sm:text-base">
              You've been invited by <span className="font-semibold">{notice.group}</span>
            </div>
            <button className="btn btn-sm btn-outline btn-info">Accept</button>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="join justify-center mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <input
              key={i}
              className="join-item btn btn-square"
              type="radio"
              name="inbox-pages"
              aria-label={(i + 1).toString()}
              checked={page === i}
              onChange={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
