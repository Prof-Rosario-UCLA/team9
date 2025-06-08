import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

async function registerUser(credentials) {
  const res = await fetch('http://localhost:8080/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data.sucess;
}

export default function SignUp() {
  const navigate = useNavigate();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleSubmit = async e => {
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-info mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UserName */}
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

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" className="btn btn-info w-full text-white">
              Sign Up
            </button>
          </div>
        </form>

        {/* Link to Sign In */}
        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/signin" className="text-info hover:underline text-sm">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
