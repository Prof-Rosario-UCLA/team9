import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

async function loginUser(credentials) {
  const res = await fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data.token;
}

export default function SignIn() {
    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async (e) => {
      e.preventDefault();

      const email = emailRef.current.value.trim();
      const password = passwordRef.current.value;

      try {
        const token = await loginUser({ email, password });
        localStorage.setItem('authToken', token);
        navigate('/main');
      } catch (err) {
        window.alert(err.message);
      }
    };

    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-info mb-6">
            Sign In to Git-Blame
          </h2>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                placeholder="something@example.com"
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
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
              />
            </div>
  
            {/* Sign In Button */}
            <div className="pt-4">
              <button type="submit" className="btn btn-info w-full text-white">
                Sign In
              </button>
            </div>
          </form>
  
          {/* Link to Sign Up */}
          <p className="text-sm text-center mt-4 text-gray-500">
            Don't have an account?{" "}
            <a href="/signup" className="text-info hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    );
  }
  