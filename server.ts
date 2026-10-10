import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for task complexity estimation
app.post('/api/estimate-complexity', async (req, res) => {
  const { title, description, requiredSkill } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // If Gemini API is configured, use gemini-3.8-flash
  if (ai) {
    try {
      const prompt = `You are an expert technical advisor for student engineering and computer science team projects.
Analyze the following project task and estimate its complexity and realistic hours of effort for an undergraduate student:
Task Title: "${title}"
Task Description: "${description || 'None provided'}"
Required Skill Category: "${requiredSkill || 'General'}"

Return JSON matching:
- complexity: exactly "Low", "Medium", or "High"
- estimatedHours: realistic hours (e.g., Low: 1-3 hrs, Medium: 4-8 hrs, High: 9-16 hrs)
- reasoning: short, friendly 1-2 sentence explanation tailored for a student team`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              complexity: {
                type: Type.STRING,
                description: 'Complexity rating: Low, Medium, or High',
              },
              estimatedHours: {
                type: Type.NUMBER,
                description: 'Estimated hours needed to complete the task',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Short explanation of why this complexity was chosen',
              },
            },
            required: ['complexity', 'estimatedHours', 'reasoning'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const validComplexity = ['Low', 'Medium', 'High'].includes(parsed.complexity)
        ? (parsed.complexity as 'Low' | 'Medium' | 'High')
        : 'Medium';
      const validHours = Math.max(1, Math.min(30, Math.round(Number(parsed.estimatedHours) || 4)));

      return res.json({
        complexity: validComplexity,
        estimatedHours: validHours,
        reasoning: parsed.reasoning || 'AI estimated based on typical student project implementation scope.',
        source: 'ai',
      });
    } catch (err: any) {
      console.warn('Gemini estimation failed, falling back to heuristic:', err?.message);
    }
  }

  // Fallback heuristic estimation when AI is unavailable or fails
  const lower = `${title} ${description || ''}`.toLowerCase();
  let complexity: 'Low' | 'Medium' | 'High' = 'Medium';
  let hours = 4;
  let reason = 'Heuristic estimate based on standard scope for this task category.';

  if (
    lower.includes('research') ||
    lower.includes('slide') ||
    lower.includes('presentation') ||
    lower.includes('readme') ||
    lower.includes('setup env') ||
    lower.includes('meeting') ||
    lower.includes('review') ||
    lower.includes('icon') ||
    lower.includes('copy')
  ) {
    complexity = 'Low';
    hours = 2;
    reason = 'Low complexity: Documentation, asset curation, or meeting preparation.';
  } else if (
    lower.includes('train') ||
    lower.includes('model') ||
    lower.includes('neural') ||
    lower.includes('pipeline') ||
    lower.includes('database schema') ||
    lower.includes('auth') ||
    lower.includes('backend api') ||
    lower.includes('deploy') ||
    lower.includes('full-stack') ||
    lower.includes('integration test')
  ) {
    complexity = 'High';
    hours = 10;
    reason = 'High complexity: Architectural setup, core algorithmic logic, or extensive debugging.';
  } else {
    complexity = 'Medium';
    hours = 5;
    reason = 'Medium complexity: Feature development, component building, or testing.';
  }

  return res.json({
    complexity,
    estimatedHours: hours,
    reasoning: reason,
    source: 'heuristic',
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FairShare Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
