// SynthHR AI HR Assistant Web App with back-and-forth chat, document generation, and template saving

import { useState } from "react";
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
    <div className="min-h-screen p-6 bg-gradient-to-b from-white to-blue-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">SynthHR: AI HR Assistant</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Chat Interface */}
        <Card className="h-full">
          <CardContent>
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-2 overflow-y-auto">
                {messages.map((msg, index) => (
                  <p key={index} className={msg.role === "user" ? "text-right" : "text-left font-semibold"}>
                    <span className="block whitespace-pre-wrap">{msg.text}</span>
                  </p>
                ))}
              </div>
              <div className="flex mt-4 gap-2">
                <Input
                  className="flex-1"
                  placeholder="What can I help you with today..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button onClick={handleSend}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Document Panel */}
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold mb-2">Generated Document</h2>
            <Textarea
              className="w-full"
              rows={12}
              value={currentDoc}
              onChange={(e) => setCurrentDoc(e.target.value)}
            />
            <Button className="mt-2" onClick={handleSaveTemplate}>
              Save as Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Saved Templates */}
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-2">Saved Templates</h2>
          <ul className="list-disc pl-5">
            {templates.map((template, idx) => (
              <li key={idx} className="whitespace-pre-wrap">{template}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
