import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { assets } from "../assets/assets";
import Btn from "./Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// MUI Imports
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Avatar from "@mui/material/Avatar";
import { deepPurple } from "@mui/material/colors";

import { toast } from "react-toastify";
// Context
import { AppContext } from "../context/AppContext";
const pages = ["Home", "How It Works", "About Us", "Contact"];

const NavBar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    React.useContext(AppContext);
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setUserData(false);
        setIsLoggedIn(false);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "gray",
        width: "100%",
        height: { xs: "4rem", md: "4rem" },
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Mobile menu */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {" "}
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  {" "}
                  <Typography sx={{ textAlign: "center" }}>
                    {page}
                  </Typography>{" "}
                </MenuItem>
              ))}{" "}
            </Menu>

            {/* Desktop logo */}
            <Box
              component="img"
              src={assets.logo}
              alt="logo"
              sx={{ display: { xs: "none", md: "flex" }, width: 50 }}
            />
          </Box>

          {/* CENTER */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Mobile logo */}
            <Box
              component="img"
              src={assets.logo}
              alt="logo"
              sx={{ display: { xs: "flex", md: "none" }, width: 60 }}
            />

            {/* Desktop pages */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              {pages.map((page) => (
                <Button key={page} sx={{ color: "white" }}>
                  {page}
                </Button>
              ))}
            </Box>
          </Box>

          {/* RIGHT */}
          {userData ? (
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
              <Avatar sx={{ bgcolor: deepPurple[500] }}>
                {userData.name[0].toUpperCase()}
              </Avatar>
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                <ul className="list-none m-0 p-2 bg-gray-100 text-sms">
                  {!userData.isAccountVerified && (
                    <li
                      className="py-1 px-2 hover:bg-gray-200 cursor pointer"
                      onClick={() => {
                        navigate("/email-verify");
                      }}
                    >
                      Verify Email
                    </li>
                  )}

                  <li
                    className="py-1 px-2 hover:bg-gray-200 cursor pointer pr-10"
                    onClick={logout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Btn onClick={() => navigate("/login")}>
              Login
              <ArrowForwardIcon sx={{ ml: 1 }} />
            </Btn>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
