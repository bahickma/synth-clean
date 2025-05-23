import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  name?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are SynthHR, an AI HR Assistant. Your job is to help users draft HR templates by asking smart, clarifying questions to gather all the necessary details. Once enough information is gathered, generate a complete, ready-to-edit document. Stay professional, friendly, and structured.",
        },
        ...messages.map((msg: ChatMessage) => {
          const role = msg.role === "ai" ? "assistant" : "user";
          return {
            role,
            content: msg.text,
            ...(role === "function" ? { name: msg.name || "function_name" } : {}),
          };
        }),
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message?.content || "I'm not sure how to help with that yet.";
    const lower = reply.toLowerCase();

    // Simple signal to detect whether a doc was likely generated
    const isDocument =
      lower.includes("dear") || lower.includes("this letter") || lower.includes("policy") || lower.length > 400;

    res.status(200).json({ reply, template: isDocument ? reply : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI request failed." });
  }
}
