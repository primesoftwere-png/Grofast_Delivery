'use client';

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const contacts = [
  { id: "1", name: "Priya S.", initials: "PS", role: "Customer", lastMsg: "I'm waiting at gate", unread: 2 },
  { id: "2", name: "Fresh Mart", initials: "FM", role: "Shop", lastMsg: "Order is ready", unread: 1 },
  { id: "3", name: "Amit K.", initials: "AK", role: "Customer", lastMsg: "Thanks for delivery!", unread: 0 },
];

const initialMessages = [
  { id: 1, text: "Hi, I've reached the shop. Picking up your order now.", sender: "me", time: "10:30 AM" },
  { id: 2, text: "Great! I'm waiting at the gate.", sender: "other", time: "10:31 AM" },
  { id: 3, text: "On my way, will be there in 5 minutes.", sender: "me", time: "10:32 AM" },
];

export default function Chat() {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [showContacts, setShowContacts] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: input,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
  };

  return (
    <div className="p-4">
      <div className="animate-fade-in h-[calc(100vh-7rem)]">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Chat
        </h1>

        {/* Card */}
        <div className="border border-border/50 rounded-xl h-[calc(100%-3rem)] overflow-hidden">
          <div className="flex h-full">

            {/* Contacts */}
            <div
              className={`w-full md:w-72 border-r border-border/50 flex-shrink-0 ${
                !showContacts ? "hidden md:block" : ""
              }`}
            >
              <div className="p-3 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground">
                  Conversations
                </p>
              </div>

              <div className="overflow-auto">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveContact(c);
                      setShowContacts(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${
                      activeContact.id === c.id ? "bg-muted/70" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs text-secondary-foreground">
                      {c.initials}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.name}
                        </p>

                        {c.unread > 0 && (
                          <span className="w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMsg}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex flex-col ${
                showContacts ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Header */}
              <div className="p-3 border-b border-border/50 flex items-center gap-3">
                <button
                  onClick={() => setShowContacts(true)}
                  className="md:hidden text-muted-foreground"
                >
                  ←
                </button>

                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-secondary-foreground">
                  {activeContact.initials}
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activeContact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeContact.role}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender === "me"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        m.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.sender === "me"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && sendMessage()
                    }
                    placeholder="Type a message..."
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none"
                  />

                  <button
                    onClick={sendMessage}
                    className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}