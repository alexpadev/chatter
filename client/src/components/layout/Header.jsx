import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../userContext';
import axios from 'axios';

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGlobalLogout = async () => {
    try {
      await axios.delete(`${process.env.API_URL}/auth/logout`, {
        headers: { 'Authorization': `JWT ${user.jwt_token}` }
      });
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Global logout error:", error);
      alert("Error during global logout");
    }
  };

  const handleLocalLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-500 mr-2">chatter</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="25"
            height="25"
            viewBox="0 0 256 256"
          >
            <g
              fill="#3b82f6"
              fillRule="nonzero"
              stroke="none"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              strokeDasharray=""
              strokeDashoffset="0"
              fontFamily="none"
              fontWeight="none"
              fontSize="none"
              textAnchor="none"
            >
              <g transform="scale(5.12,5.12)">
                <path d="M25,4c-12.68359,0 -23,8.97266 -23,20c0,6.1875 3.33594,12.06641 8.94922,15.83984c-0.13281,1.05078 -0.66406,3.60156 -2.76562,6.58594l-1.10547,1.56641l1.97656,0.00781c5.42969,0 9.10156,-3.32812 10.30859,-4.60547c1.83203,0.40234 3.72656,0.60547 5.63672,0.60547c12.68359,0 23,-8.97266 23,-20c0,-11.02734 -10.31641,-20 -23,-20z"></path>
              </g>
            </g>
          </svg>
        </div>
        {user && (
          <nav className="ml-6 space-x-6">
              
            <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Home</Link>
            <Link to="/usuaris" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Users</Link>
            <Link to="/bios" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Bios</Link>
            <Link to="/chat/list" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Chat</Link>
            <Link to="/my-bios" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">My Bios</Link>
            <p className="hidden" id="mailUser">{user.email}</p>
          </nav>
        )}
      </div>
      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="mr-5 cursor-pointer flex items-center focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-gray-500 transition-colors">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
            </svg>
          </button>
          {dropdownOpen && (
            <div className="divide-y divide-gray-300 absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
              <div className="text-base px-4 py-2 text-blue-500 font-bold">
                {user.nom} {user.cognoms}
              </div>
              <Link
                to="/profile"
                className="text-sm block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLocalLogout();
                }}
                className="text-sm cursor-pointer w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 transition-colors"
              >
                Sign out (this device)
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleGlobalLogout();
                }}
                className="text-sm cursor-pointer w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 transition-colors"
              >
                Logout All Devices
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
