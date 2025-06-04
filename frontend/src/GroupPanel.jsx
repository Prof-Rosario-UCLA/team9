import { useEffect, useState } from "react";

export default function GroupPanel() {
  const [groupName, setGroupName] = useState("The Clean Dream Team");
  const [members, setMembers] = useState([]);

  // Dummy fetch (replace with real API call)
  useEffect(() => {
    setMembers([
      { name: "Alice", email: "alice@example.com", avatar: "https://img.daisyui.com/images/profile/demo/1@94.webp" },
      { name: "Bob", email: "bob@example.com", avatar: "https://img.daisyui.com/images/profile/demo/2@94.webp" },
      { name: "Charlie", email: "charlie@example.com", avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp" },
      { name: "Diana", email: "diana@example.com", avatar: "https://img.daisyui.com/images/profile/demo/4@94.webp" },
    ]);
  }, []);

  return (
    <div className="max-w-md sm:max-w-lg w-full mx-auto bg-base-100 p-4 sm:p-6 rounded-lg shadow-md border border-base-300 max-h-[80vh] overflow-y-auto text-sm sm:text-base">
      <h2 className="text-info font-bold text-lg sm:text-xl mb-4 text-center">{groupName}</h2>

      <ul className="space-y-3">
        {members.map((member, idx) => (
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
    </div>
  );
}
