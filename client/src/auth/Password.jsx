import React, { useState, useContext } from "react";
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';

export const Password = () => {
  const { apiInstanceRef } = useContext(UserContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if(newPassword !== confirmNewPassword) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    try {
      const res = await apiInstanceRef.current.post("/auth/password", {
        contrasenya: currentPassword,
        new_contrasenya: newPassword,
      });
      setSuccess(res.data.message);
        navigate("/profile");
    } catch(err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="border border-gray-300 w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-500 mb-6">Change password</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-gray-700 text-sm mb-2">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 text-sm mb-2">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm mb-2">
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button 
            type="submit"
            className="font-bold cursor-pointer w-full bg-blue-500 hover:bg-blue-800 text-white py-2 rounded transition-colors"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
};
