import { useState, useRef } from 'react';
const defaultAvatar = 'https://via.placeholder.com/150';

export default function ProfilePanel() {
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [username, setUsername] = useState('Your Username');
  const [bio, setBio] = useState('This is a short bio.');
  const [contactInfo, setContactInfo] = useState('you@example.com | +1 000 000 0000');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
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
        <button className="btn btn-info text-white">Save Changes</button>
      </div>
    </div>
  );
}
