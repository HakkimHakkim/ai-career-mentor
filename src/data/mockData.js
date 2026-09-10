export const mockUser = {
  name: 'Hakkim',
  email: 'hakkim@example.com',
  education: 'Bachelor of Engineering',
  experience: 'Fresher',
  selectedCareer: 'Data Analyst',
  profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hakkim',
};

export const mockDashboard = {
  user: mockUser,
  careerMatch: 87,
  jobReadiness: 72,
  skillsLearned: 12,
  totalSkills: 36,
  todaysTasks: [
    { id: 1, task: 'Complete SQL Joins lesson', done: false },
    { id: 2, task: 'Practice Excel formulas', done: true },
    { id: 3, task: 'Watch Power BI tutorial', done: false },
  ],
  weeklyActivity: [
    { day: 'Monday', hours: 2 },
    { day: 'Tuesday', hours: 3 },
    { day: 'Wednesday', hours: 1.5 },
    { day: 'Thursday', hours: 2.5 },
    { day: 'Friday', hours: 3 },
    { day: 'Saturday', hours: 1 },
    { day: 'Sunday', hours: 0 },
  ],
};

export const mockCareerMatches = [
  {
    id: 1,
    name: 'Data Analyst',
    description: 'Analyze data to help businesses make better decisions',
    match: 87,
    salary: '₹4L - ₹8L',
    reasons: [
      'Strong analytical skills match',
      'Excel proficiency demonstrated',
      'SQL knowledge aligned',
    ],
  },
  {
    id: 2,
    name: 'Business Analyst',
    description: 'Bridge between business and technology teams',
    match: 78,
    salary: '₹5L - ₹9L',
    reasons: [
      'Good problem-solving skills',
      'Communication abilities',
      'Tech understanding',
    ],
  },
  {
    id: 3,
    name: 'Data Scientist',
    description: 'Build ML models and predictive analytics',
    match: 65,
    salary: '₹8L - ₹15L',
    reasons: [
      'Math and stats foundation',
      'Python learning in progress',
      'Analytical mindset',
    ],
  },
];

export const mockCourses = [
  {
    id: 1,
    title: 'Excel Mastery',
    difficulty: 'Beginner',
    rating: 4.8,
    lessons: 24,
    duration: '4 weeks',
    progress: 85,
  },
  {
    id: 2,
    title: 'SQL for Data Analysis',
    difficulty: 'Intermediate',
    rating: 4.9,
    lessons: 32,
    duration: '6 weeks',
    progress: 45,
  },
  {
    id: 3,
    title: 'Power BI Basics',
    difficulty: 'Beginner',
    rating: 4.7,
    lessons: 18,
    duration: '3 weeks',
    progress: 0,
  },
  {
    id: 4,
    title: 'Python for Analytics',
    difficulty: 'Intermediate',
    rating: 4.8,
    lessons: 40,
    duration: '8 weeks',
    progress: 20,
  },
  {
    id: 5,
    title: 'Statistics Fundamentals',
    difficulty: 'Intermediate',
    rating: 4.6,
    lessons: 28,
    duration: '5 weeks',
    progress: 0,
  },
  {
    id: 6,
    title: 'Data Visualization',
    difficulty: 'Beginner',
    rating: 4.9,
    lessons: 22,
    duration: '4 weeks',
    progress: 0,
  },
];

export const mockRoadmap = [
  {
    id: 1,
    title: 'Excel Fundamentals',
    progress: 100,
    status: 'completed',
    skills: ['Formulas', 'Pivot Tables', 'Charts'],
  },
  {
    id: 2,
    title: 'SQL Basics',
    progress: 65,
    status: 'in-progress',
    skills: ['SELECT', 'WHERE', 'JOIN'],
  },
  {
    id: 3,
    title: 'Data Analysis Tools',
    progress: 30,
    status: 'in-progress',
    skills: ['Power BI', 'Tableau'],
  },
  {
    id: 4,
    title: 'Python & Libraries',
    progress: 0,
    status: 'pending',
    skills: ['Pandas', 'NumPy', 'Matplotlib'],
  },
  {
    id: 5,
    title: 'Advanced Analytics',
    progress: 0,
    status: 'pending',
    skills: ['Statistics', 'ML Basics'],
  },
];

export const mockJobs = [
  {
    id: 1,
    title: 'Junior Data Analyst',
    company: 'Tech Corp',
    location: 'Bangalore',
    salary: '₹4.5L - ₹6L',
    aiMatch: 85,
    skills: ['Excel', 'SQL', 'Python'],
  },
  {
    id: 2,
    title: 'Data Analyst',
    company: 'Finance Inc',
    location: 'Mumbai',
    salary: '₹5.5L - ₹7.5L',
    aiMatch: 78,
    skills: ['SQL', 'Power BI', 'Statistics'],
  },
  {
    id: 3,
    title: 'Business Analyst',
    company: 'StartUp XYZ',
    location: 'Remote',
    salary: '₹4L - ₹5.5L',
    aiMatch: 72,
    skills: ['Excel', 'Communication', 'Analytics'],
  },
];

export const mockResume = {
  score: 72,
  breakdown: {
    skills: 85,
    experience: 45,
    projects: 68,
    keywords: 75,
    achievements: 70,
  },
  missingSkills: ['Advanced SQL', 'Python', 'Tableau', 'Statistics'],
  improvements: [
    {
      id: 1,
      current: 'Proficient in Microsoft Excel',
      improved: 'Advanced proficiency in Excel with pivot tables, complex formulas, and data visualization',
    },
    {
      id: 2,
      current: 'Know SQL basics',
      improved: 'Expertise in SQL with multi-table joins, subqueries, and query optimization',
    },
  ],
};

export const mockInterviewQuestions = [
  'Tell me about yourself',
  'What is a pivot table?',
  'Explain VLOOKUP vs INDEX-MATCH',
  'What are JOIN types in SQL?',
  'How would you clean messy data?',
];

export const mockNotifications = [
  { id: 1, title: 'Course Started', message: 'You started Python for Analytics' },
  { id: 2, title: 'Badge Earned', message: 'SQL Expert badge earned!' },
  { id: 3, title: 'Job Posted', message: 'Junior Data Analyst at Tech Corp' },
];

export const mockWeeklyActivity = [
  { week: 'Week 1', progress: 20 },
  { week: 'Week 2', progress: 35 },
  { week: 'Week 3', progress: 48 },
  { week: 'Week 4', progress: 58 },
  { week: 'Week 5', progress: 68 },
];