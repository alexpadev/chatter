import React, { useContext, useState, useEffect } from "react";
import { UserContext } from '../userContext';

export const Profile = ({ user, setUser }) => {
  const { apiInstanceRef } = useContext(UserContext);
  const [name, setName] = useState(user.nom);
  const [surname, setSurname] = useState(user.cognoms);
  const [email, setEmail] = useState(user.email);
  const [description, setDescription] = useState(user.descripcio);
  const [birthDate, setBirthDate] = useState(user.data_naixement);
  const [languages, setLanguages] = useState(user.idiomes);
  const [kissCount, setKissCount] = useState(0);
  const [kissEmails, setKissEmails] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadKisses = async () => {
      try {
        const res = await apiInstanceRef.current.get(`/kiss/user/${user.email}`);
        setKissCount(res.data.count);
        setKissEmails(res.data.fromEmails);
      } catch (err) {
        console.log("Error loading kisses", err);
      }
    };
    loadKisses();
  }, [user.email]);

  const update_profile = async () => {
    const updatedData = {
      nom: name,
      cognoms: surname,
      email: email,
      descripcio: description,
      data_naixement: birthDate,
      idiomes: typeof languages === "string"
        ? languages.trim().split(",").map(l => l.trim())
        : languages,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      jwt_token: user.jwt_token
    };

    try {
      const res = await apiInstanceRef.current.put(`/usuaris/${user.id}`, updatedData);
      console.log("SUCCESS", res.data);
      alert("Profile updated successfully");
      setUser(updatedData)
    } catch (err) {
      console.log("ERROR", err);
      const message = err.response?.data?.message || err.message;
      alert(message);
      console.log("data", updatedData)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mt-10 px-4">
      <div className="border border-gray-300 w-full max-w-xl bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-500">Profile</h2>
        <button
          onClick={() => setShowPopup(true)}
          className="font-bold text-pink-500 cursor-pointer hover:text-pink-800 transition-colors"
        >
          <span className="mr-0.5">{kissCount}</span> Kissers 
        </button>
      </div>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="nom" className="block text-gray-700 text-sm font-medium mb-1">
                Name
              </label>
              <input 
                id="nom" 
                type="text" 
                name="nom" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="cognoms" className="block text-gray-700 text-sm font-medium mb-1">
                Surname
              </label>
              <input 
                id="cognoms" 
                type="text" 
                name="cognoms" 
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input 
              id="email" 
              type="text" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="descripcio" className="block text-gray-700 text-sm font-medium mb-1">
              Description
            </label>
            <textarea 
              id="descripcio" 
              type="text" 
              name="descripcio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <div className="w-1/3">
              <label htmlFor="data_naixement" className="block text-gray-700 text-sm font-medium mb-1">
                Birth Date
              </label>
              <input 
                id="data_naixement" 
                type="date" 
                name="data_naixement"
                value={new Date(birthDate).toLocaleDateString('en-CA')}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/1">
              <label htmlFor="idiomes" className="block text-gray-700 text-sm font-medium mb-1">
                Languages
              </label>
              <input 
                id="idiomes" 
                type="text" 
                name="idiomes" 
                value={Array.isArray(languages) ? languages.join(", ") : languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-right">
            <a href="/password" className="text-blue-500 text-sm underline">
              Change password
            </a>
          </div>
          <button 
            onClick={update_profile}
            className="cursor-pointer font-bold w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
          >
            Save changes
          </button>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div 
                className="absolute inset-0 bg-black opacity-50"
                onClick={() => setShowPopup(false)}
              ></div>
              <div className="bg-white p-6 rounded-md shadow-lg z-50 w-96 relative">
                <button 
                  onClick={() => setShowPopup(false)}
                  className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl transition cursor-pointer font-bold"
                >
                  &times;
                </button>
                <h1 className="text-xl text-blue-500 font-bold mb-4">Kissers:</h1>
                <ul className="list-disc max-h-60 overflow-y-auto space-y-2">
                  {kissEmails.map((email, index) => (
                    <li key={index} className="text-gray-700">{email}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
