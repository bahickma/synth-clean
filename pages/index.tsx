// SynthHR AI HR Assistant Web App with improved layout and visual flair

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white text-gray-900 flex flex-col">
      <header className="bg-white shadow p-6 mb-4 sticky top-0 z-10">
        <h1 className="text-4xl font-bold text-center text-blue-700">SynthHR: Your Smart HR Assistant</h1>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row gap-6 px-6 pb-6">
        {/* Chat Panel */}
        <div className="flex flex-col w-full lg:w-1/2 h-[80vh] bg-white shadow rounded-2xl p-4 overflow-hidden">
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
              placeholder="Ask a question or request a document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>

        {/* Document Panel */}
        <div className="w-full lg:w-1/2 h-[80vh] flex flex-col bg-white shadow rounded-2xl p-4">
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">📄 Live Document Preview</h2>
          <Textarea
            className="w-full flex-1 mb-2"
            rows={12}
            value={currentDoc}
            onChange={(e) => setCurrentDoc(e.target.value)}
          />
          <Button onClick={handleSaveTemplate}>💾 Save as Template</Button>
        </div>
      </main>

      {/* Saved Templates */}
      <section className="px-6 pb-12">
        <Card className="mt-8">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">📁 Saved Templates</h2>
            <ul className="list-disc pl-5 space-y-2">
              {templates.map((template, idx) => (
                <li key={idx} className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded-md">
                  {template}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
