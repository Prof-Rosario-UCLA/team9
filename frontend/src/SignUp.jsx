import { Link } from 'react-router-dom';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-info mb-6">
          Create an Account
        </h2>

        <form className="space-y-4">
          {/* UserName */}
          <div>
            <label className="label">
              <span className="label-text">User Name</span>
            </label>
            <input
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
