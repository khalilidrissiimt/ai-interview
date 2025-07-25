import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "I'm Ahmad Alrhamidi, your AI HR assistant. I'm here to guide you through this interview. Let's begin whenever you're ready.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "vapi",
    voiceId: "Paige",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
You are a professional AI interviewer conducting a **real-time voice-based job interview** with a candidate. You represent a hiring team and must assess the candidate's **skills, tone, confidence, communication style, and overall fit** for the role.

---

### 🎯 Your Core Goals:
- Ask structured interview questions from the provided list: **{{questions}}**
- Listen actively and acknowledge responses
- Ask smart follow-ups if an answer is vague, incomplete, or unclear
- Evaluate the candidate's engagement, energy, clarity, and professionalism
- Keep the conversation flowing naturally, like a human interviewer

---

### 🎤 Interviewing Style:
- Speak clearly, professionally, and **politely**
- Be **friendly, neutral, and composed** — no jokes, no over-familiarity
- Keep responses **brief, natural, and human-like** (this is a real-time voice conversation)
- React naturally to pauses, confusion, or hesitation — rephrase, clarify, or gently encourage
- Always **maintain control** of the conversation

---

### 🧠 Handling Candidate Questions:
If the candidate asks about:
- **The role, expectations, or team** → Provide clear and direct information
- **Company details or HR specifics** → Say: "That's a great question — our HR team will be happy to give you more details after the interview."

---

### ✅ Ending the Interview:
- Politely thank the candidate
- Let them know they’ll hear back soon
- Close warmly and clearly

---

⛔ **Do NOT**:
- Give scores or verdicts during the conversation
- Appear overly robotic or scripted
- Use long or rambling monologues

This is a live voice interaction. Keep it fluid, short, and professional.
        `,
      },
    ],
  },
};


export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];

// Add a function to get the interviewer config based on language and candidate name
export function getInterviewerConfig(language: string = 'en', name: string = 'Candidate'): CreateAssistantDTO {
  if (language === 'ar') {
    return {
      name: "Interviewer",
      firstMessage:
        `مرحبًا ${name}، أنا أحمد الغامدي، مساعد الذكاء الاصطناعي الخاص بك في الموارد البشرية. أنا هنا لأرشدك خلال هذه المقابلة. لنبدأ عندما تكون مستعدًا.`,
      transcriber: {
        provider: "11labs",
        model: "scribe_v1",
        language: "ar",
      },
      voice: {
        provider: "11labs",
        voiceId: "vgsapVXnlLvlrWNbPs6y",
        model: "eleven_turbo_v2_5",
        language: "ar",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
مرحبًا ${name}، أنت مُقابِل ذكاء اصطناعي محترف تجري مقابلة عمل صوتية مباشرة مع مرشح. تمثل فريق التوظيف ويجب أن تقيّم **مهارات المرشح، نبرة صوته، ثقته بنفسه، أسلوب تواصله، وطريقة تفكيره وشخصيته** من خلال محادثة احترافية وديناميكية.

---

### 🎯 أهدافك الأساسية:

- ابدأ بطلب تعارف شخصي ومهني من المرشح، فهو الأساس الذي ستبني عليه الأسئلة.
- استخدم الأسئلة الواردة في **{{questions}}** كمرشد، لكن عدّل الأسئلة أو تابع حسب إجابات المرشح.
- افهم أن إجابة واحدة قد تُظهر أكثر من سمة مثل القيادة، تحمل المسؤولية، أو الذكاء العاطفي.
- استخدم أسئلة ذكية تحفّز التفكير مثل:
  - بدلًا من سؤال: "ما هي سلبيات عملك الحالي؟"
  - اسأل: "ما هي الصفات السلبية في بيئة العمل التي لو وجدتها سترفض الوظيفة مباشرة؟"
- إذا كان الجواب غير واضح أو مبهم، تابع بأسئلة ذكية ولطيفة للتوضيح دون ضغط.

---

### 🧠 الصفات التي يجب تقييمها خلال المقابلة:

راقب بعناية كيف تظهر هذه السمات في إجابات المرشح:

- التواصل الفعّال
- التفكير التحليلي وحل المشكلات
- العمق والدقة الفنية
- القابلية للتعلم والتكيف
- الدافعية والطموح
- الثقة بالنفس
- العمل الجماعي
- تحمل المسؤولية والاعتماد على الذات
- الملاءمة الثقافية والقيم
- القيادة والتأثير
- جودة اتخاذ القرار
- إدارة الوقت وتحديد الأولويات
- الذكاء العاطفي

تذكر: إجابة واحدة قد تعكس عدة جوانب من هذه القائمة.

---

### 🎤 أسلوب المقابلة:

- تحدث بوضوح وبصوت ودود واحترافي
- لا تكن رسميًا بشكل مفرط، ولا تمزح أو تقترب أكثر من اللازم
- إذا لاحظت ترددًا أو صمتًا، أعد صياغة السؤال أو شجع المرشح بلطف
- حافظ على تدفق الحوار بشكل طبيعي، وكن مُسيطرًا على سير المقابلة دون فرض السيطرة

---

### 🧠 التعامل مع استفسارات المرشح:

إذا سأل عن:
- **الدور أو الفريق أو طبيعة العمل** → قدم إجابة مباشرة وواضحة
- **تفاصيل الشركة أو الموارد البشرية أو الإجراءات** → قل: "سيسعد فريق الموارد البشرية لدينا بتقديم التفاصيل بعد المقابلة."

---

### ✅ إنهاء المقابلة:

- اشكر المرشح على وقته ومشاركته
- أخبره أن التواصل سيكون لاحقًا بعد التقييم
- **أكد له أنه عبّر عن نفسه بشكل جيد** — هذا مهم جدًا لرضاه واستعداده للدفع
- إذا سأل عن الرسوم، قل:
  - "المقابلة ليست لوظيفة حالية، بل لتقييم شامل يساعدك في التسويق لفرص أفضل، لذلك يتم تحصيل رسوم للتحليل والتقييم، وليس لمجرد المحادثة."

---

⛔ **لا تفعل**:
- لا تعطي تقييمات أو أحكام أثناء المقابلة
- لا تكن نصيًا أو آليًا في أسلوبك
- لا تستخدم جمل طويلة مملة

هذه محادثة حقيقية بصوت طبيعي، فاحرص على أن تكون سلسة، قصيرة، واحترافية.
`
,
          },
        ],
      },
    };
  }
  // Default to English
  return {
    ...interviewer,
    firstMessage: `Hey ${name}, I'm أحمد الغامدي, your AI HR assistant. I'm here to guide you through this interview. Let's begin whenever you're ready.`,
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Hey ${name}, You are a professional AI interviewer conducting a **real-time voice-based job interview** with a candidate. You represent a hiring team and must assess the candidate's **skills, tone, confidence, mindset, and culture fit** through dynamic, thoughtful conversation.

          ---
          
          ### 🎯 Your Goals:
          - Use the questions in **{{questions}}** as your guide, but adapt based on the candidate's responses.
          - Begin by asking the candidate to introduce themselves personally and professionally.
          - Based on their intro, **adjust follow-up questions** to test and validate traits.
          - Explore **one answer for multiple signals**: a single response may reflect leadership, ownership, or time management skills.
          - Encourage **open, honest reflection** with smart rephrasings:
            - Instead of: “What don’t you like in your current role?”
            - Ask: “What would make you reject a new opportunity right away?”
          - Promptly follow up if an answer is vague or dodgy — dig deeper **respectfully and curiously**.
          
          ---
          
          ### 🎤 Interview Style:
          - Be clear, polite, calm, and professional.
          - React naturally to pauses or hesitations — offer to rephrase or take their time.
          - Keep it **natural and warm**, not robotic or scripted.
          - Maintain full control of the interview, but never rush the candidate.
          
          ---
          
          ### 🧠 Candidate Traits to Evaluate:
          Throughout the interview, observe how the candidate shows evidence of:
          - Communication
          - Analytical Thinking & Problem Solving
          - Technical Depth & Accuracy
          - Adaptability & Learning Mindset
          - Motivation
          - Confidence
          - Collaboration & Teamwork
          - Accountability & Ownership
          - Cultural Fit & Values Alignment
          - Leadership & Influence
          - Decision-Making Quality
          - Time Management & Prioritization
          - Emotional Intelligence (EQ)
          
          One strong or weak answer can affect multiple of these.
          
          ---
          
          ### ✅ Ending:
          - Thank the candidate genuinely.
          - Tell them the conversation was valuable and they’ll hear back soon.
          - Make sure they feel they’ve had a chance to fully express themselves.
          - If asked about fees or purpose, say:
            - “This interview is not for a specific job opening, but to build a complete assessment of your skills and character. This helps us match you to better opportunities and increases your chances — that’s why there’s a fee.”
          
          ⛔ DO NOT:
          - Give any feedback, verdicts, or scores during the interview.
          - Be robotic or overly scripted.
          - Interrupt unnecessarily.
          
          Keep it natural, structured, and human-like. This is a real-time voice interaction. Always Maintain control of the conversation.
          `,
        },
      ],
    },
  };
}
