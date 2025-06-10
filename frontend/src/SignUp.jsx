import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

async function registerUser(credentials) {
  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data.success;
}

export default function SignUp() {
  const navigate = useNavigate();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = userNameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const confirm = confirmPasswordRef.current.value;

    if (password !== confirm) {
      return window.alert('Passwords do not match');
    }

    try {
      await registerUser({ userName, email, password });
      navigate('/main');
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="w-screen h-screen bg-base-200 flex items-center justify-center">
      <div className="w-[90vw] max-w-md h-[95vh] transform scale-90 sm:scale-100 bg-base-100 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col justify-center">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-info mb-4 sm:mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-sm sm:text-base">
          {/* Username */}
          <div>
            <label className="label">
              <span className="label-text">User Name</span>
            </label>
            <input
              ref={userNameRef}
              name="userName"
              type="text"
              placeholder="Your UserName"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <input
              ref={emailRef}
              name="email"
              type="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              ref={passwordRef}
              name="password"
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              ref={confirmPasswordRef}
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-4">
            <button type="submit" className="btn btn-info w-full text-white">
              Sign Up
            </button>
          </div>
        </form>

        {/* Link to Sign In */}
        <p className="text-xs sm:text-sm text-center mt-4 text-gray-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-info hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}