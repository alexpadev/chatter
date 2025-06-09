import React, { useRef, useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from '../../userContext';
import MessageFilter from './MessageFilter';

function ChatSpecific({ setMessages, messages, user, clientId, content, setContent, sendMessage }) {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const messagesContainerRef = useRef(null);
  const { apiInstanceRef } = useContext(UserContext);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      let endpoint;
      if (id === "group") {
        endpoint = `/chat/messages?to=group`;
      } else if (id === "gemini") {
        endpoint = `/chat/messages?to=gemini`;
      } else {
        endpoint = `/chat/messages?user1=${user.email}&user2=${id}`;
      }
      const messagesDB = await apiInstanceRef.current.get(endpoint);
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
      console.log("ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const groupMessages = (messagesArray) => {
    const groups = [];
    let currentGroup = null;

    messagesArray.forEach((messageString) => {
      let parsed;
      try {
        parsed = JSON.parse(messageString);
      } catch (error) {
        parsed = { content: messageString, from: "system" };
      }

      if (currentGroup && currentGroup.from === parsed.from) {
        currentGroup.contents.push(parsed.content);
      } else {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          from: parsed.from,
          to: parsed.to,
          contents: [parsed.content]
        };
      }
    });
    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const filteredMessages = searchQuery 
    ? messages.filter(message => {
        let parsed;
        try {
          parsed = JSON.parse(message);
        } catch (error) {
          parsed = { content: message };
        }
        return parsed.content?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : messages;

  const groupedMessages = groupMessages(filteredMessages);

  const renderMessageGroup = (group, index) => {
    const clientEmail = document.getElementById("mailUser")?.textContent;
    const isFromClient = clientEmail === group.from;
  
    const highlightText = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, idx) =>
        regex.test(part) ? <strong className="bg-yellow-300" key={idx}>{part}</strong> : part
      );
    };

    return (
      <div 
        key={index} 
        className={`p-3 rounded shadow ${isFromClient ? 'bg-blue-100 ml-30 px-5' : 'bg-blue-50 mr-30 px-5'} mb-2`}
      >
        <div className="text-sm text-gray-600 mb-1">
          {group.from ? `From: ${group.from}` : "System"}
          {(group.to && group.to != "group") && <span className="ml-2">| To: ${group.to}</span>}
        </div>
        {group.contents.map((messageContent, idx) => (
          <div key={idx} className="text-base text-gray-800">
            {highlightText(messageContent, searchQuery)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg mt-5">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-gray-500">
          {id === "group" ? "Group Chat" : `Chat with ${id}`}
        </h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className="cursor-pointer rounded-full bg-blue-500 hover:bg-blue-800 transition text-white px-2 py-2 font-bold"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 50 50" 
              fill="currentColor"
            >
              <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"></path>
            </svg>
          </button>
          {showFilter && (
            <MessageFilter inline searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}
        </div>
      </div>

      <div ref={messagesContainerRef} className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center mt-4 mb-4">
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
          groupedMessages.length > 0 ? (
            groupedMessages.map((group, index) => renderMessageGroup(group, index))
          ) : (
            <p className="text-gray-600">No messages found.</p>
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
                sendMessage(id);
              }
            }}
            className="w-full py-2 px-5 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <button
          onClick={() => sendMessage(id)}
          className="font-bold cursor-pointer w-17 py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-800 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatSpecific;
