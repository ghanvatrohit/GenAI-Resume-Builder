# GenAI-Resume-Builder 🚀

An AI-powered full-stack platform that acts as a personalized interview strategist. It analyzes a user's resume alongside a target Job Description to generate structured interview preparation reports and dynamically creates ATS-friendly PDF resumes.

## ✨ Key Features

* **🧠 AI-Driven Analysis:** Integrates Google Gemini AI and Zod to generate structured JSON reports containing technical/behavioral questions, skill gap analyses, and day-by-day preparation roadmaps.
* **📄 Automated PDF Engine:** Utilizes Puppeteer to dynamically convert AI-tailored HTML resumes into downloadable, ATS-friendly PDF documents.
* **🔒 Robust Security:** Features a custom token-blacklisting architecture with HTTP-only cookies, JWT authentication, and Bcrypt password hashing to prevent unauthorized session access.
* **🏗️ Scalable Architecture:** Built on a 4-layer React frontend design pattern (UI, Hooks, State Context, API Services) for clean state management and optimized RESTful API communication via Axios.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* SCSS
* Axios
* React Router DOM

**Backend:**
* Node.js
* Express.js
* MongoDB & Mongoose
* Google Gemini AI API
* Zod (Schema Validation)
* Puppeteer (PDF Generation)
* JSON Web Tokens (JWT) & Bcrypt

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/) cluster or local instance
* [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
```bash
   git clone [https://github.com/ghanvatrohit/GenAI-Resume-Builder.git](https://github.com/ghanvatrohit/GenAI-Resume-Builder.git)
   cd GenAI-Resume-Builder

```

2. **Backend Setup:**

```bash
   cd Backend
   npm install

```

*Create a `.env` file in the `Backend` directory and add your variables:*

```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key

```

*Start the backend server:*

```bash
   npm run dev

```

3. **Frontend Setup:**
Open a new terminal window/tab:

```bash
   cd Frontend
   npm install
   npm run dev

```

*Navigate to `http://localhost:5173` in your browser to view the application.*

---

## 👨‍💻 About the Developer

**Rohit Ghanvat**
*B.E. in Artificial Intelligence & Data Science*

Passionate about building end-to-end ML pipelines, LLM-powered applications, and deploying robust REST APIs. Always open to discussing AI Engineering, Machine Learning, and Full-Stack Web Development opportunities.

* **LinkedIn:** [linkedin.com/in/rohitghanvat](https://www.google.com/search?q=https://linkedin.com/in/rohitghanvat)
* **GitHub:** [github.com/ghanvatrohit](https://www.google.com/search?q=https://github.com/ghanvatrohit)
* **Email:** ghanvat.rohit.ai023@gmail.com

```

```
