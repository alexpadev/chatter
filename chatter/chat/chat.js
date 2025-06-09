const WebSocket = require('ws');
const Client = require('./client');
const Message = require('../models/Message');

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY";
const GENERATION_CONFIG = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const callGeminiAPI = async (userMessage) => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const chatSession = model.startChat({
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
      history: [],
    });
    
    const result = await chatSession.sendMessage(userMessage);
    
    return result.response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, I'm having trouble connecting to Gemini.";
  }
};

class Chat {
  constructor(wshost, wsport) {
    this.client_map = new Map();
    const wss = new WebSocket.Server({ host: wshost, port: wsport });
    console.log("WebSocket server started at host", wshost, "and port", wsport);
    wss.on('connection', (ws) => this.on_connection(ws));
  }

  on_connection(ws) {
    const client = new Client(ws);
    ws.on('message', (message) => {
      try {
        const json = JSON.parse(message);
        this.on_message(client, json);
      } catch (e) {
        console.error("Invalid message format:", e);
      }
    });
    ws.on('close', () => this.remove_client(client));
  }

  async on_message(client, json) {
    console.log('Received message:', json, "from client with token:", client.token);
    
    if (json.type === 'auth') {
      if (!client.token) {
        client.set_token(json.jwt_token);
        client.email = json.email.trim().toLowerCase();
        if (!this.client_map.has(client.email)) {
          this.client_map.set(client.email, []);
        }
        this.client_map.get(client.email).push(client);
        console.log(`Added client for ${client.email}. Total clients for this email: ${this.client_map.get(client.email).length}`);
      } else {
        console.log('Client already authenticated.');
      }
    } else if (json.type === 'chat') {
      if (!client.token) {
        console.log('Client not authenticated.');
        return;
      }
      json.from = client.email;
      
      const messageObj = new Message({
        from: json.from,
        to: json.to,
        content: json.content
      });
      messageObj.save().catch(err => console.error("Error saving chat message", err));
  
      if (json.to === "gemini") {
        const senderClients = this.client_map.get(json.from.trim().toLowerCase());
        if (senderClients && senderClients.length) {
          senderClients.forEach(s_client => {
            if (s_client.ws.readyState === WebSocket.OPEN) {
              s_client.send(json);
            }
          });
        }
  
        try {
          const geminiReply = await callGeminiAPI(json.content);
          const geminiResponse = {
            type: "chat",
            from: "gemini",
            to: json.from,
            content: geminiReply
          };
          
          const geminiMessageObj = new Message({
            from: "gemini",
            to: json.from,
            content: geminiReply
          });
          await geminiMessageObj.save();
        
          senderClients.forEach(s_client => {
            if (s_client.ws.readyState === WebSocket.OPEN) {
              s_client.send(geminiResponse);
            }
          });
        } catch (error) {
          console.error("Error processing Gemini chat", error);
        }
      } else if (json.to === "group") {
        this.broadcastToGroup(json);
      } else if (json.to === "self") {
        const senderClients = this.client_map.get(json.from.trim().toLowerCase());
        if (senderClients && senderClients.length) {
          senderClients.forEach(s_client => {
            if (s_client.ws.readyState === WebSocket.OPEN) {
              s_client.send(json);
            }
          });
        }
      } else {
        const recipientClients = this.client_map.get(json.to.trim().toLowerCase());
        if (recipientClients && recipientClients.length) {
          recipientClients.forEach(dst_client => {
            if (dst_client.ws.readyState === WebSocket.OPEN) {
              dst_client.send(json);
            } else {
              this.remove_client(dst_client);
            }
          });
        } else {
          console.log('Recipient not found:', json.to);
        }
        
        const senderClients = this.client_map.get(json.from.trim().toLowerCase());
        if (senderClients && senderClients.length) {
          senderClients.forEach(s_client => {
            if (s_client.ws.readyState === WebSocket.OPEN) {
              s_client.send(json);
            } else {
              this.remove_client(s_client);
            }
          });
        }
      }
    } else if (json.type === 'notification') {
      if (!client.token) {
        console.log('Client not authenticated.');
        return;
      }
      const recipientEmail = json.to.trim().toLowerCase();
      const dstClients = this.client_map.get(recipientEmail);
      if (dstClients && dstClients.length) {
        dstClients.forEach(dst_client => {
          if (dst_client.ws.readyState === WebSocket.OPEN) {
            dst_client.send(json);
          } else {
            this.remove_client(dst_client);
          }
        });
      } else {
        console.log('Recipient not found for notification:', recipientEmail);
      }
    }
  }

  broadcastToGroup(message) {
    this.client_map.forEach((clients) => {
      clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }

  remove_client(client) {
    if (!client.email) return;
    const clients = this.client_map.get(client.email);
    if (clients) {
      const filtered = clients.filter(c => c !== client);
      if (filtered.length > 0) {
        this.client_map.set(client.email, filtered);
      } else {
        this.client_map.delete(client.email);
      }
    }
    console.log('Removed client for', client.email);
  }

  logoutUser(email) {
    const clients = this.client_map.get(email.trim().toLowerCase());
    if (clients && clients.length) {
      clients.forEach(client => {
        client.send({ type: "logout", message: "You have been logged out from all devices." });
        client.ws.close();
      });
      this.client_map.delete(email.trim().toLowerCase());
      console.log("Logged out all clients for email:", email);
    }
  }

  get_clients() {
    return Array.from(this.client_map.keys());
  }
}

module.exports = new Chat('localhost', 8080);
