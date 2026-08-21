export interface Project {
  id: string;
  num: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  img: string;
  ratio: number;
  highlight?: string;
  metrics?: string;
}

export interface SkillCategory {
  num: string;
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface EducationItem {
  period: string;
  degree: string;
  institution: string;
  location: string;
  details?: string;
}

export const personalInfo = {
  name: "Sivabalan D",
  role: "AI Applications Engineer & Full Stack Developer",
  title: "Information Technology Student",
  location: "Karaikal & Puducherry, India",
  email: "siva38938@gmail.com",
  phone: "+91 8072055892",
  github: "https://github.com/sivabalan-05",
  linkedin: "https://www.linkedin.com/in/sivabalan-05d",
  twitter: "https://x.com/sivabalan___",
  resumeUrl: "https://drive.google.com/file/d/1TQAiO3Slwics3pcjxg0vv22AwKpvR9lf/view?usp=share_link",
  status: "available for work",
  statusSub: "open to web development & AI engineering internships and roles",
  heroHeadlines: [
    ["Building responsive web applications,", "and AI solutions with PyTorch & FastAPI [[ :3 ]]"],
    ["Architecting full-stack systems,", "with React, Spring Boot, MySQL & modern UI [[ :) ]]"],
    ["Developing intelligent security platforms,", "from Zero Trust scoring to IoT controllers [[ ^_^ ]]"],
    ["Bridging clean Python & Java code", "with scalable, accessible web architectures [[ :D ]]"],
    ["Engineering scalable software systems,", "and solving real-world problems with code [[ ;) ]]"],
  ],
  bio: "Motivated Information Technology student with experience in web development, AI applications, and full-stack development. Skilled in Python, Java, React, FastAPI, PyTorch, and modern web technologies with a passion for building scalable software, responsive interfaces, and intelligent systems.",
  aboutExtended: "Pursuing B.Tech in Information Technology at Manakula Vinayagar Institute of Technology, Puducherry. I specialize in building end-to-end applications—ranging from AI-powered Zero Trust Network Access systems with adaptive trust scoring to IoT environmental controllers and interactive healthcare consultation web platforms.",
  whatIWorkOn: [
    "Real-time AI & Computer Vision systems using Python, DeepFace, OpenCV & PyTorch",
    "Full-stack web applications with React.js, FastAPI, Bootstrap & modern styling",
    "Database design, relational modeling & query optimization with PostgreSQL & MySQL",
    "Interactive UI/UX design, intelligent assistant integration & responsive web workflows",
  ],
};

export const marqueeSkills = [
  "Python",
  "Java",
  "React.js",
  "FastAPI",
  "PyTorch",
  "Spring Boot",
  "MySQL",
  "JavaScript",
  "HTML5 & CSS3",
  "Bootstrap",
  "Git & GitHub",
];

export const skillCategories: SkillCategory[] = [
  {
    num: "01",
    category: "Programming Languages",
    skills: ["Python", "Java", "JavaScript (ES6+)", "SQL"],
  },
  {
    num: "02",
    category: "Web Development",
    skills: ["React.js", "HTML5", "CSS3", "Bootstrap", "Responsive UI/UX", "Next.js"],
  },
  {
    num: "03",
    category: "AI & Machine Learning",
    skills: ["DeepFace", "PyTorch", "HuggingFace Transformers", "OpenCV", "FastAPI", "Computer Vision"],
  },
  {
    num: "04",
    category: "Databases & Tools",
    skills: ["PostgreSQL", "MySQL", "Git", "GitHub", "XAMPP", "VS Code"],
  },
  {
    num: "05",
    category: "Core Computer Science",
    skills: ["Object-Oriented Programming (OOPS)", "DBMS", "Operating Systems", "Data Structures"],
  },
  {
    num: "06",
    category: "Languages",
    skills: ["English (Professional)", "Tamil (Native)", "German (Beginner)"],
  },
];

export const constellationSkills = [
  { label: "ai & ml", detail: "PyTorch, FastAPI, adaptive scoring & anomaly detection" },
  { label: "web dev", detail: "React.js, responsive HTML5/CSS3, Bootstrap & clean UI" },
  { label: "backend", detail: "Python, Spring Boot, JWT authentication & RESTful APIs" },
  { label: "databases", detail: "MySQL relational design, schema modeling & SQL queries" },
  { label: "iot & systems", detail: "Microcontrollers, PWM speed control & sensor telemetry" },
  { label: "core cs", detail: "OOPS, DBMS, Operating Systems & Zero Trust architecture" },
];

export const projects: Project[] = [
  {
    id: "ai-emotion-recognition",
    num: "01",
    title: "AI Emotion Recognition System",
    category: "AI / Deep Learning & Computer Vision",
    tagline: "Full-stack AI app detecting emotions in real time from facial expressions and text input.",
    description: "Built a full-stack AI application that detects human emotions in real time from facial expressions and text input using deep learning. Leveraged computer vision models for multi-face detection, landmark extraction, and emotion classification with high accuracy.",
    technologies: ["Python", "FastAPI", "DeepFace", "PyTorch", "HuggingFace Transformers", "React.js", "OpenCV"],
    githubUrl: "https://github.com/sivabalan-05/emotion-recognition-ai",
    liveUrl: "https://github.com/sivabalan-05/emotion-recognition-ai",
    img: "/img/em.png",
    ratio: 0.5625,
    highlight: "Real-time facial & text sentiment inference",
    metrics: "Sub-second inference latency with OpenCV & DeepFace pipeline.",
  },
  {
    id: "slam-fitness",
    num: "02",
    title: "SLAM FITNESS Platform with AI Assistant",
    category: "Full Stack Web & AI Assistant",
    tagline: "Responsive fitness center web platform with integrated SLAM AI assistant.",
    description: "Designed and developed a responsive, modern fitness center website featuring dedicated sections for Services, Membership Pricing, Reviews, and an integrated interactive SLAM AI assistant to guide users through fitness plans.",
    technologies: ["HTML5", "CSS3", "JavaScript", "AI Assistant", "Responsive UI/UX"],
    githubUrl: "https://github.com/sivabalan-05/slam-fitness",
    liveUrl: "https://github.com/sivabalan-05/slam-fitness",
    img: "/img/sl.png",
    ratio: 0.667,
    highlight: "Interactive SLAM AI fitness assistant",
    metrics: "Optimized mobile responsiveness & interactive UI components.",
  },
  {
    id: "trust-shield-ai",
    num: "03",
    title: "Trust Shield AI: Explainable Zero Trust Access",
    category: "AI / Cyber Security & Full Stack",
    tagline: "AI-powered Zero Trust Network Access (ZTNA) system with adaptive trust scoring.",
    description: "Developed an AI-powered Zero Trust Network Access (ZTNA) system with adaptive trust scoring for continuous user, device, and session verification. Built a dynamic trust scoring engine evaluating user behavior, device fingerprinting, login context, and risk analysis. Integrated multi-factor authentication (MFA), JWT-based authentication, real-time anomaly detection, and role-based access control.",
    technologies: ["Python", "PyTorch", "FastAPI", "Spring Boot", "React.js", "PostgreSQL", "JWT"],
    githubUrl: "https://github.com/sivabalan-05",
    liveUrl: "https://github.com/sivabalan-05",
    img: "/img/ztna.png",
    ratio: 0.5625,
    highlight: "Adaptive trust scoring & anomaly detection",
    metrics: "Continuous multi-factor authentication & context-aware access verification.",
  },

  {
    id: "smart-fan-iot",
    num: "04",
    title: "Temperature-Based Fan Controller (IoT)",
    category: "IoT & Embedded Automation",
    tagline: "Smart IoT fan controller automatically adjusting speed based on real-time temperature.",
    description: "Developed an IoT-based smart fan controller that automatically adjusts fan speed based on real-time ambient temperature to improve energy efficiency and comfort. Integrated temperature sensors with a microcontroller and PWM control with real-time sensor data monitoring and threshold automation.",
    technologies: ["C++", "Microcontrollers", "PWM", "IoT Sensors", "Embedded Systems"],
    githubUrl: "https://github.com/sivabalan-05",
    liveUrl: "https://github.com/sivabalan-05",
    img: "/img/iot.png",
    ratio: 0.5625,
    highlight: "Dynamic PWM speed modulation & sensor telemetry",
    metrics: "Automated threshold monitoring for optimal thermal efficiency.",
  },

];

export const experienceList: ExperienceItem[] = [
  {
    period: "Jun 2025 — Jul 2025",
    role: "No Code Web Development Intern",
    company: "Gari Tech",
    location: "Karaikal / Puducherry, India",
    description: "Gained hands-on experience with WordPress and SEO principles; redesigned client website using Elementor on XAMPP and crafted a Booking System project to streamline online reservations.",
    achievements: [
      "Redesigned client website using Elementor on XAMPP with focus on responsive user experience.",
      "Crafted an interactive Booking System project to streamline online reservations and scheduling.",
      "Applied on-page SEO principles to enhance web structure and search discoverability.",
    ],
    technologies: ["WordPress", "Elementor", "XAMPP", "PHP", "MySQL", "SEO"],
  },
  {
    period: "Nov 2024 — Jan 2025",
    role: "Web Development Intern",
    company: "Ruddo",
    location: "Karaikal / Puducherry, India",
    description: "Constructed responsive, user-friendly websites using HTML, CSS, JavaScript, and Bootstrap with a strong focus on real-world UI/UX design.",
    achievements: [
      "Constructed responsive web interfaces using HTML, CSS, JavaScript, and Bootstrap.",
      "Successfully completed a full-stack project on Online Doctor Consultation.",
      "Ensured cross-browser compatibility and optimized front-end layout styling.",
    ],
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "React", "MySQL"],
  },
];

export const educationList: EducationItem[] = [
  {
    period: "2023 — Expected 2027",
    degree: "B.Tech in Information Technology",
    institution: "Manakula Vinayagar Institute of Technology",
    location: "Puducherry, India",
    details: "GPA: 7.4 · Focus on Web Development, AI Applications, Full-Stack Engineering, and Problem-Solving.",
  },
  {
    period: "Completed 2023",
    degree: "Class 12 (HSC) — Higher Secondary",
    institution: "SRVS National Higher Secondary School",
    location: "Karaikal, India",
    details: "Score: 64% · Focus on Mathematics, Physics, Chemistry, and Computer Science.",
  },
  {
    period: "Completed 2020",
    degree: "Class 10 (SSLC) — Secondary School",
    institution: "SRVS National Higher Secondary School",
    location: "Karaikal, India",
    details: "Pass Certificate · Foundation in Science, Mathematics, and Languages.",
  },
];
