import { useEffect, useState } from "react";

export default function GroupPanel() {
  const [activeTab, setActiveTab] = useState("view");
  const [groupName, setGroupName] = useState("The Clean Dream Team");
  const [newGroupName, setNewGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    setMembers([
      { name: "Alice", email: "alice@example.com", avatar: "https://img.daisyui.com/images/profile/demo/1@94.webp" },
      { name: "Bob", email: "bob@example.com", avatar: "https://img.daisyui.com/images/profile/demo/2@94.webp" },
      { name: "Charlie", email: "charlie@example.com", avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp" },
      { name: "Diana", email: "diana@example.com", avatar: "https://img.daisyui.com/images/profile/demo/4@94.webp" },
      { name: "Eve", email: "eve@example.com", avatar: "https://img.daisyui.com/images/profile/demo/5@94.webp" },
      { name: "Frank", email: "frank@example.com", avatar: "https://img.daisyui.com/images/profile/demo/6@94.webp" },
    ]);
  }, []);

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const visibleMembers = members.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

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
      const resp = await fetch("http://localhost:8080/createGroup", {
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

            <button className="btn btn-error btn-sm w-full">Leave Group</button>
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
            <input type="email" placeholder="Enter email..." className="input input-bordered w-full" />
            <button className="btn btn-info">Send Invite</button>
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
