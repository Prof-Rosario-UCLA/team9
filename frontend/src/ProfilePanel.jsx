import { useState, useRef, useEffect } from "react";
import defaultAvatar from "./assets/defaultpfp.png";

export default function ProfilePanel() {
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState('Your Username');
  const [bio, setBio] = useState('This is a short bio.');
  const [contactInfo, setContactInfo] = useState('you@example.com | +1 000 000 0000');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch("http://localhost:8080/getProfile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        setUsername(data.user_name || "");
        setBio(data.bio || "");
        setContactInfo(data.contact_info || "");
        if (data.pfp) {
          setProfilePic(`data:${data.pfp_mime};base64,${data.pfp}`);
        } else {
          setProfilePic(defaultAvatar);
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
      });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    formData.append("user_name", username);
    formData.append("bio", bio);
    formData.append("contact_info", contactInfo);
    if (selectedFile) {
      formData.append("pfp", selectedFile);
    }

    try {
      const res = await fetch("http://localhost:8080/uploadBio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to update:", err);
        alert("Failed to update profile");
        return;
      }

      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error while updating profile");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-base-100 p-3 sm:p-4 rounded-lg shadow-md border border-base-300 max-h-[75vh] overflow-y-auto text-[10px] sm:text-xs">
      <h2 className="text-base sm:text-lg font-bold text-info mb-3">Edit Profile</h2>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3">
        <div className="avatar relative">
          <div className="w-16 sm:w-20 rounded-full ring ring-info ring-offset-base-100 ring-offset-2">
            <img src={profilePic} alt="Profile" />
          </div>
          <button
            className="absolute bottom-0 right-0 btn btn-[8px] sm:btn-xs btn-info min-h-0 h-5 px-2"
            onClick={() => fileInputRef.current.click()}
          >
            Edit
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-white truncate">{username}</h3>
          <p className="text-[9px] text-gray-400 break-words">{contactInfo}</p>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-info mb-1">Bio</h4>
        <p className="text-white break-words">{bio || 'No bio provided yet.'}</p>
      </div>

      <form className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white">
        <div>
          <label className="block mb-1 text-gray-400">Username</label>
          <input
            type="text"
            className="input input-xs input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Bio</label>
          <input
            type="text"
            className="input input-xs input-bordered w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 text-gray-400">Contact Info</label>
          <input
            type="text"
            className="input input-xs input-bordered w-full"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>
      </form>

      <div className="mt-4 flex justify-end">
        <button
          className="btn btn-xs sm:btn-sm btn-info text-white"
          onClick={handleSubmit}
          type="button"
        >
          Save
        </button>
      </div>
    </div>
  );
}
