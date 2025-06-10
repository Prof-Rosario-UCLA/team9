import { useState, useEffect } from "react";

export default function InboxPanel() {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

    const fetchInvitations = async () => {
      try {
        const resp = await fetch("/getInvitations", {
          method: "GET",
          credentials: "include",
      });

        if (!resp.ok) {
          console.error("Failed to fetch invitations:", resp.status);
          return;
        }

        const data = await resp.json();
        setNotices(data.invitations || []);
      } catch (err) {
        console.error("Error while fetching invitations:", err);
      }
    };

  useEffect(() => {
    fetchInvitations();
  }, []); 

    const handleAccept = async (groupId) => {
    try {
      const resp = await fetch("/acceptInvite", {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_id: groupId }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => null);
        const msg = errJson?.error || "Failed to accept invitation.";
        alert(msg);
        return;
      }

      // Re-fetch invitations
      await fetchInvitations();
      alert("Invitation accepted! You have joined the group.");
    } catch (err) {
      console.error("Error while accepting invitation:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const totalPages = Math.ceil(notices.length / ITEMS_PER_PAGE);
  const currentNotices = notices.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-xl mx-auto bg-base-100 p-4 sm:p-6 rounded-lg shadow-md border border-base-300">
      <h2 className="text-info font-bold text-lg sm:text-xl text-center mb-4">Inbox</h2>

      <ul className="space-y-3">
        {currentNotices.map((notice) => (
          <li 
          key={notice.invite_id} 
          className="flex justify-between items-center border-b border-base-300 pb-2"
          >
            <div className="text-sm sm:text-base">
              You’ve been invited to{" "}
              <span className="font-semibold">{notice.group_name}</span> by{" "}
              <span className="font-semibold">{notice.invited_by_name}</span>
            </div>
            <button 
            className="btn btn-sm btn-outline btn-info"
            onClick={() => handleAccept(notice.group_id)}
            >Accept</button>
          </li>
        ))}

        {notices.length === 0 && (
          <li className="text-center text-sm text-base-content/60">
            You have no pending invitations.
          </li>
        )}
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
