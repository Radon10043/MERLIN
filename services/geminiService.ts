import OpenAI from "openai";
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // We'll proceed assuming it is, as per the instructions.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

let openai = new OpenAI({
    baseURL: process.env.BASE_URL || "BASE_URL_PLACEHOLDER",
    apiKey: process.env.API_KEY || "API_KEY_PLACEHOLDER",
    dangerouslyAllowBrowser: true // This is required for browser usage
});

export const setupModel = (baseurl: string, apiKey: string) => {
  openai = new OpenAI({ baseURL: baseurl, apiKey: apiKey, dangerouslyAllowBrowser: true });
  console.log("API key updated in geminiService.");
}

export const extractMetamorphicRelations = async (
  modelName: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{ description: string } | null> => {
  try {
    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' as const : 'user' as const,
        content: m.content
      })),
      {
        role: 'user',
        content: `Based on the provided context and the preceding conversation, identify and describe ONE potential metamorphic relation. A metamorphic relation is a property of the software's inputs and outputs that can be used for testing. Respond ONLY with a valid JSON object. This object must have a single key 'description' containing the metamorphic relation. If no new relation can be found based on the last message, return an empty JSON object {}.
Example Response: \`{"description": "Shuffling the order of items in an input list for a sorting function should not change the sorted output list."}\``
      }
    ];

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: apiMessages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from the model.");
    }
    
    const parsed = JSON.parse(content);
    
    if (parsed && typeof parsed.description === 'string' && parsed.description.trim() !== "") {
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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: `You are a helpful assistant that generates ${language} test code based on provided metamorphic relations.` },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response from the model.");
    }

    const parsed = JSON.parse(content);
    
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