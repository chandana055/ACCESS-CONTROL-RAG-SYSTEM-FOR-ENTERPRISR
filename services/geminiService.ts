
import { GoogleGenAI, Type } from "@google/genai";
import { Document, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const queryRAG = async (
  query: string,
  authorizedDocs: Document[],
  history: ChatMessage[]
) => {
  // Simple retrieval: Find documents that contain relevant keywords
  // In a real app, this would use vector embeddings and a database
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
  const relevantDocs = authorizedDocs.filter(doc => {
    return keywords.some(kw => 
      doc.title.toLowerCase().includes(kw) || 
      doc.content.toLowerCase().includes(kw)
    );
  }).slice(0, 5); // Take top 5 for context

  const context = relevantDocs.length > 0 
    ? relevantDocs.map(doc => `SOURCE: ${doc.title}\nCONTENT: ${doc.content}`).join('\n\n---\n\n')
    : "No specific documents found in the database. Answer based on general knowledge or state that you don't have enough enterprise data.";

  const systemInstruction = `
    You are an AI assistant for a secure enterprise RAG system.
    You have access to specific corporate documents provided in the context below.
    Your goal is to answer the user's question using ONLY the provided context if possible.
    If you use information from a document, you MUST cite it by name (e.g., [Employee Handbook 2024]).
    If the context doesn't contain the answer, say so.
    Do not hallucinate facts about the enterprise.
    
    USER'S AUTHORIZED CONTEXT:
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for high factual accuracy
      },
    });

    return {
      text: response.text || "I'm sorry, I couldn't process that request.",
      sources: relevantDocs.map(d => d.title)
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
