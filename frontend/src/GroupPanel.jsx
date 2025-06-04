import { useEffect, useState } from "react";

export default function GroupPanel() {
  const [activeTab, setActiveTab] = useState("view");
  const [groupName, setGroupName] = useState("The Clean Dream Team");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setMembers([
      { name: "Alice", email: "alice@example.com", avatar: "https://img.daisyui.com/images/profile/demo/1@94.webp" },
      { name: "Bob", email: "bob@example.com", avatar: "https://img.daisyui.com/images/profile/demo/2@94.webp" },
      { name: "Charlie", email: "charlie@example.com", avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp" },
      { name: "Diana", email: "diana@example.com", avatar: "https://img.daisyui.com/images/profile/demo/4@94.webp" },
    ]);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "view":
        return (
          <>
            <h2 className="text-info font-bold text-lg sm:text-xl mb-3 text-center">{groupName}</h2>
            <ul className="space-y-2 mb-4">
              {members.slice(0, 3).map((member, idx) => (
                <li key={idx} className="flex items-center gap-3 border-b border-base-300 pb-1">
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
            <input type="text" placeholder="Group name..." className="input input-bordered w-full" />
            <textarea placeholder="Description..." className="textarea textarea-bordered w-full" />
            <button className="btn btn-success">Create Group</button>
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
        <a className={`tab tab-bordered ${activeTab === "join" ? "tab-active" : ""}`} onClick={() => setActiveTab("join")}>Join</a>
        <a className={`tab tab-bordered ${activeTab === "invite" ? "tab-active" : ""}`} onClick={() => setActiveTab("invite")}>Invite</a>
        <a className={`tab tab-bordered ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>Create</a>
      </div>
      {renderContent()}
    </div>
  );
}
