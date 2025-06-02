import { useState, useRef, useEffect } from "react";
import defaultAvatar from "./assets/defaultpfp.png";

export default function ProfilePanel() {
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState('Your Username');
  const [bio, setBio] = useState('This is a short bio.');
  const [contactInfo, setContactInfo] = useState('you@example.com | +1 000 000 0000');
  const fileInputRef = useRef(null);

  // Fetch the existing profile
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

  // When user picks a new file, store the File object and show preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  // On “Save Changes,” bundle everything into a FormData and POST
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
    <div className="max-w-4xl mx-auto bg-base-100 p-6 rounded-lg shadow-lg border border-base-300">
      <h2 className="text-2xl font-bold text-info mb-6">Edit Profile</h2>

      <div className="flex items-center gap-6 mb-4">
        <div className="avatar relative">
          <div className="w-24 rounded-full ring ring-info ring-offset-base-100 ring-offset-2">
            <img src={profilePic} alt="Profile" />
          </div>
          <button
            className="absolute bottom-0 right-0 btn btn-xs btn-info"
            onClick={() => fileInputRef.current.click()}
          >
            Change
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white">{username}</h3>
          <p className="text-sm text-gray-400">{contactInfo}</p>
        </div>
      </div>

      {/* Bio display section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-info">Bio</h4>
        <p className="text-white">{bio || 'No bio provided yet.'}</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
        <div>
          <label className="block mb-1 text-gray-400">Username</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Bio</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-gray-400">Contact Info</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>
      </form>

      <div className="mt-6 flex justify-end">
        <button
          className="btn btn-info text-white"
          onClick={handleSubmit}
          type="button"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
