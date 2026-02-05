import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper: Try Gemini, then fallback to Groq
async function generateContentWithFallback(systemPrompt, responseMimeType = "text/plain") {
  let geminiError = null;

  // 1. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const config = {};
      if (responseMimeType === "application/json") {
        config.responseMimeType = "application/json";
      }

      // Simple retry logic for Gemini
      for (let i = 0; i < 3; i++) {
        try {
          // CORRECT SDK USAGE for @google/genai used in previous steps
          const response = await ai.models.generateContent({
             model: "gemini-2.0-flash",
             contents: systemPrompt,
             config: config
          });
          return response.text; // Note: .text is a property, not a function in some versions, or method. Checking previous usage.
        } catch (err) {
          if (err.status === 429 && i < 2) {
             console.log(`Gemini 429. Retrying... ${i+1}`);
             await new Promise(r => setTimeout(r, 1000 * (i+1)));
             continue;
          }
          throw err;
        }
      }
    } catch (err) {
      console.error("Gemini failed:", err.message);
      geminiError = err;
    }
  }

  // 2. Try Groq Fallback
  if (process.env.GROQ_API_KEY) {
    console.log("Falling back to Groq...");
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: systemPrompt + (responseMimeType === "application/json" ? "\n\nRETURN JSON ONLY." : "")
          },
        ],
        model: "llama-3.3-70b-versatile", // UPDATED MODEL
        response_format: responseMimeType === "application/json" ? { type: "json_object" } : undefined
      });

      return completion.choices[0]?.message?.content || "";
    } catch (groqErr) {
      console.error("Groq fallback also failed:", groqErr.message);
    }
  }

  throw new Error("All AI providers failed. " + (geminiError ? geminiError.message : ""));
}

// Helper: Clean JSON string
function cleanJson(str) {
  if (!str) return str;
  // Remove markdown code blocks
  let cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
  // Attempt to extract JSON object/array if it's surrounded by text
  const firstOpen = cleaned.indexOf('{');
  const firstArray = cleaned.indexOf('[');
  
  if (firstOpen !== -1 || firstArray !== -1) {
    const isArray = firstArray !== -1 && (firstOpen === -1 || firstArray < firstOpen);
    const start = isArray ? firstArray : firstOpen;
    const end = isArray ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
    if (end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
    }
  }
  return cleaned;
}

export const generateTasks = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const systemPrompt = `
      You are an expert project manager and productivity coach. I will give you a goal.
      Break this goal down into a logical sequence of concrete, actionable steps (tasks).
      
      Guidelines:
      1. Create between 3 to 8 tasks, depending on complexity.
      2. Ensure tasks are atomic (can be completed in one sitting).
      3. Use clear, action-oriented titles (start with a verb).
      4. Assign realistic priorities.
      5. Suggest a due date offset (days from now) for each task to spread them out logically.
      
      Return ONLY a raw JSON array. Do not wrap it in markdown or code blocks.
      
      Structure for each task object:
      - title: string (Action-oriented, max 60 chars)
      - description: string (Why this is important and how to do it)
      - priority: "High" | "Medium" | "Low"
      - dueDateOffset: number (0 for today, 1 for tomorrow, etc.)
      
      Goal: "${prompt}"
    `;

    const text = await generateContentWithFallback(systemPrompt, "application/json");
    console.log("Generate Tasks Raw Output:", text); // Debug log
    const cleaned = cleanJson(text);
    console.log("Cleaned JSON:", cleaned); // Debug log
    let tasks = JSON.parse(cleaned);
    
    // Handle case where AI wraps array in an object (e.g. { "tasks": [...] })
    if (!Array.isArray(tasks) && tasks.tasks && Array.isArray(tasks.tasks)) {
        tasks = tasks.tasks;
    }
    
    res.json(tasks);

  } catch (error) {
    console.error("AI Generation Critical Error:", error);
    res.status(500).json({ message: "Failed to generate tasks", error: error.message });
  }
};

export const enrichTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const systemPrompt = `
      You are a task management expert. Analyze the task below and provide smart suggestions.
      
      Task Title: ${title}
      Description: ${description || 'No description'}
      
      Analyze and suggest:
      1. Priority: "High", "Medium", or "Low" (based on urgency keywords like "urgent", "asap", "critical", "bug", "fix")
      2. Tags: Array of 1-3 relevant tags from: Bug, Feature, Design, Auth, Frontend, Backend, API, UI, UX, Database, Testing, Documentation, Critical, Enhancement
      3. DueDateOffset: Number of days from today (e.g., 1 for urgent, 3 for normal, 7 for long-term)
      4. Confidence: 0.0 to 1.0 score for how confident you are
      
      Return ONLY valid JSON in this exact format:
      {
        "priority": "High",
        "tags": ["Bug", "Critical"],
        "dueDateOffset": 1,
        "confidence": 0.95
      }
    `;

    const text = await generateContentWithFallback(systemPrompt, "application/json");
    const suggestions = JSON.parse(cleanJson(text));
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (suggestions.dueDateOffset || 3));
    
    res.json({
      suggestions: {
        priority: suggestions.priority,
        tags: suggestions.tags,
        dueDate: dueDate.toISOString().split('T')[0],
        confidence: suggestions.confidence
      }
    });

  } catch (error) {
    console.error("AI Enrichment Error:", error);
    res.status(500).json({ message: "Failed to enrich task", error: error.message });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const { query } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `
      You are a search query parser. Convert natural language queries into MongoDB filter objects.
      
      Today's date: ${currentDate}
      
      Available fields:
      - priority: "High", "Medium", or "Low"
      - status: "To Do", "In Progress", or "Completed"
      - dueDate: ISO date string (use $gte, $lte for ranges)
      - title: string (use $regex with $options: "i" for case-insensitive search)
      
      User Query: "${query}"
      
      Examples:
      - "high priority tasks" → {"priority": "High"}
      - "tasks due this week" → {"dueDate": {"$gte": "2026-02-03", "$lte": "2026-02-09"}}
      - "overdue tasks" → {"dueDate": {"$lt": "${currentDate}"}}
      - "bugs in login" → {"title": {"$regex": "login", "$options": "i"}, "tags": "Bug"}
      
      Return ONLY valid JSON in this exact format:
      {
        "filters": { <MongoDB filter object> },
        "interpretation": "Human-readable description of what you're searching for"
      }
      
      If the query is ambiguous, make your best guess.
    `;

    const text = await generateContentWithFallback(systemPrompt, "application/json");
    const result = JSON.parse(cleanJson(text));
    res.json(result);

  } catch (error) {
    console.error("AI Search Error:", error);
    res.status(500).json({ message: "Failed to process search", error: error.message });
  }
};

export const enrichLink = async (req, res) => {
  let metadata = { title: '', description: '', image: '', favicon: '' };

  try {
    const { url } = req.body;
    
    // 1. Scrape
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      const $ = cheerio.load(data);
      metadata.title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      metadata.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      metadata.image = $('meta[property="og:image"]').attr('content') || '';
      const linkIcon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
      if (linkIcon) metadata.favicon = new URL(linkIcon, url).href;
    } catch (scrapeError) {
      console.log("Scraping failed:", scrapeError.message);
    }

    // 2. AI Enrichment with Fallback
    const systemPrompt = `
      Analyze this URL and metadata to generate a "Cool" and "Engaging" summary.
      
      URL: ${url}
      Scraped Title: ${metadata.title}
      Scraped Description: ${metadata.description}
      
      Tasks:
      1. Category: Determine the BEST category. You can use standard tags (Social, News, Tools) BUT if the content is niche, CREATE a specific one (e.g., "Prediction Market", "Crypto", "AI", "Recipes"). Be specific!
      2. Generate a NEW Title: 
         - IF Category is "News" or similar: Keep it professional, factual, and close to the original headline. Don't be "cool".
         - ELSE: Make it "Cool", "Punchy", and "Modern" (Max 7 words). Remove words like "Betting Odds", "Predictions", "Market".
         - Focus on the EVENT or TOPIC.
      3. Description: Write a single, interesting sentence that captures the essence.
      
      Return JSON:
      {
        "title": "Final Title",
        "description": "Final Description",
        "category": "Category",
        "image": "${metadata.image}" 
      }
    `;

    try {
      const text = await generateContentWithFallback(systemPrompt, "application/json");
      const result = JSON.parse(cleanJson(text));
      
      if (!result.image && metadata.image) result.image = metadata.image;
      res.json(result);

    } catch (aiError) {
      console.error("AI failed, returning scraped data:", aiError.message);
      res.json({
        title: metadata.title || 'New Link',
        description: metadata.description,
        image: metadata.image,
        category: 'Other'
      });
    }

  } catch (error) {
    console.error("Link Enrichment Critical Error:", error);
    res.status(500).json({ message: "Failed to enrich link", error: error.message });
  }
};

export const generateBriefing = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Time-based greeting with context
    let timeGreeting = "Good morning";
    let timeContext = "Start your day strong";
    if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
      timeContext = "Keep the momentum going";
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Good evening";
      timeContext = "Wrap up your day well";
    } else if (hour >= 21 || hour < 5) {
      timeGreeting = "Working late";
      timeContext = "Don't forget to rest";
    }

    if (!tasks || tasks.length === 0) {
      return res.json({
        greeting: `${timeGreeting}! ☀️`,
        summary: "Your task list is empty. Add your first task to get started with personalized productivity insights!",
        focusTask: null,
        insight: null,
        stats: { total: 0, overdue: 0, dueToday: 0, highPriority: 0, completed: 0, inProgress: 0 },
        productivity: { score: 0, trend: 'neutral' }
      });
    }

    // Calculate comprehensive stats
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const stats = {
      total: tasks.length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed').length,
      dueToday: tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === today && t.status !== 'Completed').length,
      dueTomorrow: tasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate.toISOString().split('T')[0] === tomorrow.toISOString().split('T')[0];
      }).length,
      dueThisWeek: tasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= now && dueDate <= nextWeek;
      }).length,
      highPriority: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      toDo: tasks.filter(t => t.status === 'To Do').length
    };

    // Calculate productivity score (0-100)
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const overdueImpact = stats.overdue > 0 ? Math.min(stats.overdue * 10, 30) : 0;
    const productivityScore = Math.max(0, Math.min(100, completionRate - overdueImpact + (stats.inProgress > 0 ? 10 : 0)));
    
    // Determine productivity trend
    let productivityTrend = 'neutral';
    if (productivityScore >= 70) productivityTrend = 'excellent';
    else if (productivityScore >= 50) productivityTrend = 'good';
    else if (productivityScore < 30) productivityTrend = 'needs_attention';

    // Smart task prioritization for focus task
    const incompleteTasks = tasks
      .filter(t => t.status !== 'Completed')
      .map(t => ({
        ...t,
        urgencyScore: calculateUrgencyScore(t, now)
      }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Get top tasks for AI analysis (limit to 8 for token efficiency)
    const topTasks = incompleteTasks.slice(0, 8);
    
    const systemPrompt = `
You are a world-class productivity coach. Analyze the user's tasks and provide a personalized, actionable daily briefing.

CONTEXT:
- Day: ${dayOfWeek}
- Time: ${timeGreeting} (${timeContext})
- Date: ${today}

TASK STATISTICS:
- Open tasks: ${stats.total - stats.completed}
- Overdue: ${stats.overdue} ${stats.overdue > 0 ? '⚠️ URGENT' : ''}
- Due today: ${stats.dueToday}
- Due tomorrow: ${stats.dueTomorrow}
- Due this week: ${stats.dueThisWeek}
- High priority: ${stats.highPriority}
- In progress: ${stats.inProgress}
- Completed: ${stats.completed}
- Productivity score: ${productivityScore}/100

TASKS (sorted by urgency):
${JSON.stringify(topTasks.map(t => ({ 
  _id: t._id, 
  title: t.title, 
  priority: t.priority, 
  status: t.status,
  dueDate: t.dueDate,
  urgencyScore: t.urgencyScore
})), null, 2)}

PROVIDE:
1. A personalized 2-sentence briefing that:
   - Acknowledges their current situation (overdue items, workload, progress)
   - Gives a specific, actionable recommendation
   - Feels warm and motivating, not robotic
   
2. Select the SINGLE most important task to focus on (by _id) based on:
   - Overdue items take highest priority
   - Then high priority items due soon
   - Then items already in progress
   
3. One brief productivity insight or tip relevant to their situation (max 15 words)

RESPONSE FORMAT (JSON only):
{
  "summary": "Your personalized 2-sentence briefing here",
  "focusTaskId": "the_task_id_to_focus_on",
  "insight": "Brief productivity tip or insight",
  "emoji": "single relevant emoji for greeting"
}`;

    try {
      const text = await generateContentWithFallback(systemPrompt, "application/json");
      const result = JSON.parse(cleanJson(text));
      
      // Find focus task with fallback logic
      let focusTask = tasks.find(t => t._id === result.focusTaskId);
      if (!focusTask && incompleteTasks.length > 0) {
        // Fallback: pick the highest urgency task
        focusTask = incompleteTasks[0];
      }

      res.json({
        greeting: `${timeGreeting}! ${result.emoji || '✨'}`,
        summary: result.summary,
        focusTask: focusTask ? { 
          _id: focusTask._id, 
          title: focusTask.title, 
          priority: focusTask.priority,
          dueDate: focusTask.dueDate,
          status: focusTask.status
        } : null,
        insight: result.insight || null,
        stats,
        productivity: {
          score: productivityScore,
          trend: productivityTrend
        }
      });

    } catch (aiError) {
      console.error("AI Briefing failed:", aiError.message);
      
      // Enhanced fallback with smart messaging
      const focusTask = incompleteTasks[0];
      let fallbackSummary = "";
      
      if (stats.overdue > 0) {
        fallbackSummary = `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} that need immediate attention. Let's tackle them one at a time.`;
      } else if (stats.dueToday > 0) {
        fallbackSummary = `${stats.dueToday} task${stats.dueToday > 1 ? 's are' : ' is'} due today. Focus on completing ${stats.dueToday === 1 ? 'it' : 'the most important one'} first.`;
      } else if (stats.highPriority > 0) {
        fallbackSummary = `You have ${stats.highPriority} high priority task${stats.highPriority > 1 ? 's' : ''} to work on. ${timeContext}!`;
      } else if (stats.inProgress > 0) {
        fallbackSummary = `You have ${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress. Great momentum—keep going!`;
      } else {
        fallbackSummary = `You have ${stats.total - stats.completed} tasks ahead. Pick one and make progress!`;
      }

      res.json({
        greeting: `${timeGreeting}! ☀️`,
        summary: fallbackSummary,
        focusTask: focusTask ? { 
          _id: focusTask._id, 
          title: focusTask.title, 
          priority: focusTask.priority,
          dueDate: focusTask.dueDate,
          status: focusTask.status
        } : null,
        insight: stats.overdue > 0 ? "Start with overdue tasks to reduce stress" : "Small wins build momentum",
        stats,
        productivity: {
          score: productivityScore,
          trend: productivityTrend
        }
      });
    }

  } catch (error) {
    console.error("Briefing Generation Error:", error);
    res.status(500).json({ message: "Failed to generate briefing", error: error.message });
  }
};

// Helper function to calculate task urgency score
function calculateUrgencyScore(task, now) {
  let score = 0;
  
  // Priority scoring
  if (task.priority === 'High') score += 30;
  else if (task.priority === 'Medium') score += 15;
  else score += 5;
  
  // Due date scoring
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      // Overdue - highest urgency
      score += 50 + Math.min(Math.abs(daysUntilDue) * 5, 30);
    } else if (daysUntilDue === 0) {
      // Due today
      score += 40;
    } else if (daysUntilDue === 1) {
      // Due tomorrow
      score += 25;
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      score += 15;
    } else if (daysUntilDue <= 7) {
      // Due within a week
      score += 5;
    }
  }
  
  // Status scoring - in progress tasks get a boost
  if (task.status === 'In Progress') score += 10;
  
  return score;
}
