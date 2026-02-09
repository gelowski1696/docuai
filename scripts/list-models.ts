
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey!);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    console.log(`- ${modelName}: SUCCESS`);
    return true;
  } catch (error) {
    console.log(`- ${modelName}: FAILED - ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function runTests() {
  console.log('--- STARTING GEMINI GENERATION TEST ---');
  await testModel('gemini-flash-latest');
  console.log('--- TEST COMPLETE ---');
}

runTests();
