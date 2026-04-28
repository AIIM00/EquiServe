import React from "react";
import Btn from "../components/Button";

// MUI Imports
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

//ICONS
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

const Login = () => {
  // Navigation hook
  const navigate = useNavigate();
  // Accessing backend URL and login state from context
  const { backendUrl, setIsLoggedIn, getUserData } =
    React.useContext(AppContext);

  // State to toggle between Login and Create Account
  const [state, setState] = React.useState("Create");

  const [role, setRole] = React.useState("");
  // Form data state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === "Create") {
        // Signup logic
        const { data } = await axios.post(
          backendUrl + "/api/auth/register",
          formData,
        );
        toast.success("Account created!");
        setState("Login");
        if (data.success) {
          toast.success(data.message);
          setState("Login");
        } else {
          toast.error(data.message);
        }
      } else {
        // Login logic
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        if (data.success) {
          setIsLoggedIn(true);
          await getUserData();
          navigate("/");
        } else {
          console.log("Hi");
        }
      }
    } catch (err) {
      const message = err.response?.data?.message;
      console.log("ERROR:", err.response?.data);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-200 to-purple-400">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <div className="flex justify-between items-center w-full px-2 mb-10">
          <KeyboardArrowLeftIcon
            sx={{ fontSize: 45 }}
            className="hover:bg-gray-700 rounded-full cursor-pointer transition"
          />
          <HomeFilledIcon
            onClick={() => navigate("/")}
            sx={{ fontSize: 45 }}
            className="p-2 hover:bg-gray-700 rounded-full cursor-pointer transition"
          />{" "}
        </div>

        <h1 className="text-4xl font-bold text-center mb-3">
          {" "}
          {state === "Create" ? "Create Account" : "Login Page"}
        </h1>
        <p className="text-lg text-center mb-8">
          {state === "Login"
            ? "This is the login page. Please implement the login form here."
            : "This is the signup page. Please implement the signup form here."}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Create" && (
            <div className="mb-4 flex items-center gap-2 w-full px-5 py-2.5 rounded-full bg-[#333A5c]">
              <PersonIcon className="w-5 h-5" />
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-2 w-full px-5 py-2.5 rounded-full bg-[#333A5c]">
            <MailIcon className="w-5 h-5" />

            <input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              type="email"
              placeholder="Email"
              required
              className="bg-transparent outline-none "
            />
          </div>
          <div className="mb-4 flex items-center gap-2 w-full px-5 py-2.5 rounded-full bg-[#333A5c]">
            <LockIcon className="w-5 h-5" />
            <input
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none"
            />
          </div>
          {state === "Create" && (
            <div className="flex m-10 gap-4 items-center justify-center">
              <Btn
                type="button"
                onClick={() => {
                  setRole("CRAFTSMAN");
                  setFormData({ ...formData, role: "CRAFTSMAN" });
                }}
                variant={role === "CRAFTSMAN" ? "primary" : "outline"}
              >
                Craftsman
              </Btn>

              <Btn
                type="button"
                onClick={() => {
                  setRole("CUSTOMER");
                  setFormData({ ...formData, role: "CUSTOMER" });
                }}
                variant={role === "CUSTOMER" ? "primary" : "outline"}
              >
                Customer
              </Btn>
            </div>
          )}
          <p
            className="mb-4 text-indigo-500 cursor-pointer"
            onClick={() => navigate("/reset-password")}
          >
            Forgot Password?
          </p>
          <Btn
            type="submit"
            variant="primary"
            className="w-full"
            onClick={() => {
              navigate("/login");
            }}
          >
            {state}
          </Btn>
          <p
            className="mt-4 text-center text-indigo-500 cursor-pointer"
            onClick={() => setState(state === "Create" ? "Login" : "Create")}
          >
            {state === "Create"
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
