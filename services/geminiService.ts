import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // We'll proceed assuming it is, as per the instructions.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER" });
let ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER" });

console.log("ai:", ai);

export const setModelApiKey = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
  console.log("API key updated in geminiService.");
}

const cleanJsonString = (str: string): string => {
  // Attempts to remove markdown backticks and "json" label
  return str.replace(/^```json\s*|```$/g, '').trim();
};

export const extractMetamorphicRelations = async (
  modelName: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{ description: string } | null> => {
  try {
    const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const fullPrompt = `Based on the provided context and the preceding conversation, identify and describe ONE potential metamorphic relation.
    Conversation History:
    ${conversationHistory}
    
    A metamorphic relation is a property of the software's inputs and outputs that can be used for testing. Respond ONLY with a valid JSON object. This object must have a single key 'description' containing the metamorphic relation. If no new relation can be found based on the last message, return an empty JSON object {}.
    Example Response: \`{"description": "Shuffling the order of items in an input list for a sorting function should not change the sorted output list."}\``;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: 'The description of the metamorphic relation.'
            }
          }
        }
      }
    });

    const jsonText = cleanJsonString(response.text);
    const parsed = JSON.parse(jsonText);
    
    if (parsed && typeof parsed.description === 'string') {
        return parsed;
    }
    return null;

  } catch (error) {
    console.error("Error extracting metamorphic relations:", error);
    throw new Error("Failed to get a valid JSON response from the model for MR extraction.");
  }
};

export const generateTestDriver = async (
  modelName: string,
  mrDescription: string,
  language: string = 'Python',
): Promise<{ driver: string }> => {
  try {
    const prompt = `Metamorphic Relation: \`${mrDescription}\`
    
    Task: Generate a simple ${language} test driver function to verify this relation. The driver should not require any external libraries.
    Respond ONLY with a single valid JSON object with one key: 'driver' (containing the ${language} code as a string).
    Example Response: \`{"driver": "def test_mr_shuffle():\\n  # code here\\n  print('Test logic executed.')"}\``;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: `You are a helpful assistant that generates ${language} test code based on provided metamorphic relations.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            driver: {
              type: Type.STRING,
              description: `The ${language} code for the test driver.`
            }
          }
        }
      }
    });
    
    const jsonText = cleanJsonString(response.text);
    const parsed = JSON.parse(jsonText);
    
    if (typeof parsed.driver === 'string') {
        return { driver: parsed.driver };
    } else {
        throw new Error("Invalid JSON structure for test driver response.");
    }

  } catch (error) {
    console.error("Error generating test driver:", error);
    throw new Error("Failed to get a valid JSON response from the model for test driver generation.");
  }
};