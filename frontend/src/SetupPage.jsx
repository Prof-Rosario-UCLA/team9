import { useState } from 'react';
import furinaPic from './assets/furina.jpg';
import backgroundImg from './assets/landingpage.jpg';
import { useNavigate } from 'react-router-dom';

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fieldFocus, setFieldFocus] = useState(0);

  const [profilePic, setProfilePic] = useState(null);
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const [groupMode, setGroupMode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupFocus, setGroupFocus] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [addedUsers, setAddedUsers] = useState([]);
  const navigate = useNavigate();

  const tutorialFinished = fieldFocus > 2;
  const groupTutorialFinished = groupFocus > 2;

  const stepLabels = [
    'Profile Setup',
    'Create Group',
    'Invite Members',
    'Finish',
  ];

  const handlePicChange = (e) => {
    if (!tutorialFinished) return;
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const getProfileChat = () => {
    if (fieldFocus === 0) return 'Let’s start by uploading a profile picture. Choose one that represents you!';
    if (fieldFocus === 1) return 'Great! Now write a short description about yourself for your roommates.';
    if (fieldFocus === 2) return 'Lastly, enter your contact info. This could be your email, or Discord.';
    return '';
  };

  const getGroupChat = () => {
    if (groupFocus === 0) return 'Now you need to either create or join a group.';
    if (groupFocus === 1) return 'If you create a group, you’ll set its name and description.';
    if (groupFocus === 2) return 'If you want to join a group, your roommate must invite you later, so keep a eye out in the inbox.';
    return '';
  };

  const handleProfileContinue = () => {
    if (fieldFocus < 3) setFieldFocus((prev) => prev + 1);
  };

  const handleGroupContinue = () => {
    if (groupFocus < 3) setGroupFocus((prev) => prev + 1);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (fieldFocus < 3) return;
    setCurrentStep((prev) => prev + 1);
    setFieldFocus(0);
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    const skipInviteStep = groupMode === 'join';
    setCurrentStep((prev) => prev + (skipInviteStep ? 2 : 1));
    setGroupFocus(0);
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-between px-4 py-6 relative"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10" />
      <ul className="steps steps-horizontal flex-wrap justify-center gap-2 w-full max-w-5xl mb-4 px-2">
        {stepLabels.map((label, i) => (
          <li key={label} className={`step text-center ${i <= currentStep ? 'step-primary' : ''}`}>
            <span className="text-xs sm:text-sm">{label}</span>
          </li>
        ))}
      </ul>

      {currentStep === 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-center flex-1 gap-10 w-full max-w-6xl px-4 lg:px-0 overflow-hidden">
          <div className="bg-base-100 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md space-y-6 z-10">
            <h2 className="text-2xl font-bold text-info text-center">Set Up Your Profile</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className={`form-control w-full ${fieldFocus === 0 ? 'ring ring-info rounded-lg p-2' : ''}`}>
                <label className="label mb-1 text-white">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicChange}
                  className="file-input file-input-bordered w-full"
                  disabled={!tutorialFinished}
                />
                {profilePic && (
                  <div className="flex justify-center mt-4">
                    <img
                      src={profilePic}
                      alt="Preview"
                      className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover ring-2 ring-info"
                    />
                  </div>
                )}
              </div>
              <div className={`form-control w-full ${fieldFocus === 1 ? 'ring ring-info rounded-lg p-2' : ''}`}>
                <label className="label mb-1 text-white">Short Bio / Description</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Tell your roommates about yourself..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!tutorialFinished}
                />
              </div>
              <div className={`form-control w-full ${fieldFocus === 2 ? 'ring ring-info rounded-lg p-2' : ''}`}>
                <label className="label mb-1 text-white">Contact Info</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Email, phone, or Discord..."
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  disabled={!tutorialFinished}
                />
              </div>
              <button type="submit" className="btn btn-info w-full text-white" disabled={!tutorialFinished}>
                Continue to Next Step
              </button>
            </form>
          </div>
          {profilePic && (
            <div className="bg-base-100 p-4 rounded-lg shadow w-full max-w-sm text-center">
              <h3 className="text-white font-semibold mb-3">Preview</h3>
              <div className="flex flex-col items-center">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-info ring-offset-base-100 ring-offset-2">
                    <img src={profilePic} alt="Profile preview" />
                  </div>
                </div>
                <p className="text-sm text-white mt-3 italic">This is how your profile will appear to others.</p>
              </div>
            </div>
          )}
          {fieldFocus < 3 && (
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50 max-w-[320px]">
              <div className="bg-base-100 p-4 rounded-xl shadow-md text-sm leading-relaxed text-white">
                {getProfileChat()}
                <div
                  onClick={handleProfileContinue}
                  className="mt-3 text-info font-semibold cursor-pointer hover:underline text-right"
                >
                  Click to continue →
                </div>
              </div>
              <div className="avatar animate-bounce">
                <div className="w-20 rounded-full ring-2 ring-info ring-offset-base-100 ring-offset-2">
                  <img src={furinaPic} alt="Furina Guide" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 max-w-md mx-auto">
          <form onSubmit={handleGroupSubmit} className="bg-base-100 p-6 sm:p-8 rounded-lg shadow-md w-full space-y-6">
            <h2 className="text-2xl font-bold text-info text-center">Create or Join a Group</h2>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer flex items-center gap-3">
                <input
                  type="radio"
                  name="groupMode"
                  value="create"
                  className="radio radio-info"
                  checked={groupMode === 'create'}
                  onChange={() => setGroupMode('create')}
                  disabled={!groupTutorialFinished}
                />
                <span className="text-white">Create a new group</span>
              </label>
              <label className="cursor-pointer flex items-center gap-3">
                <input
                  type="radio"
                  name="groupMode"
                  value="join"
                  className="radio radio-info"
                  checked={groupMode === 'join'}
                  onChange={() => setGroupMode('join')}
                  disabled={!groupTutorialFinished}
                />
                <span className="text-white">Join a group (invitation only)</span>
              </label>
            </div>
            {groupMode === 'create' && (
              <>
                <div className="form-control mt-2">
                  <label className="label text-white">Group Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="form-control mt-2">
                  <label className="label text-white">Group Description</label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="e.g. Apartment 4B chores team"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                  />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-info w-full text-white" disabled={!groupTutorialFinished}>
              Continue
            </button>
          </form>
          {groupFocus < 3 && (
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50 max-w-[320px]">
              <div className="bg-base-100 p-4 rounded-xl shadow-md text-sm leading-relaxed text-white">
                {getGroupChat()}
                <div
                  onClick={handleGroupContinue}
                  className="mt-3 text-info font-semibold cursor-pointer hover:underline text-right"
                >
                  Click to continue →
                </div>
              </div>
              <div className="avatar animate-bounce">
                <div className="w-20 rounded-full ring-2 ring-info ring-offset-base-100 ring-offset-2">
                  <img src={furinaPic} alt="Furina Guide" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 max-w-md mx-auto">
          <div className="bg-base-100 p-6 sm:p-8 rounded-lg shadow-md w-full space-y-6">
            <h2 className="text-2xl font-bold text-info text-center">Invite Members</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="form-control">
                <label className="label text-white">Search Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter a username"
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-info text-white"
                    onClick={() => {
                      const trimmed = searchQuery.trim();
                      if (trimmed && !addedUsers.includes(trimmed)) {
                        setAddedUsers([...addedUsers, trimmed]);
                        setSearchQuery('');
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              {addedUsers.length > 0 && (
                <div className="bg-base-200 p-3 rounded-lg shadow-inner">
                  <h3 className="text-white font-semibold mb-2">Preview List</h3>
                  <ul className="list-disc pl-5 text-white text-sm space-y-1">
                    {addedUsers.map((user, index) => (
                      <li key={index}>{user}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                className="btn btn-success w-full text-white"
                onClick={() => {
                  if (addedUsers.length > 0) {
                    alert(`Invitations sent to: ${addedUsers.join(', ')}`);
                    setAddedUsers([]);
                    setCurrentStep(3);
                  } else {
                    alert('Add users before inviting.');
                  }
                }}
              >
                Send Invites
              </button>
              <button
                type="button"
                className="btn btn-ghost w-full text-info"
                onClick={() => setCurrentStep(3)}
              >
                Skip & Finish Later
              </button>
            </form>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4 max-w-md mx-auto">
          <div className="bg-base-100 p-6 sm:p-8 rounded-lg shadow-md w-full text-center space-y-6">
            <h2 className="text-2xl font-bold text-info">Setup Complete</h2>
            <p className="text-white text-sm">
              You're all set! Click the button below to go to your main dashboard.
            </p>
            <button
              className="btn btn-primary w-full text-white"
              onClick={() => {
                localStorage.setItem('setupComplete', 'true');
                navigate('/main');
              }}
            >
              Finish Setup
            </button>
          </div>
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50 max-w-[320px]">
            <div className="bg-base-100 p-4 rounded-xl shadow-md text-sm leading-relaxed text-white">
              You're done! Welcome to Git-Blame.
            </div>
            <div className="avatar animate-bounce">
              <div className="w-20 rounded-full ring-2 ring-info ring-offset-base-100 ring-offset-2">
                <img src={furinaPic} alt="Furina Guide" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
