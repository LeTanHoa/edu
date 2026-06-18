import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const ChatRoom = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch contacts
    api.get('/chat/contacts')
      .then(res => {
        if (res.data.success) {
          setContacts(res.data.contacts);
          if (res.data.contacts.length > 0) {
            setActiveContact(res.data.contacts[0]);
          }
        }
        setLoadingContacts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingContacts(false);
      });
  }, []);

  useEffect(() => {
    if (activeContact) {
      loadMessages(activeContact._id);
    }
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (userId) => {
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeContact) return;

    try {
      const res = await api.post('/chat/send', {
        receiverId: activeContact._id,
        content: typedMessage
      });
      
      if (res.data.success) {
        setMessages([...messages, res.data.message]);
        setTypedMessage('');
      }
    } catch (error) {
      alert('Không thể gửi tin nhắn!');
    }
  };

  if (loadingContacts) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="card-playful bg-white dark:bg-slate-800 p-0 flex h-[70vh] border-slate-100 overflow-hidden font-bold">
      
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r-4 border-slate-100 dark:border-slate-700/50 flex flex-col">
        <div className="p-4 border-b-2 border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-black font-comic flex items-center gap-1">
            <MessageSquare size={16} />
            <span>Học sinh của cô</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {contacts.length === 0 ? (
            <p className="text-[10px] text-slate-400 font-bold text-center py-4">Chưa có học sinh liên hệ</p>
          ) : (
            contacts.map(c => (
              <button
                key={c._id}
                onClick={() => setActiveContact(c)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left ${
                  activeContact?._id === c._id 
                    ? 'bg-primary-50 dark:bg-slate-750 border-2 border-primary-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border">
                  <img 
                    src={c.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.username}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <p className="text-xs font-black truncate">{c.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">🎒 Học Sinh</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/40">
        {activeContact ? (
          <>
            {/* Header info */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700/50 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white border">
                <img 
                  src={activeContact.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeContact.username}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-black">{activeContact.fullName}</p>
                <span className="text-[9px] text-forest-500 flex items-center gap-1 font-bold">● Học sinh trực tuyến</span>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 my-auto text-slate-400">
                  <span className="text-4xl animate-bounce">🎈</span>
                  <p className="text-xs font-comic">Cô hãy gửi tin nhắn chào bé học sinh nào!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender === user.id || msg.sender?._id === user.id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex flex-col max-w-[70%] text-xs font-semibold ${
                        isMe ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl border ${
                        isMe 
                          ? 'bg-primary-500 text-white border-primary-500 rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-tl-none text-slate-700 dark:text-slate-200'
                      }`}>
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Send Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t-2 border-slate-100 dark:border-slate-700/50 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
              />
              <button
                type="submit"
                className="p-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-[0_3px_0_0_#0284c7] transition-all hover:scale-102"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center my-auto text-slate-400 gap-2 font-comic text-sm">
            <span>📪</span>
            <span>Chọn học sinh bên trái để bắt đầu nhắn tin.</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatRoom;
