const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
const puppeteer = require("puppeteer");
const { getInterviewReportById } = require("../../../Frontend/src/features/interview/services/interview.api");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"];

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    // Provide an exact JSON blueprint so Gemini cannot misinterpret the structure
    const prompt = `You are an expert technical interviewer. Analyze the candidate profile below and return a JSON object.

Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}

Return ONLY this exact JSON structure with no extra fields, no markdown, no explanation:

{
  "matchScore": <number 0-100>,
  "title": "<short job title>",
  "technicalQuestions": [
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" }
  ],
  "behavioralQuestions": [
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" },
    { "question": "<question text>", "intention": "<why asking>", "answer": "<ideal answer>" }
  ],
  "skillGaps": [
    { "skill": "<skill name>", "severity": "high" },
    { "skill": "<skill name>", "severity": "medium" },
    { "skill": "<skill name>", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "topic": "<topic>", "tasks": ["<task 1>", "<task 2>", "<task 3>"] },
    { "day": 2, "topic": "<topic>", "tasks": ["<task 1>", "<task 2>", "<task 3>"] },
    { "day": 3, "topic": "<topic>", "tasks": ["<task 1>", "<task 2>", "<task 3>"] },
    { "day": 4, "topic": "<topic>", "tasks": ["<task 1>", "<task 2>", "<task 3>"] },
    { "day": 5, "topic": "<topic>", "tasks": ["<task 1>", "<task 2>", "<task 3>"] }
  ]
}

Rules:
- technicalQuestions must have EXACTLY 5 objects, each with question/intention/answer strings
- behavioralQuestions must have EXACTLY 5 objects, each with question/intention/answer strings
- preparationPlan must have EXACTLY 5 objects, each with day/topic/tasks
- skillGaps must have at least 3 objects
- severity must be one of: "low", "medium", "high"
- Every field must be a non-empty string
- Return ONLY the JSON, starting with { and ending with }`;

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`\n🤖 Trying ${model} | Attempt ${attempt}/3`);

                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    // No responseSchema — let the prompt control structure
                    config: { responseMimeType: "application/json" }
                });

                const raw = response.text.replace(/```json|```/g, "").trim();
                const result = JSON.parse(raw);

                console.log("🔑 Keys received:", Object.keys(result));

                // Validate structure
                const techQ  = result.technicalQuestions;
                const behavQ = result.behavioralQuestions;
                const gaps   = result.skillGaps;
                const plan   = result.preparationPlan;

                if (!Array.isArray(techQ)  || techQ.length  === 0) throw new Error("technicalQuestions missing or empty");
                if (!Array.isArray(behavQ) || behavQ.length === 0) throw new Error("behavioralQuestions missing or empty");
                if (!Array.isArray(gaps)   || gaps.length   === 0) throw new Error("skillGaps missing or empty");
                if (!Array.isArray(plan)   || plan.length   === 0) throw new Error("preparationPlan missing or empty");

                // Sanitize each item — fill any empty strings with defaults
                const sanitizeQ = (q, i) => ({
                    question:  (q?.question  || "").trim() || `Question ${i+1}`,
                    intention: (q?.intention || "").trim() || "To assess relevant skills",
                    answer:    (q?.answer    || "").trim() || "Answer based on your experience."
                });

                const cleanTech  = techQ.slice(0, 5).map(sanitizeQ);
                const cleanBehav = behavQ.slice(0, 5).map(sanitizeQ);
                const cleanGaps  = gaps.map(s => ({
                    skill:    (s?.skill || "General Skill").trim(),
                    severity: ["low","medium","high"].includes(s?.severity) ? s.severity : "medium"
                }));
                const cleanPlan = plan.slice(0, 5).map((p, i) => ({
                    day:   typeof p?.day === "number" ? p.day : i + 1,
                    topic: (p?.topic || p?.focus || `Day ${i+1} Preparation`).trim(),
                    tasks: Array.isArray(p?.tasks) ? p.tasks.filter(t => t && t.trim()) : []
                }));

                const score = typeof result.matchScore === "number" ? result.matchScore : 70;

                console.log(`✅ SUCCESS | Score:${score} Tech:${cleanTech.length} Behav:${cleanBehav.length} Gaps:${cleanGaps.length} Plan:${cleanPlan.length}`);

                return {
                    matchScore:          score,
                    technicalQuestions:  cleanTech,
                    behavioralQuestions: cleanBehav,
                    skillGaps:           cleanGaps,
                    preparationPlan:     cleanPlan,
                    title:               (result.title || "Interview Preparation Report").trim()
                };

            } catch (error) {
                const status = error?.status || error?.error?.code;
                console.error(`❌ ${model} attempt ${attempt} | status:${status} | ${error.message?.slice(0, 150)}`);

                if ((status === 429 || status === 503) && attempt < 3) {
                    const delay = attempt * 8000;
                    console.log(`⏳ Waiting ${delay / 1000}s...`);
                    await wait(delay);
                } else {
                    break;
                }
            }
        }
    }

    console.error("🚨 All models failed — returning fallback.");
    return {
        matchScore: 72,
        title: "Full-Stack Developer Interview Prep",
        technicalQuestions: [
            { question: "Walk me through your most complex full-stack project.", intention: "Assess depth of experience and ownership", answer: "Describe the architecture, your specific contributions, challenges faced, and measurable outcomes." },
            { question: "How do you implement JWT authentication with refresh tokens?", intention: "Test backend security knowledge", answer: "Explain access token (short-lived) + refresh token stored in httpOnly cookie, rotation strategy, and blacklisting on logout." },
            { question: "How would you optimize a slow MongoDB query?", intention: "Assess database performance knowledge", answer: "Use explain(), add compound indexes, use projection to limit fields, avoid $where, consider aggregation pipeline." },
            { question: "Explain React reconciliation and when to use useMemo.", intention: "Test deep React understanding", answer: "Virtual DOM diffing, key prop importance, useMemo for expensive computations, React.memo() to prevent unnecessary re-renders." },
            { question: "How do you handle errors consistently across a Node.js REST API?", intention: "Assess production-readiness", answer: "Central error middleware, custom AppError class, consistent JSON error shape, logging with Winston, 4xx vs 5xx distinction." }
        ],
        behavioralQuestions: [
            { question: "Tell me about a disagreement with a teammate and how you resolved it.", intention: "Assess conflict resolution and communication", answer: "Use STAR: describe the situation, your role, actions taken to find common ground, and the positive result." },
            { question: "Describe a time you had to learn a new technology quickly.", intention: "Assess adaptability and self-learning", answer: "Show your process: official docs → tutorials → small experiment → applied to project." },
            { question: "Tell me about a time you missed a deadline.", intention: "Assess accountability and time management", answer: "Be honest about what happened, focus on root cause, and explain what process you changed afterward." },
            { question: "How do you prioritize when working on multiple features simultaneously?", intention: "Assess organizational skills", answer: "Discuss impact vs effort, communication with team/manager, and tools like Jira or GitHub Projects." },
            { question: "Describe your workflow from receiving a ticket to deploying to production.", intention: "Assess engineering maturity", answer: "Cover: requirements clarity, branching strategy, PR review, CI/CD pipeline, staging verification, monitoring, rollback plan." }
        ],
        skillGaps: [
            { skill: "System Design & Scalability",     severity: "high"   },
            { skill: "CI/CD & DevOps",                  severity: "medium" },
            { skill: "Message Queues (Kafka/RabbitMQ)", severity: "medium" },
            { skill: "Testing (Jest, Supertest)",        severity: "medium" }
        ],
        preparationPlan: [
            { day: 1, topic: "System Design Fundamentals", tasks: ["Study load balancing, caching, CDN, and database sharding", "Design a URL shortener end-to-end on paper", "Watch 2 system design mock interview videos"] },
            { day: 2, topic: "Advanced Node.js & MongoDB",  tasks: ["Review Event Loop phases and async patterns", "Practice MongoDB aggregation with $lookup and $facet", "Implement JWT refresh token rotation with httpOnly cookies"] },
            { day: 3, topic: "React Performance & Patterns", tasks: ["Study reconciliation, React.memo, useMemo, useCallback", "Build a feature using React Query for server state", "Review common React performance anti-patterns"] },
            { day: 4, topic: "Testing & CI/CD",             tasks: ["Write unit tests with Jest for 3 API endpoints", "Set up a GitHub Actions workflow for lint + test + build", "Review SOLID principles with real refactoring examples"] },
            { day: 5, topic: "Mock Interviews & Review",    tasks: ["Do 2 full mock technical interviews using Pramp or a peer", "Practice all behavioral questions using STAR method out loud", "Prepare 3-minute deep-dives for each resume project"] }
        ]
    };

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    // 🔥 PURE DATA CLEANING (No extra assumptions)
    const cleanData = {
        matchScore: typeof parsedData.matchScore === 'number' ? parsedData.matchScore : 70,
        title: parsedData.title || "Interview Prep Report",
        technicalQuestions: Array.isArray(parsedData.technicalQuestions) ? parsedData.technicalQuestions.filter(q => q.question !== "question") : [],
        behavioralQuestions: Array.isArray(parsedData.behavioralQuestions) ? parsedData.behavioralQuestions.filter(q => q.question !== "question") : [],
        skillGaps: Array.isArray(parsedData.skillGaps) ? parsedData.skillGaps : [],
        preparationPlan: Array.isArray(parsedData.preparationPlan) ? parsedData.preparationPlan : []
    };

    return cleanData;
    
    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport,generateResumePdf };