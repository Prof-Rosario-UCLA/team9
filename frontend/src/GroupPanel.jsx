import { useEffect, useState } from "react";

export default function GroupPanel() {
  const [activeTab, setActiveTab] = useState("view");
  const [groupName, setGroupName] = useState("The Clean Dream Team");
  const [newGroupName, setNewGroupName] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;
  const isEmulator = window.location.hostname === '10.0.2.2';
  const baseURL = isEmulator ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
  // Handle getting group members
  useEffect(() => {
    if (activeTab !== "view") return;

    const fetchMembers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("No auth token found—cannot load group members.");
        setMembers([]);
        return;
      }

      try {
        const resp = await fetch(`${baseURL}/getGroupMembers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) {
          console.error("Failed to fetch group members:", resp.status);
          setMembers([]);
          return;
        }

        const data = await resp.json();
        // If user is not in a group, we get
        if (!data.inGroup) {
          setMembers([]); 
          return;
        }

        const mapped = data.members.map((m) => {
          let avatar = "";
          if (m.pfp && m.pfp_mime) {
            avatar = `data:${m.pfp_mime};base64,${m.pfp}`;
          }
          return {
            name: m.user_name,
            email: m.email,
            avatar, 
            points: m.points,
          };
        });

        setMembers(mapped);
        setCurrentPage(0);
      } catch (err) {
        console.error("Error while fetching group members:", err);
        setMembers([]);
      }
    };

    fetchMembers();
  }, [activeTab]);

    // Handle leaving group
    const handleLeaveGroup = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Not authenticated. Please log in again.");
      return;
    }

    try {
      const resp = await fetch(`${baseURL}/leaveGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => null);
        const msg = errJson?.error || "Failed to leave group.";
        alert(msg);
        return;
      }

      // Clear group name and members
      setMembers([]);
      setGroupName("");
      alert("You have left the group.");
    } catch (err) {
      console.error("Error while leaving group:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

    // Handles create group request
    const handleCreateGroup = async () => {
      if (!newGroupName.trim()) {
        alert("Please enter a valid group name.");
        return;
    }

     try {

      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Not authenticated. Please sign in again.");
        return;
      }

      // Send POST to /createGroup
      const resp = await fetch(`${baseURL}/createGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (!resp.ok) {
        // JSON error message
        const errJson = await resp.json().catch(() => null);
        const msg = errJson?.error || "Failed to create group.";
        alert(msg);
        return;
      }

      const { group } = await resp.json(); 

      // Update groupName so view tab shows the new group and switch to tab
      setGroupName(group.name);
      setActiveTab("view");

      setNewGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

    // Handles invite request
    const handleInvite = async () => {
    if (!invitedEmail.trim()) {
      alert("Please enter an email to invite.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Not authenticated. Please sign in again.");
        return;
      }

      // Send POST to /inviteUser
      const resp = await fetch(`${baseURL}/inviteUser`,  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invited_user_email: invitedEmail.trim() }),
      });

      if (!resp.ok) {
        // JSON error message
        const errJson = await resp.json().catch(() => null);
        const msg = errJson?.error || "Failed to send invitation.";
        alert(msg);
        return;
      }

      const { invite_id } = await resp.json();
      alert(`Invitation sent successfully! (ID: ${invite_id})`);
      setInvitedEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const visibleMembers = members.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const renderContent = () => {
    switch (activeTab) {
      case "view":
        return (
          <>
            <h2 className="text-info font-bold text-lg sm:text-xl mb-4 text-center">{groupName}</h2>

            <ul className="space-y-3 mb-6">
              {visibleMembers.map((member, idx) => (
                <li key={idx} className="flex items-center gap-3 border-b border-base-300 pb-2">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-info ring-offset-base-100 ring-offset-1">
                      <img src={member.avatar} alt={member.name} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{member.name}</span>
                    <span className="text-xs text-base-content/60">{member.email}</span>
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="join justify-center mb-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <input
                    key={i}
                    className="join-item btn btn-square"
                    type="radio"
                    name="group-pages"
                    aria-label={(i + 1).toString()}
                    checked={currentPage === i}
                    onChange={() => setCurrentPage(i)}
                  />
                ))}
              </div>
            )}

            <button 
            className="btn btn-error btn-sm w-full"
            onClick={handleLeaveGroup}
            >Leave Group</button>
          </>
        );
      case "join":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-info font-bold text-lg sm:text-xl text-center">Join a Group</h2>
            <input type="text" placeholder="Enter invitation code..." className="input input-bordered w-full" />
            <button className="btn btn-info">Join</button>
          </div>
        );
      case "invite":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-info font-bold text-lg sm:text-xl text-center">Invite Members</h2>
            <input
            type="email" 
            placeholder="Enter email..." 
            className="input input-bordered w-full" 
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
            />
            <button className="btn btn-info" onClick={handleInvite}>Send Invite</button>
          </div>
        );
      case "create":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-info font-bold text-lg sm:text-xl text-center">Create a New Group</h2>
            <input
            type="text" 
            placeholder="Group name..." 
            className="input input-bordered w-full" 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            />

            <button 
            className="btn btn-success"
            onClick={handleCreateGroup}
            >Create Group</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md sm:max-w-lg w-full mx-auto bg-base-100 p-4 sm:p-6 rounded-lg shadow-md border border-base-300 text-sm sm:text-base overflow-hidden">
      <div className="tabs justify-center mb-4">
        <a className={`tab tab-bordered ${activeTab === "view" ? "tab-active" : ""}`} onClick={() => setActiveTab("view")}>View</a>
        <a className={`tab tab-bordered ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>Create</a>
        <a className={`tab tab-bordered ${activeTab === "invite" ? "tab-active" : ""}`} onClick={() => setActiveTab("invite")}>Invite</a>
      </div>
      {renderContent()}
    </div>
  );
}
