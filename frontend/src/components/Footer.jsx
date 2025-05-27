import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="my-10 mt-40 text-sm">
      {/* Footer Grid */}
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14">
        {/* Logo & Description */}
        <div>
          <img src={assets.logo} alt="Company Logo" className="mb-5 w-32" />
          <p className="w-full md:w-2/3 text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore
            facere nisi similique?
          </p>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li className="cursor-pointer hover:text-gray-800 transition">
              Home
            </li>
            <li className="cursor-pointer hover:text-gray-800 transition">
              About us
            </li>
            <li className="cursor-pointer hover:text-gray-800 transition">
              Delivery
            </li>
            <li className="cursor-pointer hover:text-gray-800 transition">
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>📞 +94 0707025043</li>
            <li>✉️ mirojan.dev@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10">
        <hr />
        <p className="py-5 text-sm text-center text-gray-500">
          © 2025 Tagcly.com - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
