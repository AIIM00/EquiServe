import React from "react";
import { assets } from "../assets/assets";
import Btn from "./Button";

const Header = () => {
  return (
    <div>
      <img
        src={assets.craftconnect_slogan}
        alt="CraftConnect Slogan"
        className="w-full h-auto mb-6"
      />
      <h1 className="text-4xl font-bold text-center mb-4">
        Welcome to CraftConnect
      </h1>
      <p className="text-lg text-center mb-8">
        Your one-stop platform for all your crafting needs. Connect with local
        artisans, discover unique handmade products, and bring your creative
        projects to life with CraftConnect.
      </p>
      <div className="flex justify-center">
        <Btn text="Explore Now" />
      </div>
    </div>
  );
};

export default Header;
