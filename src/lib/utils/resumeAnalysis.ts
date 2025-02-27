import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function analyzeResume(resumeText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze this resume and provide:
      1. Key skills extracted
      2. Years of experience
      3. Education summary
      4. Key achievements
      5. Potential role matches
      
      Resume text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}