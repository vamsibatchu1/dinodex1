import { GoogleGenAI, Type } from "@google/genai";
import { DinoStats } from "../types";

// Helper to get the API key selection state
export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true; // Fallback for environments where this isn't defined
};

export const openApiKeyDialog = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

export const generateDinoStats = async (dinoName: string): Promise<DinoStats> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Generate detailed baseball-card style stats for the dinosaur: ${dinoName}. 
    Include scientific name, period, diet, height (meters), weight (kg), location, a fun fact, a rarity level (Common, Uncommon, Rare, Legendary).
    For the description, provide an informative and conversational explanation (around 10 lines of text, approximately 100-120 words) as if you are talking to a regular person. Describe what the dinosaur looked like, what its daily life was like, and paint a clear picture of the environment it lived in (the scenery, plants, and climate). Avoid overly poetic or flowery language; keep it grounded and interesting.
    
    Also include TCG-style battle stats:
    - level: a number between 1 and 100
    - hp: a number between 40 and 200 (in increments of 10)
    - energyType: one of 'Fighting', 'Lightning', 'Grass', 'Fire', 'Water', 'Psychic'
    - attacks: an array of 2 objects, each with:
      - name: a witty attack name
      - description: a short, witty, and slightly humorous description
      - damage: a number between 10 and 120 (in increments of 10)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          period: { type: Type.STRING },
          diet: { type: Type.STRING, enum: ['Herbivore', 'Carnivore', 'Omnivore'] },
          height: { type: Type.STRING },
          weight: { type: Type.STRING },
          location: { type: Type.STRING },
          funFact: { type: Type.STRING },
          description: { type: Type.STRING },
          rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare', 'Legendary'] },
          level: { type: Type.INTEGER },
          hp: { type: Type.INTEGER },
          energyType: { type: Type.STRING },
          attacks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                damage: { type: Type.INTEGER },
              },
              required: ['name', 'description', 'damage'],
            },
          },
        },
        required: ['name', 'scientificName', 'period', 'diet', 'height', 'weight', 'location', 'funFact', 'description', 'rarity', 'level', 'hp', 'energyType', 'attacks'],
      },
    },
  });

  return JSON.parse(response.text || '{}') as DinoStats;
};

export const generateDinoImage = async (stats: DinoStats): Promise<string> => {
  // Always create a new instance to use the latest API key from the dialog
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `A single, beautifully illustrated vintage-style collectible trading card featuring a cute, chibi-style dinosaur. The entire card is set against a solid dark black background, with the card itself having a textured, slightly worn cardstock finish and a prominent, weathered colored border.

Top Card Header:
The card’s colored border corresponds to its type (${stats.energyType}). The border has a slightly rough, vintage texture.
At the top left, the name of the dinosaur is written in a clear, friendly, rounded dark sans-serif font: ${stats.name.toUpperCase()}.
Next to the name, the text Lv.${stats.level} appears.
Further to the right, the text HP ${stats.hp} is displayed.
At the far right corner, a circular energy type symbol is prominently displayed, filled with a graphic icon for ${stats.energyType} and a slight texture.

Main Illustration (Inside Card Frame):
A distinct, hand-drawn illustration with bold, clean black outlines is contained within a rectangular frame.
The scene depicts an adorable, stylized cartoon version of the dinosaur in its natural prehistoric habitat (${stats.location}). The dinosaur has a gentle expression and simple blushes on its cheeks.
The habitat is rich in detail with muted, complementary colors: a stylized sun, soft clouds, rocky formations, and simple prehistoric foliage.
A small, circular speech bubble floats above the main dinosaur, containing a simple, friendly sound or phrase in all caps (e.g., "RAW R!", "HORNS UP!", "SWOOP!").

Bottom Attack Text Area:
The lower section of the card, within the main colored border, features the card’s attacks in a slightly darker background shade.
Each attack is listed sequentially:
1. ${stats.attacks[0].name}: ${stats.attacks[0].description} [${stats.attacks[0].damage} Damage]
2. ${stats.attacks[1].name}: ${stats.attacks[1].description} [${stats.attacks[1].damage} Damage]

Aesthetic Overtones:
The card has a distinct nostalgic 90s collectible card game feel, with a slightly textured, matte finish and hand-drawn quality. The line work is confident and charming.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: `Use these images as a direct aesthetic and visual reference for the card style: https://i.ibb.co/HLMjcTz4/dino3.png and https://i.ibb.co/0pDyx3GB/dino1.png. The generated card should exactly follow this hand-drawn, vintage, and charming aesthetic.

${prompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K"
      },
      tools: [
        {
          googleSearch: {
            searchTypes: {
              webSearch: {},
              imageSearch: {},
            }
          },
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
};
