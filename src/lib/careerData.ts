export interface CareerQuestion {
  id: string;
  category: string;
  question: string;
  options: { label: string; tags: string[] }[];
}

export interface CareerRoadmap {
  overview: string;
  standOut: string;
  skills: { name: string; category: 'technical' | 'soft' | 'domain'; description: string }[];
  roadmap: { phase: string; title: string; items: string[] }[];
}

export interface CareerPath {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  matchTags: string[];
  avgSalary: string;
  growthRate: string;
  roadmap: CareerRoadmap;
}

export const careerQuestions: CareerQuestion[] = [
  {
    id: 'interests',
    category: 'Interests',
    question: 'Which areas excite you the most? (Select your top interests)',
    options: [
      { label: 'Technology & Coding', tags: ['tech', 'software', 'data'] },
      { label: 'Science & Research', tags: ['science', 'research', 'medical'] },
      { label: 'Business & Finance', tags: ['business', 'finance', 'management'] },
      { label: 'Arts & Design', tags: ['design', 'creative', 'media'] },
      { label: 'Social Impact & Public Service', tags: ['civil', 'social', 'teaching'] },
      { label: 'Healthcare & Medicine', tags: ['medical', 'health', 'science'] },
    ],
  },
  {
    id: 'hobbies',
    category: 'Hobbies',
    question: 'What do you enjoy doing in your free time?',
    options: [
      { label: 'Building things / Tinkering', tags: ['software', 'engineering', 'design'] },
      { label: 'Reading & Writing', tags: ['creative', 'civil', 'research'] },
      { label: 'Debating & Leading teams', tags: ['management', 'civil', 'business'] },
      { label: 'Drawing / Designing', tags: ['design', 'creative', 'media'] },
      { label: 'Solving puzzles & Math games', tags: ['data', 'software', 'finance'] },
      { label: 'Helping others / Volunteering', tags: ['social', 'medical', 'teaching'] },
    ],
  },
  {
    id: 'subjects',
    category: 'Subjects',
    question: 'Which school subjects are your favorites?',
    options: [
      { label: 'Mathematics', tags: ['data', 'software', 'finance', 'engineering'] },
      { label: 'Science (Physics/Chemistry/Bio)', tags: ['science', 'research', 'medical', 'engineering'] },
      { label: 'Computer Science', tags: ['software', 'data', 'tech'] },
      { label: 'English / Languages', tags: ['creative', 'media', 'civil'] },
      { label: 'Social Studies / History', tags: ['civil', 'social', 'research'] },
      { label: 'Economics / Business Studies', tags: ['business', 'finance', 'management'] },
    ],
  },
  {
    id: 'workstyle',
    category: 'Work Style',
    question: 'How do you prefer to work?',
    options: [
      { label: 'Solving complex problems independently', tags: ['software', 'data', 'research', 'engineering'] },
      { label: 'Collaborating with teams on projects', tags: ['management', 'design', 'business'] },
      { label: 'Creating and designing new things', tags: ['design', 'creative', 'media'] },
      { label: 'Helping and guiding people directly', tags: ['medical', 'teaching', 'social'] },
      { label: 'Organizing and leading initiatives', tags: ['civil', 'management', 'business'] },
      { label: 'Analyzing data and finding patterns', tags: ['data', 'finance', 'research'] },
    ],
  },
];

export const careerPaths: CareerPath[] = [
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    icon: 'Code2',
    tagline: 'Build applications, systems, and tools that power the digital world.',
    matchTags: ['software', 'tech', 'data'],
    avgSalary: '$95K - $180K',
    growthRate: '25% (Much faster than average)',
    roadmap: {
      overview:
        'Software engineers design, build, test, and maintain software systems. They work across web, mobile, AI, and enterprise domains, translating user needs into reliable, scalable code.',
      standOut:
        'Build a public portfolio of real projects on GitHub. Contribute to open-source, write technical blog posts, and practice system design. Internships and hackathon wins signal real-world ability.',
      skills: [
        { name: 'Python / Java', category: 'technical', description: 'Core programming languages for building applications and systems.' },
        { name: 'Data Structures & Algorithms', category: 'technical', description: 'The foundation of efficient problem-solving and coding interviews.' },
        { name: 'Git & Version Control', category: 'technical', description: 'Collaborative code management and deployment workflows.' },
        { name: 'System Design', category: 'domain', description: 'Architecting scalable, maintainable software systems.' },
        { name: 'Problem Solving', category: 'soft', description: 'Breaking down complex requirements into implementable steps.' },
        { name: 'Communication', category: 'soft', description: 'Explaining technical decisions to non-technical stakeholders.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Build Foundations',
          items: [
            'Master Python fundamentals (variables, loops, functions, OOP)',
            'Complete a free online course (CS50 or similar)',
            'Build 2-3 small projects: calculator, to-do app, simple game',
            'Create a GitHub account and push your code regularly',
          ],
        },
        {
          phase: 'Next 1-2 Years (Class XI-XII)',
          title: 'Deepen Skills',
          items: [
            'Learn data structures (arrays, linked lists, trees, graphs)',
            'Practice 50+ algorithm problems on LeetCode/Codeforces',
            'Build a full-stack web app using React + a backend framework',
            'Participate in 2+ hackathons or coding competitions',
          ],
        },
        {
          phase: 'College Prep',
          title: 'Specialize & Apply',
          items: [
            'Choose a specialization: AI/ML, web, mobile, or cloud',
            'Contribute to an open-source project',
            'Apply for summer internships at tech companies',
            'Build a portfolio website showcasing your best 3-4 projects',
          ],
        },
      ],
    },
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist',
    icon: 'BarChart3',
    tagline: 'Extract insights from data to drive decisions and build intelligent systems.',
    matchTags: ['data', 'software', 'research', 'finance'],
    avgSalary: '$90K - $160K',
    growthRate: '35% (Fastest growing)',
    roadmap: {
      overview:
        'Data scientists analyze large datasets to uncover patterns, build predictive models, and communicate insights that shape business and research decisions. They blend statistics, programming, and domain expertise.',
      standOut:
        'Publish projects on Kaggle, build an end-to-end ML pipeline, and write clear data stories. A strong portfolio with real datasets beats certifications. Learn to communicate findings visually.',
      skills: [
        { name: 'Python & Pandas', category: 'technical', description: 'The primary toolkit for data manipulation and analysis.' },
        { name: 'Statistics & Probability', category: 'domain', description: 'The mathematical foundation of all data analysis.' },
        { name: 'Machine Learning', category: 'technical', description: 'Building predictive models with scikit-learn, TensorFlow, or PyTorch.' },
        { name: 'SQL', category: 'technical', description: 'Querying and managing large datasets in databases.' },
        { name: 'Data Visualization', category: 'soft', description: 'Communicating insights through charts, dashboards, and stories.' },
        { name: 'Critical Thinking', category: 'soft', description: 'Questioning assumptions and validating findings rigorously.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Build Math & Code Base',
          items: [
            'Strengthen statistics: mean, median, variance, distributions',
            'Learn Python basics and the Pandas library',
            'Complete a Kaggle "Getting Started" competition',
            'Analyze a public dataset (e.g., Iris, Titanic) and write findings',
          ],
        },
        {
          phase: 'Next 1-2 Years (Class XI-XII)',
          title: 'Learn ML Fundamentals',
          items: [
            'Study linear algebra and probability theory',
            'Complete a machine learning course (Coursera, fast.ai)',
            'Build a prediction model: house prices, student performance',
            'Create a data visualization portfolio with 3+ dashboards',
          ],
        },
        {
          phase: 'College Prep',
          title: 'Specialize & Compete',
          items: [
            'Choose a focus: NLP, computer vision, or business analytics',
            'Publish a Kaggle notebook that reaches top 25%',
            'Apply for data analyst/scientist internships',
            'Build a capstone: end-to-end ML pipeline with a web interface',
          ],
        },
      ],
    },
  },
  {
    id: 'civil_servant',
    title: 'Civil Servant / IAS Officer',
    icon: 'Landmark',
    tagline: 'Lead public administration and shape policy that impacts millions.',
    matchTags: ['civil', 'social', 'management'],
    avgSalary: '₹56K - ₹2.5L /month',
    growthRate: 'High demand, limited selection',
    roadmap: {
      overview:
        'Civil servants work in government administration, implementing policies, managing public programs, and advising on governance. The UPSC Civil Services Exam is the primary entry route in India.',
      standOut:
        'Develop deep knowledge of current affairs, build strong writing and speaking skills, and demonstrate leadership in community initiatives. Consistent daily current affairs study is non-negotiable.',
      skills: [
        { name: 'General Studies', category: 'domain', description: 'Broad knowledge of history, geography, polity, economy, and science.' },
        { name: 'Current Affairs', category: 'domain', description: 'Daily awareness of national and international events.' },
        { name: 'Essay Writing', category: 'soft', description: 'Structured, analytical writing on complex topics.' },
        { name: 'Communication & Interview', category: 'soft', description: 'Articulate, confident responses in the personality test.' },
        { name: 'Analytical Reasoning', category: 'technical', description: 'CSAT requires logical and quantitative reasoning.' },
        { name: 'Leadership', category: 'soft', description: 'Demonstrated through extracurriculars and initiative.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Build Awareness',
          items: [
            'Read a national newspaper daily (The Hindu or Indian Express)',
            'Start NCERT reading: History, Geography, Civics (Class VI-X)',
            'Watch Rajya Sabha TV debates and policy discussions',
            'Participate in debate clubs and essay competitions',
          ],
        },
        {
          phase: 'Next 1-2 Years (Class XI-XII)',
          title: 'Deepen Knowledge',
          items: [
            'Complete NCERT books for Class XI-XII in all humanities subjects',
            'Start reading standard reference books (Laxmikanth for Polity)',
            'Practice answer writing: 1 essay per week',
            'Follow a current affairs magazine (Yojana, Kurukshetra)',
          ],
        },
        {
          phase: 'Graduation',
          title: 'Full Preparation',
          items: [
            'Choose an optional subject based on interest and scoring potential',
            'Join a test series for prelims and mains',
            'Build a daily study schedule: 6-8 hours of focused study',
            'Practice mock interviews and develop a calm, confident demeanor',
          ],
        },
      ],
    },
  },
  {
    id: 'designer',
    title: 'Product Designer',
    icon: 'Palette',
    tagline: 'Design beautiful, intuitive digital experiences that users love.',
    matchTags: ['design', 'creative', 'media'],
    avgSalary: '$70K - $140K',
    growthRate: '13% (Faster than average)',
    roadmap: {
      overview:
        'Product designers shape how digital products look, feel, and function. They combine visual design, user research, and prototyping to create interfaces that solve real user problems.',
      standOut:
        'Build a portfolio with 3-4 detailed case studies showing your process, not just final designs. Redesign an existing app with rationale. Learn Figma inside out and participate in design challenges.',
      skills: [
        { name: 'Figma / Sketch', category: 'technical', description: 'Industry-standard tools for UI/UX design and prototyping.' },
        { name: 'Design Systems', category: 'domain', description: 'Creating consistent, reusable component libraries.' },
        { name: 'User Research', category: 'domain', description: 'Understanding user needs through interviews and testing.' },
        { name: 'Visual Design', category: 'technical', description: 'Typography, color theory, layout, and visual hierarchy.' },
        { name: 'Prototyping', category: 'technical', description: 'Building interactive mockups to test ideas quickly.' },
        { name: 'Empathy', category: 'soft', description: 'Understanding and advocating for the user\'s perspective.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Learn the Tools',
          items: [
            'Master Figma through free tutorials and daily practice',
            'Study design fundamentals: typography, color, spacing, hierarchy',
            'Redesign 3 existing apps and document why you made each change',
            'Follow designers on Dribbble and Behance for inspiration',
          ],
        },
        {
          phase: 'Next 1-2 Years (Class XI-XII)',
          title: 'Build a Portfolio',
          items: [
            'Complete a UX design course (Google UX, Interaction Design Foundation)',
            'Build 2 full case studies: research → wireframe → prototype → test',
            'Participate in daily UI challenges to sharpen visual skills',
            'Learn basic HTML/CSS to understand how designs are built',
          ],
        },
        {
          phase: 'College Prep',
          title: 'Specialize & Apply',
          items: [
            'Choose a focus: mobile, web, or design systems',
            'Build a portfolio website showcasing 3-4 detailed case studies',
            'Apply for design internships or freelance projects',
            'Network with designers and seek mentorship feedback',
          ],
        },
      ],
    },
  },
  {
    id: 'doctor',
    title: 'Doctor / Medical Professional',
    icon: 'Stethoscope',
    tagline: 'Diagnose, treat, and care for patients to improve health outcomes.',
    matchTags: ['medical', 'health', 'science'],
    avgSalary: '₹8L - ₹20L /year',
    growthRate: '13% (Faster than average)',
    roadmap: {
      overview:
        'Doctors diagnose and treat illnesses, perform procedures, and guide patients toward better health. The path requires NEET qualification, an MBBS degree, and optional specialization through postgraduate study.',
      standOut:
        'Excel in biology and chemistry. Volunteer at hospitals or clinics. Develop strong communication and empathy. Stay consistent with NEET prep from Class XI — it is a marathon, not a sprint.',
      skills: [
        { name: 'Biology & Chemistry', category: 'domain', description: 'The core sciences tested in NEET and essential for medical study.' },
        { name: 'Physics', category: 'domain', description: 'Required for NEET; understanding mechanics and optics is key.' },
        { name: 'Diagnostic Reasoning', category: 'soft', description: 'Connecting symptoms to conditions through logical analysis.' },
        { name: 'Empathy & Communication', category: 'soft', description: 'Building trust with patients and their families.' },
        { name: 'Stamina & Focus', category: 'soft', description: 'Long study hours and eventually long shifts require resilience.' },
        { name: 'Manual Dexterity', category: 'technical', description: 'Fine motor skills for examinations and procedures.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Science Foundations',
          items: [
            'Master biology fundamentals: cells, genetics, human physiology',
            'Strengthen chemistry: organic, inorganic, physical basics',
            'Start NEET foundation coaching or self-study materials',
            'Maintain top grades in all science subjects',
          ],
        },
        {
          phase: 'Next 2 Years (Class XI-XII)',
          title: 'NEET Preparation',
          items: [
            'Follow the NCERT biology book — it is the NEET bible',
            'Practice 100+ MCQs daily across Physics, Chemistry, Biology',
            'Take weekly mock tests and analyze mistakes thoroughly',
            'Target NEET score in top 5% for government college admission',
          ],
        },
        {
          phase: 'MBBS & Beyond',
          title: 'Medical Education',
          items: [
            'Complete 5.5-year MBBS including 1-year internship',
            'Consider USMLE/PLAB if exploring international opportunities',
            'Choose a specialization based on interest and NEET-PG rank',
            'Develop bedside manner and patient communication skills',
          ],
        },
      ],
    },
  },
  {
    id: 'research_scientist',
    title: 'Research Scientist',
    icon: 'Microscope',
    tagline: 'Push the boundaries of human knowledge through experiments and discovery.',
    matchTags: ['science', 'research', 'data'],
    avgSalary: '$70K - $130K',
    growthRate: '8% (Average growth)',
    roadmap: {
      overview:
        'Research scientists design and conduct experiments to advance knowledge in fields like physics, biology, chemistry, and materials science. They work in universities, labs, and industry R&D departments.',
      standOut:
        'Get into a lab early. Publish or contribute to papers. Strong fundamentals in math and your chosen science are essential. Curiosity and persistence matter more than grades alone.',
      skills: [
        { name: 'Specialized Science', category: 'domain', description: 'Deep expertise in your chosen field (physics, bio, chem, etc.).' },
        { name: 'Mathematics', category: 'technical', description: 'Calculus, linear algebra, and statistics for data analysis.' },
        { name: 'Lab Techniques', category: 'technical', description: 'Hands-on experimental skills and equipment operation.' },
        { name: 'Scientific Writing', category: 'soft', description: 'Publishing findings in peer-reviewed journals.' },
        { name: 'Critical Analysis', category: 'soft', description: 'Evaluating evidence and questioning conclusions rigorously.' },
        { name: 'Programming', category: 'technical', description: 'Python or MATLAB for data analysis and simulation.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Explore & Excel',
          items: [
            'Participate in science fairs and Olympiads',
            'Read popular science books (e.g., A Brief History of Time)',
            'Excel in all science subjects and mathematics',
            'Watch online lectures: MIT OpenCourseWare, Khan Academy',
          ],
        },
        {
          phase: 'Next 2 Years (Class XI-XII)',
          title: 'Prepare for Top Colleges',
          items: [
            'Target JEE Advanced or NEET for top Indian institutes',
            'Build a strong math foundation: calculus, probability',
            'Join a science club or find a mentor in a university lab',
            'Start a small independent research project',
          ],
        },
        {
          phase: 'University',
          title: 'Research Path',
          items: [
            'Pursue a BSc at a top university with research output',
            'Join a professor\'s lab as a research assistant',
            'Publish at least one paper before graduation',
            'Apply for PhD programs at leading research institutions',
          ],
        },
      ],
    },
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur / Founder',
    icon: 'Rocket',
    tagline: 'Build companies from scratch and turn ideas into impactful products.',
    matchTags: ['business', 'management', 'design', 'tech'],
    avgSalary: 'Variable (unlimited upside)',
    growthRate: 'Self-driven',
    roadmap: {
      overview:
        'Entrepreneurs identify problems, build solutions, and create companies to deliver them. They wear many hats — product, sales, hiring, fundraising — and thrive on uncertainty and ownership.',
      standOut:
        'Start small ventures now. A lemonade stand, a school event, a YouTube channel — anything that teaches you to ship and sell. Read widely, talk to customers, and learn basic finance and sales.',
      skills: [
        { name: 'Product Thinking', category: 'domain', description: 'Identifying real problems and designing solutions people want.' },
        { name: 'Sales & Communication', category: 'soft', description: 'Persuading customers, investors, and team members.' },
        { name: 'Financial Literacy', category: 'domain', description: 'Understanding cash flow, unit economics, and fundraising.' },
        { name: 'Resilience', category: 'soft', description: 'Bouncing back from failures and staying motivated.' },
        { name: 'Basic Coding', category: 'technical', description: 'Enough to build MVPs and communicate with engineers.' },
        { name: 'Leadership', category: 'soft', description: 'Building and motivating a team toward a shared vision.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Start Small',
          items: [
            'Launch a mini-venture: sell something, organize an event, start a channel',
            'Read business books: The Lean Startup, Rich Dad Poor Dad',
            'Learn basic finance: revenue, profit, margins, cash flow',
            'Observe problems around you and brainstorm solutions',
          ],
        },
        {
          phase: 'Next 1-2 Years (Class XI-XII)',
          title: 'Build & Learn',
          items: [
            'Take a free entrepreneurship course (Y Combinator Startup School)',
            'Build a simple digital product or service',
            'Find 5 customers for any idea — validate before building',
            'Learn basic web development or no-code tools (Bubble, Webflow)',
          ],
        },
        {
          phase: 'College / Beyond',
          title: 'Scale',
          items: [
            'Join a startup to learn how companies are built',
            'Network with other founders and join an incubator',
            'Raise a small angel round or bootstrap to profitability',
            'Build a team and focus on product-market fit relentlessly',
          ],
        },
      ],
    },
  },
  {
    id: 'teacher',
    title: 'Educator / Professor',
    icon: 'GraduationCap',
    tagline: 'Shape the next generation through teaching and mentorship.',
    matchTags: ['teaching', 'social', 'research'],
    avgSalary: '₹4L - ₹15L /year',
    growthRate: '5% (Average growth)',
    roadmap: {
      overview:
        'Educators teach at schools, colleges, or online platforms, combining subject expertise with communication skills to help others learn. Professors also conduct research and publish academic work.',
      standOut:
        'Develop deep subject mastery and the ability to explain complex things simply. Start tutoring or creating educational content now. A Master\'s or PhD opens university-level roles.',
      skills: [
        { name: 'Subject Mastery', category: 'domain', description: 'Deep, current knowledge of your teaching field.' },
        { name: 'Communication', category: 'soft', description: 'Explaining concepts clearly and adapting to different learners.' },
        { name: 'Curriculum Design', category: 'domain', description: 'Structuring lessons and assessments for effective learning.' },
        { name: 'Patience & Empathy', category: 'soft', description: 'Supporting students with diverse needs and paces.' },
        { name: 'Research Skills', category: 'technical', description: 'For university roles: publishing papers and securing grants.' },
        { name: 'Public Speaking', category: 'soft', description: 'Engaging audiences in classroom and lecture settings.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Discover & Practice',
          items: [
            'Tutor younger students or peers in your strongest subject',
            'Join debate, elocution, or drama to build speaking skills',
            'Identify which subjects you love explaining most',
            'Create study guides or YouTube tutorials for classmates',
          ],
        },
        {
          phase: 'Next 2 Years (Class XI-XII)',
          title: 'Pursue Your Subject',
          items: [
            'Choose a stream aligned with your teaching interest',
            'Maintain strong grades for college admission',
            'Volunteer as a teaching assistant or at an NGO school',
            'Research B.Ed. and Master\'s pathways for your field',
          ],
        },
        {
          phase: 'Higher Education',
          title: 'Qualify & Specialize',
          items: [
            'Complete a Bachelor\'s in your subject (BSc, BA, etc.)',
            'Earn a B.Ed. for school teaching or Master\'s for college',
            'Clear CTET/TET for government school positions',
            'Pursue PhD for university professor roles',
          ],
        },
      ],
    },
  },
  {
    id: 'investment_banker',
    title: 'Investment Banker / Financial Analyst',
    icon: 'TrendingUp',
    tagline: 'Analyze markets, advise on deals, and manage capital at scale.',
    matchTags: ['finance', 'business', 'data'],
    avgSalary: '$85K - $200K+',
    growthRate: '9% (Average growth)',
    roadmap: {
      overview:
        'Investment bankers and financial analysts evaluate companies, structure deals, raise capital, and advise on mergers and acquisitions. The field demands strong quantitative skills, stamina, and commercial acumen.',
      standOut:
        'Target a top undergraduate business or economics program. Build Excel and financial modeling skills early. Internships at financial firms and strong networking are critical.',
      skills: [
        { name: 'Financial Modeling', category: 'technical', description: 'Building models to value companies and project performance.' },
        { name: 'Excel Mastery', category: 'technical', description: 'The primary tool for analysis and modeling in finance.' },
        { name: 'Economics & Accounting', category: 'domain', description: 'Understanding markets, financial statements, and valuation.' },
        { name: 'Analytical Thinking', category: 'soft', description: 'Breaking down complex financial problems quickly.' },
        { name: 'Communication', category: 'soft', description: 'Presenting analyses and pitching deals to clients.' },
        { name: 'Attention to Detail', category: 'soft', description: 'Errors in financial models can cost millions.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Build Quant Base',
          items: [
            'Excel in mathematics, especially algebra and statistics',
            'Start reading business news (Economic Times, WSJ)',
            'Learn basic Excel and create a simple budget tracker',
            'Participate in economics or business quizzes',
          ],
        },
        {
          phase: 'Next 2 Years (Class XI-XII)',
          title: 'Focus on Commerce/Economics',
          items: [
            'Choose Commerce or Economics stream',
            'Master accountancy, economics, and business studies',
            'Take a free financial modeling course online',
            'Participate in mock stock market or business plan competitions',
          ],
        },
        {
          phase: 'University',
          title: 'Target Top Programs',
          items: [
            'Pursue B.Com, BBA, or Economics at a top institution',
            'Secure internships at financial firms every summer',
            'Build a network through finance clubs and alumni',
            'Prepare for CFA Level 1 during your final year',
          ],
        },
      ],
    },
  },
  {
    id: 'journalist',
    title: 'Journalist / Content Creator',
    icon: 'PenLine',
    tagline: 'Tell stories that inform, influence, and inspire audiences.',
    matchTags: ['creative', 'media', 'civil', 'social'],
    avgSalary: '$45K - $90K',
    growthRate: '4% (Stable, shifting to digital)',
    roadmap: {
      overview:
        'Journalists and content creators research, write, and produce stories across print, digital, and video. They investigate issues, interview sources, and craft narratives that reach and move audiences.',
      standOut:
        'Start publishing now — a blog, newsletter, or YouTube channel. Build a body of work that shows your voice and range. Strong writing and multimedia skills are non-negotiable in the digital era.',
      skills: [
        { name: 'Writing & Editing', category: 'soft', description: 'Clear, engaging prose across formats and lengths.' },
        { name: 'Research & Investigation', category: 'domain', description: 'Finding, verifying, and synthesizing information from sources.' },
        { name: 'Video & Audio Production', category: 'technical', description: 'Editing for podcasts, YouTube, and social media.' },
        { name: 'Interviewing', category: 'soft', description: 'Asking the right questions and building rapport with sources.' },
        { name: 'SEO & Social Media', category: 'technical', description: 'Distributing content to reach the right audience.' },
        { name: 'Ethics & Integrity', category: 'soft', description: 'Accuracy, fairness, and transparency in reporting.' },
      ],
      roadmap: [
        {
          phase: 'Now (Class IX-X)',
          title: 'Start Creating',
          items: [
            'Start a blog, newsletter, or YouTube channel',
            'Write for your school magazine or local paper',
            'Read widely: fiction, non-fiction, and quality journalism',
            'Learn basic video editing (CapCut, Premiere Rush)',
          ],
        },
        {
          phase: 'Next 2 Years (Class XI-XII)',
          title: 'Build a Portfolio',
          items: [
            'Publish 10+ pieces across different formats and topics',
            'Build a social media presence around your niche',
            'Take a journalism or creative writing course online',
            'Interview people in your community and publish stories',
          ],
        },
        {
          phase: 'University / Beyond',
          title: 'Professional Path',
          items: [
            'Pursue Journalism, Mass Comm, or English at a top college',
            'Intern at a media outlet or digital publisher',
            'Build a specialized beat: tech, politics, sports, etc.',
            'Grow an audience and consider independent content creation',
          ],
        },
      ],
    },
  },
];

export function recommendCareers(
  selections: Record<string, string[]>,
): { career: CareerPath; matchScore: number }[] {
  const allTags: string[] = [];
  Object.values(selections).forEach((tags) => {
    if (tags) allTags.push(...tags);
  });

  const scores = careerPaths.map((career) => {
    let score = 0;
    career.matchTags.forEach((tag) => {
      score += allTags.filter((t) => t === tag).length;
    });
    return { career, matchScore: score };
  });

  return scores
    .filter((s) => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}
