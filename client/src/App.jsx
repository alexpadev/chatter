import { useState, useEffect, useRef, useTransition } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from "axios";
import { UserContext } from './userContext';

import { Login } from './auth/Login';
import { Logout } from './auth/Logout';
import { Register } from './auth/Register';
import { Password } from './auth/Password';

import { Home } from './components/Home';
import { NotFound } from './components/NotFound';
import { Error } from './components/Error';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

import { Usuaris } from './components/usuaris/Usuaris';
import { UsuarisList } from './components/usuaris/UsuarisList';
import { Usuari } from './components/usuaris/Usuari';

import { Profile } from './components/Profile';

import { Bios } from './components/bios/Bios';
import { BiosList } from './components/bios/BiosList';
import { Bio } from './components/bios/Bio';
import MyBios from './components/bios/MyBios';

import Chat from './components/chats/Chat';
import ChatList from './components/chats/ChatList';
import ChatSpecific from './components/chats/ChatSpecific';
import ChatSelf from './components/chats/ChatSelf';

const API_URL = process.env.API_URL;

function App() {
  const clientId = Math.floor(Math.random() * 1000);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const apiInstanceRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    const websocket = new WebSocket('ws://localhost:8080/');
    
    websocket.onopen = () => {
      console.log('WebSocket is connected');
      websocket.send(JSON.stringify({
        type: "auth",
        jwt_token: user.jwt_token,
        email: user.email
      }));
    };

    websocket.onmessage = (evt) => {
      console.log('WebSocket message received:', evt.data);
      let messageObject;
      try {
        messageObject = JSON.parse(evt.data);
      } catch (e) {
        console.error("Error parsing message", e);
        return;
      }
      console.log("Parsed message:", messageObject);

      if (messageObject.type === "chat") {
        setMessages(prev => [...prev, evt.data]);
      } else if (messageObject.type === "notification") {
        alert(messageObject.content);
      } else if (messageObject.type === "logout") {
        alert(messageObject.message || "You have been logged out from all devices.");
        localStorage.removeItem("user");
        window.location.href = '/login';
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket is closed');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user]);

  const sendMessage = (to) => {
    if (ws && content.trim() !== "") {
      console.log("Sending message to", to);
      ws.send(JSON.stringify({
        type: "chat",
        to: to,
        content: content
      }));
      setContent('');
    }
  };

  const sendNotification = (to, notificationText) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: "notification",
        to: to,
        content: notificationText
      }));
    }
  };

  useEffect(() => {
    if (user) {
      startTransition(() => {
        console.log("Saving user in localStorage and creating axios instance for", user.email);
        localStorage.setItem('user', JSON.stringify(user));
        const instance = axios.create({
          baseURL: API_URL,
          headers: {
            'Authorization': `JWT ${user.jwt_token}`
          }
        });
        startTransition(() => {
          apiInstanceRef.current = instance;
        });
      });
    } else {
      apiInstanceRef.current = null;
      localStorage.removeItem('user');
      console.log("User removed from localStorage");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, apiInstanceRef }}>
      <Header />
      <main>
        {user ?
          isPending ? <p>🌀 Loading...</p> :
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/password" element={<Password user={user} setUser={setUser} />} />
              <Route path="/usuaris/:id" element={<Usuari />} />
              <Route path="/usuaris" element={<Usuaris />}>
                <Route index element={<UsuarisList sendNotification={sendNotification} />} />
                <Route path=":id" element={<Usuari sendNotification={sendNotification} />} />
              </Route>
              <Route path="/" element={<Chat messages={messages} clientId={clientId} setMessages={setMessages} to={to} setTo={setTo} content={content} setContent={setContent} sendMessage={sendMessage} />} />
              <Route path="/chat/:id" element={<ChatSpecific user={user} messages={messages} clientId={clientId} setMessages={setMessages} to={to} setTo={setTo} content={content} setContent={setContent} sendMessage={sendMessage} />} />
              <Route path="/chat/list" element={<ChatList user={user} />} />
              <Route path="/chat/self" element={<ChatSelf user={user} messages={messages} clientId={clientId} setMessages={setMessages} content={content} setContent={setContent} sendMessage={sendMessage} />} />
              <Route path="/bios" element={<Bios />}>
                <Route index element={<BiosList sendNotification={sendNotification} />} />
                <Route path=":id" element={<Bio sendNotification={sendNotification} />} />
              </Route>
              <Route path="/my-bios" element={<MyBios />} />
              <Route path="/error" element={<Error />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          :
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        }
      </main>
      <Footer />
    </UserContext.Provider>
  );
}

export default App;
