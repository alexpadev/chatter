import { useState, useContext } from 'react';
import { UserContext } from '../userContext';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const API_URL = process.env.API_URL;
  const { setUser } = useContext(UserContext);
  const [creds, setCreds] = useState({});
  const navigate = useNavigate();

  function handleLogin() {
    axios.post(API_URL + '/auth/login', creds)
      .then(res => {
        console.log("SUCCESS", res.data);
        setUser(res.data);
        navigate("/");

      })
      .catch(err => {
        console.log("ERROR", err);
        const message = err.response?.data?.message || err.message;
        alert(message);
      });
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10 mb-15 min-h-screen">
      <div className="border border-gray-300 w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h2 className="text-xl font-bold text-blue-500 mb-6">Login</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email:
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
              Contrasenya:
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => setCreds({ ...creds, contrasenya: e.target.value })}
            />
          </div>
          <button
            onClick={handleLogin}
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Submit
          </button>
          <a href="/register" className="text-blue-500 text-sm">Don't have an account? Register here.</a>
        </div>
      </div>
    </div>
  );
};
