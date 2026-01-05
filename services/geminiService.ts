
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { syllabusData } from "../data/syllabusData";
import { SyllabusItem } from "../types";

const API_KEY = process.env.API_KEY || "";

// Simple retrieval logic (RAG)
// For 150 items, we can use a keyword-based retrieval or pass the most relevant items.
// In a real-world production app, we would use vector embeddings.
// Here we demonstrate retrieval-augmented generation by finding relevant context.
const retrieveContext = (query: string): string => {
  const queryLower = query.toLowerCase();
  
  // Find top 5 items that match keywords in the query
  const relevantItems = syllabusData
    .map(item => ({
      item,
      score: (item.topic.toLowerCase().split(' ').filter(word => queryLower.includes(word)).length * 2) +
             (item.content.toLowerCase().split(' ').filter(word => queryLower.includes(word)).length)
    }))
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(res => res.item);

  if (relevantItems.length === 0) {
    // Fallback: return a generic set or empty if nothing found
    return "No specific syllabus entries found for this query.";
  }

  return relevantItems
    .map(item => `Topic: ${item.topic}\nContent: ${item.content}`)
    .join('\n\n');
};

export const generateAcademicResponse = async (query: string): Promise<{ text: string; sources: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const context = retrieveContext(query);
  
  const systemInstruction = `
    You are an expert Academic Advisor Chatbot for Engineering students.
    Your goal is to answer questions based strictly on the provided syllabus context.
    
    Context from Syllabus:
    ${context}
    
    Rules:
    1. If the information is not in the context, inform the student that it's outside the current syllabus scope.
    2. Be concise, academic, and encouraging.
    3. Use formatting like bullet points or bold text to make explanations clear.
    4. Do not mention "based on the context provided" explicitly in the final answer; just answer as if you know it.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "I'm sorry, I couldn't generate a response.";
    
    // Extract topic names for sources
    const sources = context !== "No specific syllabus entries found for this query." 
      ? context.split('\n\n').map(c => c.split('\n')[0].replace('Topic: ', ''))
      : [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to the cloud AI service. Please check your API configuration.");
  }
};
