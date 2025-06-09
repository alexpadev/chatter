import React, { useRef, useEffect } from "react";

function Chat({ messages, clientId, content, setContent, to, setTo, sendMessage }) {
  const messagesContainerRef = useRef(null);
  console.log("Hola?")
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    let parsed;
    try {
      parsed = JSON.parse(lastMessage);
    } catch (error) {
      parsed = { content: lastMessage };
    }
    const clientEmail = document.getElementById("mailUser")?.textContent;
    const isFromClient = clientEmail === parsed.from;
    if (isFromClient && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (error) {
      parsed = { content: message };
    }
    const clientEmail = document.getElementById("mailUser")?.textContent;
    const isFromClient = clientEmail === parsed.from;
    
    return (
      <div className={`p-3 rounded shadow ${isFromClient ? 'bg-blue-100 ml-10' : 'bg-blue-50 mr-10'}`}>
        <div className="text-sm text-gray-600 mb-1">
          {parsed.from ? `From: ${parsed.from}` : "System"}
          {parsed.to && <span className="ml-2">| To: {parsed.to}</span>}
        </div>
        <div className="text-base text-gray-800">{parsed.content}</div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-blue-500 text-center mb-4">
        Chat
      </h1>
      
      <div 
        ref={messagesContainerRef} 
        className="space-y-3 mb-6 max-h-80 overflow-y-auto"
      >
        {messages.map((message, index) => (
          <div key={index}>{renderMessage(message)}</div>
        ))}
      </div>

     
      
      <div className="space-y-4">
          
          <div>
            <label className="block text-gray-700 mb-1">To:</label>
            <input
              type="text"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        
          <div>
            <label className="block text-gray-700 mb-1">Content:</label>
            <input
              type="text"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            onClick={() => sendMessage(to)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>
 
  );
}

export default Chat;
