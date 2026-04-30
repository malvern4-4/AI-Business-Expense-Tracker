# Chatbot-Based Project Evaluation Questionnaire (INT428)

**Student Name:** MALVERN DAVID CHIKUHWA  
**Roll Number:** 23  
**Branch & Semester:** BTECH CSE SEMESTER 2  
**Project Title:** AI BUSINESS EXPENSE TRACKER  
**Guide/Faculty Name:** ATUL KUMAR  

---

## Section A: Project Overview

**Q1. Type of Chatbot Developed**  
■ Generative (LLM-based)

**Q2. Platform Used for Deployment**  
■ Web Application

**Q3. Deployment Link / Access Details**  
**Deployment URL / App Link:** `[To be inserted after you push to GitHub Pages]`

---

## Section B: Model & API Details

**Q4. Type of API Used**  
■ Google Gemini API

**Q5. Model Name Used**  
**Model Name:** Gemini 2.5 Flash (via `@google/generative-ai`)

**Q6. Model Version**  
**Model Version / Release:** `gemini-2.5-flash`

---

## Section C: Context & Data Handling

**Q7. Contextual Memory Usage**  
■ Session-based memory  
*(Note: The AI Insights generator reads all expenses stored during the current session/month to formulate its advice).*

**Q8. Flow of Data in the Chatbot**  
1. **Input:** The user types a natural language expense (e.g., "Spent $15 on lunch") or clicks "Generate Insights".
2. **Processing (Frontend):** The vanilla JavaScript frontend (`app.js`) captures the input, appends the user's current settings (Currency, Month, Budget) and constructs a system prompt.
3. **API Call:** The app makes an asynchronous REST request to the Google Gemini API using the provided API key.
4. **Parsing & Output:** Gemini processes the data and returns a structured JSON object (for expenses) or HTML-formatted text (for insights), which is then dynamically rendered onto the DOM using CSS Grid/Glassmorphism styling without needing a backend database.

---

## Section D: Model Configuration & Behavior

**Q9. Model Parameters Used**

| Parameter | Value | Not Applicable |
| :--- | :--- | :---: |
| Temperature (Parser) | `0.1` | ☐ |
| Top-p (Parser) | `0.8` | ☐ |
| Temperature (Insights)| `0.7` | ☐ |
| Top-p (Insights) | `0.95` | ☐ |
| Input Token Limit | | ■ |
| Output Token Limit | | ■ |

*Justification: I implemented dual-model configurations. For extracting expenses, I used a low temperature (0.1) and top-p (0.8) to enforce strictly factual, deterministic JSON outputs. For the financial advisor insights, I used a higher temperature (0.7) and top-p (0.95) to allow for more creative, engaging, and varied financial advice.*

**Q10. Thinking Level & Role Assignment**  

**Thinking Level:**  
■ Intermediate (context-aware reasoning)  

**Role Assigned to Model:**  
■ Domain Expert *(Personal Financial Advisor)*

---

## Section E: Technology Stack

**Q11. Technology Stack Used**  
**Frontend:** HTML5, Vanilla JavaScript (ES Modules), CSS3 (Custom Glassmorphism UI)  
**Backend:** Serverless (Direct API integration via client-side JS)  
**Database / Vector Store:** Browser `localStorage` (NoSQL key-value store)  
**Cloud / Hosting:** GitHub Pages

---

## Section F: Implementation Evidence (Screenshots & Code)

**Q12. API Call Screenshot**  
*(Paste a screenshot of this code snippet executing successfully)*

```javascript
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1,
            topP: 0.8
        }
    });

    const prompt = `
    You are an AI assistant for a business expense tracker. 
    Analyze the following text and extract the expense details.
    Today's date is: ${new Date().toISOString().split('T')[0]}.
    The user's currency is: USD. Do not include the currency symbol in the amount.
    Text: "Bought a $120 monitor for the office today"
    ...
    `;
    const result = await model.generateContent(prompt);
```

**Q13. Chatbot Working Interface Screenshot**  
*(Take a screenshot of your beautiful AI Insights page with the generated advice, or the Dashboard showing the AI parsing an expense!)*

**Q14. GitHub Repository Link**  
**Repository URL:** `[To be inserted after GitHub push]`

---

**Declaration**  
I confirm that the information provided above is accurate to the best of my knowledge.  
**Student Signature:** MALVERN DAVID CHIKUHWA  
**Date:** 30 April 2026
