function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-8 border rounded-xl shadow-sm">

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <div className="relative mb-6">
          <input
            className="peer w-full border-b py-2 outline-none"
            placeholder=" "
          />
          <label className="absolute left-0 top-2 text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs transition">
            Email
          </label>
        </div>

        <div className="relative mb-8">
          <input
            type="password"
            className="peer w-full border-b py-2 outline-none"
            placeholder=" "
          />
          <label className="absolute left-0 top-2 text-gray-500 peer-focus:-top-3 peer-focus:text-xs transition">
            Password
          </label>
        </div>

        <button className="w-full bg-primary py-3 rounded-lg font-semibold hover:bg-primaryDark transition">
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;
