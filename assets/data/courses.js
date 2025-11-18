const courses = [
  {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    instructor: "Dr. Sarah Ahmed",
    category: "Computer Science",
    duration: "8 weeks",
    price: 120,
    rating: 4.7,
    description: "Learn the basics of AI, including search algorithms, knowledge representation, and reasoning."
  },

  {
    id: 2,
    title: "Linear Algebra",
    instructor: "Dr. Cherchem",
    category: "Science",
    duration: "10 weeks",
    price: 100,
    rating: 4.5,
    description: "Build dynamic and responsive web apps using React, JavaScript, and modern web technologies."
  },
  {
    id: 8, // Make sure this matches the videos courseId
    title: "UI/UX Design Fundamentals",
    instructor: "Dr. John Smith",
    category: "Design",
    duration: "6 weeks",
    price: 100,
    rating: 4.5,
    description: "Learn UI/UX design principles, wireframing, prototyping, and usability testing."
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    instructor: "Dr. Lasla",
    category: "Computer Science",
    duration: "12 weeks",
    price: 90,
    rating: 4.8,
    description: "Master the core data structures and algorithms used in software engineering and technical interviews."
  },
  {
    id: 5,
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Lina Kamel",
    category: "Computer Science",
    duration: "9 weeks",
    price: 130,
    rating: 4.9,
    description: "Understand supervised and unsupervised learning, model training, and evaluation techniques."
  },
  {
    id: 7,
    title: "Introduction to Databases with SQL",
    instructor: "Dr. Boukhalfa",
    category: "Computer Science",
    duration: "6 weeks",
    price: 65,
    rating: 4.5,
    description: "Understand relational databases, learn SQL syntax, and practice writing real-world queries."
  },
  {
    id: 8,
    title: "Oil Painting",
    instructor: "Ikram Henniene",
    category: "Art",
    duration: "7 weeks",
    price: 95,
    rating: 4.6,
    description: "Learn how to design beautiful, user-friendly interfaces and experiences using Figma and design theory."
  },
  {
    id: 9,
    title: "OOP",
    instructor: "Dr. Sami Belkacem",
    category: "Computer Science",
    duration: "10 weeks",
    price: 140,
    rating: 4.8,
    description: "Implement neural networks and deep learning models with TensorFlow and Keras frameworks."
  },
  {
    id: 10,
    title: "Cooking",
    instructor: "Benfetta Souad",
    category: "Cooking",
    duration: "8 weeks",
    price: 80,
    rating: 4.9,
    description: "Learn C++ from scratch, covering OOP concepts, pointers, memory management, and STL basics."
  },
  {
    id: 16,
    title: "Business Management Fundamentals",
    instructor: "Dr. Karim Haddad",
    category: "Business",
    duration: "8 weeks",
    price: 100,
    rating: 4.5,
    description: "Understand core business management principles including leadership, strategy, and operations."
  },
  {
    id: 17,
    title: "Digital Marketing Strategy",
    instructor: "Hind Merabet",
    category: "Business",
    duration: "7 weeks",
    price: 90,
    rating: 4.6,
    description: "Learn SEO, content marketing, social media strategy, and online advertising techniques."
  },
  {
    id: 18,
    title: "Entrepreneurship and Innovation",
    instructor: "Oussama Belhadj",
    category: "Business",
    duration: "9 weeks",
    price: 110,
    rating: 4.7,
    description: "Learn how to turn ideas into startups, build business models, and pitch to investors."
  },

  // --- Health, Psychology & Lifestyle ---
  {
    id: 19,
    title: "Nutrition and Healthy Eating",
    instructor: "Dr. Leila Youssef",
    category: "Health",
    duration: "6 weeks",
    price: 70,
    rating: 4.5,
    description: "Understand nutritional science, balanced diets, and how to maintain a healthy lifestyle."
  },
  {
    id: 20,
    title: "Stress Management and Mindfulness",
    instructor: "Rania Abid",
    category: "Health",
    duration: "5 weeks",
    price: 60,
    rating: 4.8,
    description: "Develop mindfulness techniques and stress reduction practices for a calmer daily life."
  },
  {
    id: 21,
    title: "Yoga for Beginners",
    instructor: "Layla Said",
    category: "Health",
    duration: "4 weeks",
    price: 50,
    rating: 4.6,
    description: "Learn beginner yoga poses, breathing techniques, and flexibility training routines."
  },

  // --- language & Culture ---
  {
    id: 22,
    title: "Arabic for Beginners",
    instructor: "Dr. Chakor",
    category: "languages",
    duration: "10 weeks",
    price: 80,
    rating: 4.7,
    description: "Learn to read, write, and speak Modern Standard Arabic with simple grammar and daily vocabulary."
  },
  {
    id: 23,
    title: "French Conversation Skills",
    instructor: "Belhadri Hadil",
    category: "languages",
    duration: "6 weeks",
    price: 75,
    rating: 4.5,
    description: "Improve your spoken French and pronunciation through dialogues, role plays, and listening exercises."
  },
  {
    id: 24,
    title: "Japanese language and Culture",
    instructor: "Haruko Tanaka",
    category: "languages",
    duration: "12 weeks",
    price: 95,
    rating: 4.8,
    image: "images/japanese-course.jpg",
    description: "Discover Japanese grammar, writing systems, and traditions through interactive lessons."
  },

  // --- Engineering & Science ---
  {
    id: 25,
    title: "Civil Engineering Basics",
    instructor: "Dr. Youssef Rahal",
    category: "Engineering",
    duration: "8 weeks",
    price: 110,
    rating: 4.5,
    image: "images/civil-course.jpg",
    description: "Learn about structural design, materials, and construction fundamentals for civil projects."
  },
  {
    id: 26,
    title: "Electrical Circuits and Systems",
    instructor: "Nour Eddine Amari",
    category: "Engineering",
    duration: "9 weeks",
    price: 120,
    rating: 4.7,
    image: "images/electrical-course.jpg",
    description: "Understand the basics of electrical circuits, Ohm’s law, and system analysis techniques."
  },
  {
    id: 27,
    title: "Renewable Energy Systems",
    instructor: "Dr. Ines Boukercha",
    category: "Engineering",
    duration: "10 weeks",
    price: 130,
    rating: 4.8,
    image: "images/renewable-course.jpg",
    description: "Explore solar, wind, and hydro energy technologies and their environmental impact."
  }

];

// Always overwrite localStorage during development
localStorage.setItem("courses", JSON.stringify(courses));
