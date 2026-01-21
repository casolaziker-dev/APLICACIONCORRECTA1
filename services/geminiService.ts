import { GoogleGenAI } from "@google/genai";

// 1. Configuración correcta para la librería que tú tienes
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

// 2. Usamos un modelo rápido y estable
const MODEL_NAME = "gemini-1.5-flash";

export async function generateQuizQuestions(topic: string): Promise<any[]> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Genera 5 preguntas de trivia sobre: ${topic}.
      Responde SOLO con un JSON válido (sin markdown) con este formato exacto:
      [
        {
          "question": "¿Pregunta?",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0
        }
      ]`,
      config: { responseMimeType: "application/json" }
    });

    // Limpieza de seguridad por si la IA añade comillas extra
    const text = response.text()?.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Pregunta de respaldo por si falla la conexión
    return [{
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Marte", "Venus", "Júpiter", "Saturno"],
      correctIndex: 2
    }];
  }
}

export async function getWordClue(): Promise<{ word: string, clue: string }> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Genera un JSON con una palabra en español y una pista: { \"word\": \"CASA\", \"clue\": \"Lugar donde vives\" }.",
      config: { responseMimeType: "application/json" }
    });
    const text = response.text()?.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text || "{}");
  } catch (error) {
    return { word: "SOL", clue: "Estrella que nos da luz" };
  }
}

export async function getWordleWord(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Dime solo una palabra de 5 letras en español. Nada más.",
    });
    const text = response.text()?.trim().toUpperCase();
    const clean = text?.replace(/[^A-ZÑ]/g, '').substring(0, 5);
    return clean && clean.length === 5 ? clean : "MUNDO";
  } catch (error) {
    return "MUNDO";
  }
}
