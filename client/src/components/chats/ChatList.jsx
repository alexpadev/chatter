import React, { useEffect, useState, useContext, useTransition } from "react";
import { Link } from "react-router-dom";
import { UserContext } from '../../userContext';
import Chats from './Chats';

function ChatList({ user }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { apiInstanceRef } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await apiInstanceRef.current.get("/chat/online");
      startTransition(() => {
        setChats(res.data.clients || []);
      });
    } catch (err) {
      console.log("ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const onlineUsers = chats.filter(chat => chat !== user.email);
  const count = onlineUsers.length;

  const filteredChats = onlineUsers.filter(chat => 
    searchQuery.trim() === "" || 
    chat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Chats inline searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="border border-gray-300 mt-5 max-w-2xl mx-auto p-6 rounded-lg shadow-sm min-h-screen">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-blue-500 divide-gray-300">
            Online users - {count}
          </h1>
          <div className="flex gap-2">
            <Link 
              to={`/chat/group`} 
              className="border border-green-700 px-3 py-1 text-sm text-green-700 flex items-center rounded-full hover:bg-green-100 transition"
            >
              Group
              
            </Link>
            <Link 
              to={`/chat/gemini`} 
              className="border border-indigo-500 px-3 py-1 text-sm text-indigo-500 flex items-center rounded-full hover:bg-indigo-100 transition"
            >
              Gemini
              
            </Link>
            <Link 
              to={`/chat/self`} 
              className="border border-orange-400 px-3 py-1 text-sm text-orange-600 flex items-center rounded-full hover:bg-orange-100 transition"
            >
              Self
             
            </Link>
          </div>
        </div>
      {loading || isPending ? (
        <div className="flex items-center justify-center mt-16 mb-16">
          <svg
            className="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      ) : (
        <>
          
          {filteredChats.length > 0 ? (
            <ul className="divide-y divide-gray-300">
              {filteredChats.map((chat, index) => (
                <li key={index} className="py-3">
                  <div className="hover:bg-gray-100 p-4 rounded-full transition flex items-center justify-between">
                    <Link 
                      to={`/chat/${chat}`} 
                      className="px-2 text-gray-600 flex items-center"
                    >
                      <span>{chat}</span>
                      <svg 
                        className="ml-3 mt-1" 
                        width="15" 
                        height="15" 
                        viewBox="0 0 10 10" 
                        fill="#39c600" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="5" cy="5" r="5" />
                      </svg>
                    </Link>
                    <button className="bg-gray-400 rounded-full p-2">
                      <Link to={`/chat/${chat}`} className="text-gray-500 transition">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="20"
                          height="20"
                          viewBox="0 0 256 256"
                        >
                          <g fill="#ffffff">
                            <g transform="scale(5.12,5.12)">
                              <path d="M25,4c-12.68359,0 -23,8.97266 -23,20c0,6.1875 3.33594,12.06641 8.94922,15.83984c-0.13281,1.05078 -0.66406,3.60156 -2.76562,6.58594l-1.10547,1.56641l1.97656,0.00781c5.42969,0 9.10156,-3.32812 10.30859,-4.60547c1.83203,0.40234 3.72656,0.60547 5.63672,0.60547c12.68359,0 23,-8.97266 23,-20c0,-11.02734 -10.31641,-20 -23,-20z"></path>
                            </g>
                          </g>
                        </svg>
                      </Link>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-1 mt-3 text-gray-600">No active users.</p>
          )}
        </>
      )}
    </div>

    </div>
    
  );
}

export default ChatList;
