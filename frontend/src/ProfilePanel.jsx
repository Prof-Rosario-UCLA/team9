import { useState, useRef, useEffect } from "react";
import defaultAvatar from "./assets/defaultpfp.png";

export default function ProfilePanel({ username, setUsername, profilePic, setProfilePic }) {
  const [localUsername, setLocalUsername] = useState(username);
  const [localProfilePic, setLocalProfilePic] = useState(profilePic);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bio, setBio] = useState('This is a short bio.');
  const [contactInfo, setContactInfo] = useState('you@example.com | +1 000 000 0000');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/getProfile", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
          if (res.status === 401 || res.status === 403) {
            navigate("/signin");
            return;
          }
          if (!res.ok) {
            throw new Error("Failed to fetch profile");
          }
          return res.json();
      })
      .then((data) => {
        setLocalUsername(data.user_name || "");
        setBio(data.bio || "");
        setContactInfo(data.contact_info || "");
        if (data.pfp) {
          setLocalProfilePic(`data:${data.pfp_mime};base64,${data.pfp}`);
        } else {
          setLocalProfilePic(defaultAvatar);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfilePic(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    formData.append("user_name", localUsername);
    formData.append("bio", bio);
    formData.append("contact_info", contactInfo);
    if (selectedFile) {
      formData.append("pfp", selectedFile);
    }

    try {
      const res = await fetch("/uploadBio", {
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

      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePic(reader.result); // update parent image
          setUsername(localUsername);   // update parent name
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setUsername(localUsername);     // update parent name
      }
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error while updating profile");
    }
  };

  return (
    <article className="max-w-md w-full mx-auto bg-base-100 p-3 sm:p-4 rounded-lg shadow-md border border-base-300 max-h-[75vh] overflow-y-auto text-[10px] sm:text-xs text-base-content">
      <header>
        <h2 className="text-base sm:text-lg font-bold text-info mb-3">Edit Profile</h2>
      </header>

      <section className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3">
        <figure className="avatar relative">
          <div className="w-16 sm:w-20 rounded-full ring ring-info ring-offset-base-100 ring-offset-2">
          <img src={localProfilePic} alt="Profile picture" />
          </div>
          <button
            className="absolute bottom-0 right-0 btn btn-[8px] sm:btn-xs btn-info min-h-0 h-5 px-2"
            onClick={() => fileInputRef.current.click()}
            aria-label="Edit profile picture"
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
        </figure>

        <section className="text-center sm:text-left">
          <h3 className="font-semibold truncate">{username}</h3>
          <p className="text-[9px] text-base-content/60 break-words">{contactInfo}</p>
        </section>
      </section>

      <section className="mb-3">
        <h4 className="font-semibold text-info mb-1">Bio</h4>
        <p className="break-words">{bio || 'No bio provided yet.'}</p>
      </section>

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <section>
          <label htmlFor="username" className="block mb-1 text-base-content/60">Username</label>
          <input
            id="username"
            type="text"
            className="input input-xs input-bordered w-full"
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
          />
        </section>

        <section>
          <label htmlFor="bio" className="block mb-1 text-base-content/60">Bio</label>
          <input
            id="bio"
            type="text"
            className="input input-xs input-bordered w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </section>

        <section className="sm:col-span-2">
          <label htmlFor="contactInfo" className="block mb-1 text-base-content/60">Contact Info</label>
          <input
            id="contactInfo"
            type="text"
            className="input input-xs input-bordered w-full"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </section>

        <div className="mt-4 sm:col-span-2 flex justify-end">
          <button
            className="btn btn-xs sm:btn-sm btn-info text-white"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </article>
  );
}
