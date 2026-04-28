import React from "react";
import { useNavigate } from "react-router-dom";
import Btn from "../components/Button";

const EmailVerify = () => {
  // Navigation hook
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-200 to-purple-400">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h1 className="text-4xl font-bold text-center mb-3">Verify Email</h1>
        <Btn
          type="submit"
          variant="primary"
          className="w-full"
          onClick={() => {
            navigate("/");
          }}
        >
          Verify
        </Btn>
      </div>
    </div>
  );
};

export default EmailVerify;
