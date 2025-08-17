import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePostContent(prompt: string): Promise<string> {
    const systemPrompt = `You are a professional social media content creator. 
Generate engaging, platform-appropriate content that drives engagement and maintains brand voice.
Keep posts concise, use relevant hashtags, and include call-to-action elements when appropriate.
Avoid controversial topics and ensure content is professional yet engaging.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: systemPrompt,
        },
        contents: prompt,
    });

    return response.text || "Unable to generate content at this time.";
}

export async function generateHashtags(content: string): Promise<string[]> {
    try {
        const systemPrompt = `You are a social media hashtag expert. 
Analyze the content and generate 5-10 relevant, trending hashtags that would increase visibility.
Focus on a mix of popular and niche hashtags. Avoid overused or spam hashtags.
Return only the hashtags as a JSON array of strings, including the # symbol.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array",
                    items: { type: "string" },
                },
            },
            contents: `Generate hashtags for this content: ${content}`,
        });

        const rawJson = response.text;
        
        if (rawJson) {
            const hashtags: string[] = JSON.parse(rawJson);
            return hashtags.filter(tag => tag.startsWith('#')).slice(0, 10);
        } else {
            return ['#socialmedia', '#content', '#marketing'];
        }
    } catch (error) {
        console.error('Failed to generate hashtags:', error);
        return ['#socialmedia', '#content', '#marketing'];
    }
}

export async function optimizePostForPlatform(content: string, platform: string): Promise<string> {
    const platformGuidelines = {
        instagram: "Optimize for Instagram: Use engaging visuals language, include relevant hashtags, keep under 2200 characters, and encourage engagement through questions or calls-to-action.",
        facebook: "Optimize for Facebook: Create conversation-starting content, use a friendly tone, include questions to encourage comments, and keep it engaging but professional.",
        twitter: "Optimize for Twitter/X: Keep under 280 characters, use trending hashtags, make it shareable and conversation-worthy, include relevant mentions when appropriate.",
        linkedin: "Optimize for LinkedIn: Professional tone, industry-relevant content, thought leadership approach, encourage professional discussion and networking.",
        tiktok: "Optimize for TikTok: Trendy, engaging, youth-oriented language, include popular hashtags, focus on entertainment value and viral potential."
    };

    const guideline = platformGuidelines[platform as keyof typeof platformGuidelines] || platformGuidelines.instagram;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `You are a social media optimization expert. ${guideline}`,
        },
        contents: `Optimize this content for ${platform}: ${content}`,
    });

    return response.text || content;
}

export interface SentimentAnalysis {
    rating: number; // 1-5 stars
    confidence: number; // 0-1
    suggestions: string[];
}

export async function analyzeContentSentiment(text: string): Promise<SentimentAnalysis> {
    try {
        const systemPrompt = `You are a content sentiment analysis expert. 
Analyze the sentiment and engagement potential of social media content.
Provide a rating from 1-5 stars, confidence score 0-1, and improvement suggestions.
Respond with JSON in this format: 
{'rating': number, 'confidence': number, 'suggestions': string[]}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        rating: { type: "number" },
                        confidence: { type: "number" },
                        suggestions: { 
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["rating", "confidence", "suggestions"],
                },
            },
            contents: `Analyze this content: ${text}`,
        });

        const rawJson = response.text;

        if (rawJson) {
            const data: SentimentAnalysis = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        console.error('Failed to analyze sentiment:', error);
        return {
            rating: 3,
            confidence: 0.5,
            suggestions: ["Unable to analyze content sentiment at this time"]
        };
    }
}

export async function generateContentIdeas(topic: string, platform: string): Promise<string[]> {
    try {
        const systemPrompt = `You are a creative social media strategist.
Generate 5 engaging content ideas for the given topic and platform.
Each idea should be specific, actionable, and platform-appropriate.
Return as a JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array",
                    items: { type: "string" },
                },
            },
            contents: `Generate content ideas for topic "${topic}" on ${platform}`,
        });

        const rawJson = response.text;
        
        if (rawJson) {
            const ideas: string[] = JSON.parse(rawJson);
            return ideas.slice(0, 5);
        } else {
            return [`Share insights about ${topic}`, `Create a poll about ${topic}`, `Post tips related to ${topic}`];
        }
    } catch (error) {
        console.error('Failed to generate content ideas:', error);
        return [`Share insights about ${topic}`, `Create a poll about ${topic}`, `Post tips related to ${topic}`];
    }
}

export async function generateImagePrompt(contentDescription: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `You are an expert at creating detailed image generation prompts.
Create a specific, detailed prompt for generating social media images that would complement the given content.
Focus on visual elements, style, composition, and mood that would enhance engagement.`,
        },
        contents: `Create an image generation prompt for this content: ${contentDescription}`,
    });

    return response.text || "Create a professional, engaging social media image";
}

export async function generateImage(prompt: string, imagePath: string): Promise<void> {
    try {
        // IMPORTANT: only this gemini model supports image generation
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("No image generated");
        }

        const content = candidates[0].content;
        if (!content || !content.parts) {
            throw new Error("No content parts in response");
        }

        for (const part of content.parts) {
            if (part.text) {
                console.log('Image generation response:', part.text);
            } else if (part.inlineData && part.inlineData.data) {
                const imageData = Buffer.from(part.inlineData.data, "base64");
                fs.writeFileSync(imagePath, imageData);
                console.log(`Image saved as ${imagePath}`);
                return;
            }
        }
        
        throw new Error("No image data found in response");
    } catch (error) {
        throw new Error(`Failed to generate image: ${error}`);
    }
}