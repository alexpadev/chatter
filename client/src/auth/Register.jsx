import React, { useState, useContext } from "react";
import { UserContext } from '../userContext';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Register = () => {
    const API_URL = process.env.API_URL;
    const [creds, setCreds] = useState({ nom:"", cognoms:"", descripcio:"", data_naixement:"", email: "", contrasenya: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function handleRegister() {
        if (creds.contrasenya !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        axios.post(API_URL + '/auth/register', creds)
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
        <div className="flex flex-col items-center justify-center min-h-screen mt-10">
            <div className="border border-gray-300 w-full max-w-xl bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-bold text-blue-500 mb-6">Register</h2>
                <div className="space-y-4">

                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label htmlFor="nom" className="block text-sm text-gray-700 mb-1">
                                Name:
                            </label>
                            <input
                                id="nom"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                onChange={(e) => setCreds({ ...creds, nom: e.target.value })}
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="cognoms" className="block text-sm text-gray-700 mb-1">
                                Surname:
                            </label>
                            <input
                                id="cognoms"
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                onChange={(e) => setCreds({ ...creds, cognoms: e.target.value })}
                            />
                        </div>
                    </div>

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

            
                    <div className="w-1/3">
                        <label htmlFor="data_naixement" className="block text-sm text-gray-700 mb-1">
                            Birth date:
                        </label>
                        <input
                            id="data_naixement"
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            onChange={(e) => setCreds({ ...creds, data_naixement: e.target.value })}
                        />
                    </div>
                  
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label htmlFor="contrasenya" className="block text-sm text-gray-700 mb-1">
                                Password:
                            </label>
                            <input
                                id="contrasenya"
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                onChange={(e) => setCreds({ ...creds, contrasenya: e.target.value })}
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="password2" className="block text-sm text-gray-700 mb-1">
                                Confirm password:
                            </label>
                            <input
                                id="password2"
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleRegister}
                        className="cursor-pointer w-full bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Register
                    </button>
                    <a href="/login" className="text-blue-500 text-sm">
                        Already have an account? Login here.
                    </a>
                </div>
            </div>
        </div>
    );
};
