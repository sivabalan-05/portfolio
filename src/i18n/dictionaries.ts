export type Lang = "pt" | "en";

const dictionaries = {
  en: {
    // Nav
    nav_work: "Projects",
    nav_experiments: "Experiments",
    nav_cta: "Get in Touch",

    // Categories
    cat_freela: "client",
    cat_college: "open source",
    cat_collab: "collaboration",
    cat_client: "enterprise",
    cat_company: "production",
    cat_autoral: "personal",

    // Hero
    hero_location: "INDIA",
    hero_title_1: "Software engineering, full-stack systems",
    hero_title_highlight: "& creative technology.",
    hero_sub_1: "Full Stack Developer & Creative Technologist",
    hero_sub_highlight: "Sivabalan",

    // Selected Work
    selected_work: "Selected Projects",
    view_project: "View Project",
    rm_scroll: "scroll to explore ↓",
    rm_tools_label: "Core Stack",
    rm_welcome: "welcome to my digital workshop ✳",
    rm_menu_about: "about",
    rm_menu_contact: "contact",
    pj_home: "home",
    pj_back: "back",

    // About
    about_title: "about me",
    about_text: "Building high-performance web applications, intelligent backend architectures, and delightful interactive interfaces.",
    about_cat_web: "Full Stack Development",
    about_nano_sub: "Engineering",
    about_laid_sub: "Architecture",

    // Tags & Placeholders
    p01_tag1: "Next.js",
    p01_tag2: "TypeScript",
    p02_tag1: "React",
    p02_tag2: "Node.js",
    p03_tag1: "Distributed Systems",
    p03_tag2: "AI / ML",
    p04_tag1: "Cloud / DevOps",
    p04_tag2: "PostgreSQL",
    p05_tags: "Web Applications, APIs",
    p06_tags: "Frontend, UI Engineering",
    p07_tags: "Backend, Cloud Systems",
    p08_tags: "Creative Coding, WebGL",
    p09_tags: "System Architecture",

    // Footer
    footer_cv: "Resume",
    rm_footer_made: "built with Next.js, TypeScript & ASCII craft",

    // Metadata
    meta_description: "Personal portfolio of Sivabalan. Full Stack Developer, Software Engineer, and Creative Technologist.",
  },

  pt: {
    // Mirroring clean English values
    nav_work: "Projects",
    nav_experiments: "Experiments",
    nav_cta: "Get in Touch",
    cat_freela: "client",
    cat_college: "open source",
    cat_collab: "collaboration",
    cat_client: "enterprise",
    cat_company: "production",
    cat_autoral: "personal",
    hero_location: "INDIA",
    hero_title_1: "Software engineering, full-stack systems",
    hero_title_highlight: "& creative technology.",
    hero_sub_1: "Full Stack Developer & Creative Technologist",
    hero_sub_highlight: "Sivabalan",
    selected_work: "Selected Projects",
    view_project: "View Project",
    rm_scroll: "scroll to explore ↓",
    rm_tools_label: "Core Stack",
    rm_welcome: "welcome to my digital workshop ✳",
    rm_menu_about: "about",
    rm_menu_contact: "contact",
    pj_home: "home",
    pj_back: "back",
    about_title: "about me",
    about_text: "Building high-performance web applications, intelligent backend architectures, and delightful interactive interfaces.",
    about_cat_web: "Full Stack Development",
    about_nano_sub: "Engineering",
    about_laid_sub: "Architecture",
    p01_tag1: "Next.js",
    p01_tag2: "TypeScript",
    p02_tag1: "React",
    p02_tag2: "Node.js",
    p03_tag1: "Distributed Systems",
    p03_tag2: "AI / ML",
    p04_tag1: "Cloud / DevOps",
    p04_tag2: "PostgreSQL",
    p05_tags: "Web Applications, APIs",
    p06_tags: "Frontend, UI Engineering",
    p07_tags: "Backend, Cloud Systems",
    p08_tags: "Creative Coding, WebGL",
    p09_tags: "System Architecture",
    footer_cv: "Resume",
    rm_footer_made: "built with Next.js, TypeScript & ASCII craft",
    meta_description: "Personal portfolio of Sivabalan. Full Stack Developer, Software Engineer, and Creative Technologist.",
  },
} as const;

export type DictKey = keyof typeof dictionaries.en;
export default dictionaries;
