// SynthHR AI HR Assistant Web App with ChatGPT-style sidebar layout

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function SynthHRApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [currentDoc, setCurrentDoc] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input) return;
    const userMessage: Message = { role: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await response.json();
      const aiMessage: Message = { role: "ai", text: data.reply };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentDoc(data.template || data.reply);
    } catch (error) {
      console.error("Error communicating with OpenAI API", error);
    }
  };

  const handleSaveTemplate = () => {
    if (currentDoc && !templates.includes(currentDoc)) {
      setTemplates(prev => [...prev, currentDoc]);
      alert("Template saved.");
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">SynthHR</h1>
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-2">📁 Saved Templates</h2>
          <ul className="space-y-2 text-sm">
            {templates.map((template, idx) => (
              <li key={idx} className="bg-blue-700 p-2 rounded hover:bg-blue-600 cursor-pointer">
                {template.slice(0, 40)}...
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main App */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50">
        <header className="bg-white shadow p-6 sticky top-0 z-10">
          <h2 className="text-3xl font-bold text-blue-700">Your Smart HR Assistant</h2>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="w-1/2 p-4 flex flex-col border-r overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-3 max-w-[80%] ${
                    msg.role === "user" ? "ml-auto bg-blue-100 text-right" : "mr-auto bg-blue-50"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                className="flex-1"
                placeholder="Ask something or request a document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>

          {/* Document Preview Area */}
          <div className="w-1/2 p-4 flex flex-col">
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">📄 Document Preview</h2>
            <Textarea
              className="w-full flex-1 mb-2"
              rows={12}
              value={currentDoc}
              onChange={(e) => setCurrentDoc(e.target.value)}
            />
            <Button onClick={handleSaveTemplate}>💾 Save as Template</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
