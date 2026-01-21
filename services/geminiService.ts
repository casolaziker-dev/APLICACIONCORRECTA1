import { GoogleGenAI, SchemaType } from "@google/generative-ai";
import { QuizQuestion } from "../types";

// Usamos la configuración estándar de Vite para la API Key
const genAI = new GoogleGenAI(import.meta.env.VITE_GOOGLE_API_KEY || "");

// Configuración del modelo más rápido y estable
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuizQuestions(topic: string): Promise<QuizQuestion[]> {
  try {
    const prompt = `Genera 5 preguntas de trivia sobre el tema: ${topic}. 
    Responde ÚNICAMENTE con un JSON válido siguiendo este esquema, sin texto adicional ni markdown:
    [
      {
        "question": "Pregunta aquí",
        "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
        "correctIndex": 0
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Limpieza por si la IA añade bloques de código
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [{
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Marte", "Venus", "Júpiter", "Saturno"],
      correctIndex: 2
    }];
  }
}

export async function getWordClue(): Promise<{ word: string, clue: string }> {
  try {
    const prompt = `Genera un objeto JSON con una palabra común en español y una pista. 
    Formato: { "word": "PALABRA", "clue": "Pista aquí" }. Sin markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    return { word: "SOL", clue: "Estrella que nos da luz de día." };
  }
}

export async function getWordleWord(): Promise<string> {
  try {
    const prompt = `Genera solo una palabra común de 5 letras en español. Solo la palabra, nada más.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();
    
    // Asegurarnos de que son 5 letras y limpiar
    const cleanWord = text.replace(/[^A-ZÑ]/g, '').substring(0, 5);
    return cleanWord.length === 5 ? cleanWord : "MUNDO";
  } catch (error) {
    const fallbacks = ["TEXTO", "MUNDO", "PIANO", "LIBRO", "PLAYA", "FRUTA"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
