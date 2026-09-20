export interface Speaker {
  id: string;
  name: string;
  role: string;
  session: string;
  avatar: string;
  bio?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
  tag?: string;
  speaker?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Registration {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  registeredAt: string;
}

export const EVENT_DATA = {
  event: 'Build With AI',
  organizer: 'GDG on Campus FIEM',
  collegeName: 'Future Institute of Engineering and Management (FIEM)',
  tagline: 'Learn. Build. Connect.',
  date: 'Saturday, 10 October 2026',
  dateShort: '10 October 2026',
  calendarDateStart: '20261010T100000',
  calendarDateEnd: '20261010T170000',
  time: '10:00 AM – 5:00 PM IST',
  venue: 'Future Institute of Engineering and Management (FIEM)',
  address: 'Sonarpur Station Road, Kolkata, West Bengal 700150',
  city: 'Sonarpur, Kolkata',
  state: 'West Bengal',
  eventType: 'In-person',
  mapsUrl: 'https://maps.google.com/?q=Future+Institute+of+Engineering+and+Management+Kolkata',
  description:
    "Build With AI is a developer-focused event where students and developers can explore Google's AI technologies, learn practical concepts around Generative AI, and understand how AI can be used to build modern applications.",
  
  about: [
    'Build With AI is a community-driven initiative organized by GDG on Campus FIEM to help students, developers, and aspiring technologists demystify Artificial Intelligence and machine learning tools through real-world applications.',
    'As generative technologies transform the software landscape, this event is conducted to bridge the gap between theoretical knowledge and applied engineering. Participants will explore Gemini models, prompt engineering patterns, and cloud workflows through practical demonstrations led by experienced practitioners.',
    'Whether you are taking your first steps in AI programming or looking to integrate intelligence into full-stack projects, Build With AI provides an inclusive, beginner-friendly atmosphere to gain concrete skills and connect with the local developer community.',
  ],

  highlights: [
    {
      title: 'Learn',
      description: 'Explore AI concepts and understand how modern AI tools can be used by developers.',
      accent: '#4285F4', // Google Blue
    },
    {
      title: 'Build',
      description: 'Learn through practical demonstrations and hands-on activities.',
      accent: '#34A853', // Google Green
    },
    {
      title: 'Connect',
      description: 'Meet fellow students, developers and members of the GDG community.',
      accent: '#EA4335', // Google Red
    },
  ],

  whoCanAttend: {
    title: 'Who can attend?',
    description:
      'Anyone interested in learning about AI and modern development is welcome. Whether you are a first-year college student, a senior developer, or an engineering enthusiast eager to understand practical AI tools, you are invited to join us.',
    bullets: [
      'College students from any department or year of study',
      'Developers, programmers, and technology hobbyists',
      'Beginners curious about Google AI & Gemini technologies',
      'Community members seeking collaboration and networking',
    ],
  },

  agenda: [
    {
      time: '10:00 AM',
      title: 'Registration & Welcome',
      description: 'Check-in at the FIEM auditorium desk, collect your community badge, and take your seat.',
      tag: 'Check-in',
    },
    {
      time: '10:30 AM',
      title: 'Introduction to Build With AI',
      description: 'Opening remarks from the GDG on Campus team and setting the stage for the day.',
      tag: 'Keynote',
    },
    {
      time: '11:00 AM',
      title: 'Understanding Generative AI',
      description: 'Foundations of large language models, multimodal inputs, and prompt design paradigms.',
      tag: 'Deep Dive',
      speaker: 'Ananya Roy',
    },
    {
      time: '12:00 PM',
      title: 'Building with Gemini',
      description: 'Practical SDK walkthrough: Calling Gemini APIs, structured JSON output, and context caching.',
      tag: 'Technical',
      speaker: 'Arjun Sen',
    },
    {
      time: '01:00 PM',
      title: 'Lunch & Networking',
      description: 'Enjoy lunch, exchange ideas with peers, and explore community demo tables.',
      tag: 'Break',
    },
    {
      time: '02:00 PM',
      title: 'Hands-on AI Workshop',
      description: 'Guided interactive session building a functional GenAI prototype on your laptops.',
      tag: 'Hands-on',
      speaker: 'Rohan Das',
    },
    {
      time: '03:30 PM',
      title: 'Building AI-powered Applications',
      description: 'Deploying GenAI backends with cloud services, security best practices, and edge streaming.',
      tag: 'Architecture',
      speaker: 'Priya Sharma',
    },
    {
      time: '04:30 PM',
      title: 'Project Showcase & Community Discussion',
      description: 'Open floor for attendee questions, lightning project shares, and GDG community roadmaps.',
      tag: 'Interactive',
    },
    {
      time: '05:00 PM',
      title: 'Closing',
      description: 'Group photo, resource sharing link distribution, and wrap-up.',
      tag: 'Farewell',
    },
  ],

  speakers: [
    {
      id: 'arjun-sen',
      name: 'Arjun Sen',
      role: 'AI Engineer',
      session: 'Building with Gemini',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=faces&q=80',
      bio: 'Works on developer-facing LLM integrations and open-source tooling.',
    },
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      role: 'Cloud Engineer',
      session: 'AI Applications on Google Cloud',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=320&fit=crop&crop=faces&q=80',
      bio: 'Focuses on scalable cloud infrastructure and serverless deployment pipelines.',
    },
    {
      id: 'rohan-das',
      name: 'Rohan Das',
      role: 'Full Stack Developer',
      session: 'Building AI-powered Web Apps',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop&crop=faces&q=80',
      bio: 'Passionate about modern TypeScript ecosystems and building responsive web tools.',
    },
    {
      id: 'ananya-roy',
      name: 'Ananya Roy',
      role: 'Developer Community Lead',
      session: 'Getting Started with AI',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&h=320&fit=crop&crop=faces&q=80',
      bio: 'Organizes community tech meetups and student development study groups in Kolkata.',
    },
  ],

  faqs: [
    {
      question: 'Is the event free?',
      answer:
        'Yes, Build With AI is 100% free to attend. As part of GDG on Campus, our mission is to make technology education accessible to everyone. Pre-registration via RSVP is required as seating is limited.',
    },
    {
      question: 'Who can attend?',
      answer:
        'The event is open to students, developers, designers, and tech enthusiasts from FIEM and other institutions. All experience levels are welcome.',
    },
    {
      question: 'Do I need previous AI experience?',
      answer:
        'No prior Artificial Intelligence or Machine Learning experience is required. Basic programming knowledge (JavaScript, Python, or standard web tech) will help during hands-on demos, but conceptual sessions are designed to be approachable for beginners.',
    },
    {
      question: 'What should I bring?',
      answer:
        'Please bring your laptop and charger for the afternoon hands-on workshop, a valid college or government photo ID for check-in at the FIEM entrance gate, and your RSVP confirmation.',
    },
    {
      question: 'Will there be hands-on activities?',
      answer:
        'Yes! The afternoon includes an interactive hands-on workshop where you will write code, query AI APIs, and build a working mini-project with guidance from speakers and community mentors.',
    },
    {
      question: 'How do I RSVP?',
      answer:
        'Simply scroll to the "Reserve your spot" section on this page, fill out your Full Name, Email Address, Phone Number, and College / Organization, and click RSVP. Your registration pass will be generated instantly.',
    },
  ],

  footerLinks: [
    { name: 'About', href: '#about' },
    { name: 'Agenda', href: '#agenda' },
    { name: 'Speakers', href: '#speakers' },
    { name: 'Venue', href: '#venue' },
    { name: 'RSVP', href: '#rsvp' },
  ],

  socials: [
    { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'linkedin' },
    { name: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram' },
    { name: 'GitHub', url: 'https://github.com', icon: 'github' },
  ],
};
