import React, { useRef, useEffect, useContext, useState } from "react";
import { UserContext } from '../../userContext';

function ChatSelf({ setMessages, messages, user, content, setContent, sendMessage }) {
  const [loading, setLoading] = useState(true);
  const { apiInstanceRef } = useContext(UserContext);
  const messagesContainerRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const messagesDB = await apiInstanceRef.current.get(`/chat/messages?to=self`);
      const mensajes = messagesDB.data.map(x => {
        return JSON.stringify({
          type: "chat",
          to: x.to,
          content: x.content,
          from: x.from
        });
      });
      setMessages(mensajes);
    } catch (err) {
      console.error("Error loading self messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg mt-5 bg-yellow-50">
      <h1 className="text-lg font-bold text-orange-600 mb-4">Self Chat</h1>
      <div ref={messagesContainerRef} className="space-y-3 mb-6 max-h-96 overflow-y-auto rounded-md">
        {loading ? (
          <div className="flex items-center justify-center mt-4 mb-4">
            <svg
              className="animate-spin h-10 w-10 text-orange-500"
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
          messages.length > 0 ? (
            messages.map((msg, idx) => {
              let parsed;
              try {
                parsed = JSON.parse(msg);
              } catch (error) {
                parsed = { content: msg, from: "system" };
              }
              return (
                <div key={idx} className="p-3 rounded shadow bg-orange-100">
                  <div className="text-sm text-gray-700 mb-1">You</div>
                  <div className="text-base text-gray-800">{parsed.content}</div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-600">There are no messages.</p>
          )
        )}
      </div>
      <div className="flex items-end space-x-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Write a message"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendMessage("self");
              }
            }}
            className="w-full py-2 px-5 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-orange-400"
          />
        </div>
        <button
          onClick={() => sendMessage("self")}
          className="font-bold cursor-pointer w-17 py-2 px-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatSelf;
