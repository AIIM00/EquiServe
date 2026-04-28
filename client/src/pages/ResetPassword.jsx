import React from "react";
//import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  // Navigation hook
  //const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h1 className="text-4xl font-bold text-center mb-3">Reset Password</h1>
        <form>
          <div className="mb-4 flex items-center gap-2 w-full px-5 py-2.5 rounded-full bg-[#333A5c]">
            <input
              type="text"
              placeholder="Code"
              required
              className="bg-transparent outline-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
