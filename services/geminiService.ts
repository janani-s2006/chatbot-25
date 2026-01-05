
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { syllabusData } from "../data/syllabusData";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Simple keyword-based retrieval for RAG context.
 */
const retrieveContext = (query: string): string => {
  const queryLower = query.toLowerCase();
  
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
    return "No specific syllabus entries found for this query.";
  }

  return relevantItems
    .map(item => `Topic: ${item.topic}\nContent: ${item.content}`)
    .join('\n\n');
};

/**
 * Utility for exponential backoff.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates an academic response using the Gemini API with robust error handling and retries.
 */
export const generateAcademicResponse = async (query: string): Promise<{ text: string; sources: string[] }> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Cloud AI Configuration Missing: The API key is not configured in the environment.");
  }

  const context = retrieveContext(query);
  const systemInstruction = `
    You are an expert Academin Advisor Chatbot for Engineering students.
    Your goal is to answer questions based strictly on the provided syllabus context.
    
    Context from Syllabus:
    ${context}
    
    Rules:
    1. If the information is not in the context, inform the student that it's outside the current syllabus scope.
    2. Be concise, academic, and encouraging.
    3. Use formatting like bullet points or bold text to make explanations clear.
    4. Do not mention "based on the context provided" explicitly; answer with authority.
  `;

  let lastError: any;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Re-instantiate for each attempt to ensure fresh state if needed
      const ai = new GoogleGenAI({ apiKey });
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("The AI model returned an empty response. This may be due to safety filters.");
      }
      
      const sources = context !== "No specific syllabus entries found for this query." 
        ? context.split('\n\n').map(c => c.split('\n')[0].replace('Topic: ', ''))
        : [];

      return { text, sources };

    } catch (error: any) {
      lastError = error;
      
      // Check if the error is retryable (e.g., Rate limit 429 or Server error 5xx)
      const isRateLimit = error.message?.includes('429');
      const isServerError = error.message?.includes('500') || error.message?.includes('503');
      const isNetworkError = error.name === 'TypeError' && error.message?.includes('fetch');

      if ((isRateLimit || isServerError || isNetworkError) && attempt < MAX_RETRIES - 1) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${backoff}ms...`, error.message);
        await sleep(backoff);
        continue;
      }
      
      // If not retryable or max retries reached, break and throw
      break;
    }
  }

  // Handle specific error cases for the UI
  if (lastError?.message?.includes('403')) {
    throw new Error("Access Denied: The provided API key does not have permission to access the Gemini API.");
  } else if (lastError?.message?.includes('429')) {
    throw new Error("Rate Limit Reached: Too many requests. Please wait a moment before trying again.");
  } else if (lastError?.message?.includes('fetch')) {
    throw new Error("Connection Error: Unable to reach the Cloud AI service. Please check your internet connection.");
  }

  throw new Error(lastError?.message || "An unexpected error occurred while generating the response.");
};
