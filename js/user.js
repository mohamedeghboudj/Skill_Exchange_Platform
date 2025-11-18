
let users = fromLocalStorage() || [
    {
        id: 1,
        email: "avastone@gmail.com",
        password: "pass123!",
        profile: {
            name: "Ava Stone",
            age: "19",
            skill: "Mathematics",
            role: "Student",
            subject: "",
            bio: "Passionate mathematics student with a love for problem-solving and analytical thinking."
        },
        teacherProfile: null // Not a teacher yet
    },
    {
        id: 2,
        email: "michaelchen@gmail.com",
        password: "pass456!",
        profile: {
            name: "Michael Chen",
            age: "21",
            skill: "Computer Science",
            role: "Student, Teacher",
            subject: "Programming",
            bio: "Computer science major focusing on AI and machine learning."
        },
        teacherProfile: {
            primarySkill: "Programming",
            certificates: [
                {
                    id: "cert_001",
                    name: "AWS Certified Developer.pdf",
                    url: "/uploads/certificates/michael_aws_cert.pdf" // Simulated path
                },
                {
                    id: "cert_002",
                    name: "Python Advanced Certificate.pdf",
                    url: "/uploads/certificates/michael_python_cert.pdf"
                }
            ],
            teacherBio: "Experienced programmer with 3+ years teaching coding to beginners. Specialized in Python, JavaScript, and cloud computing.",
            rating: 4.8,
            studentsCount: 24,
            verified: true
        }
    },
    {
        id: 3,
        email: "sophiemartin@gmail.com",
        password: "pass789!",
        profile: {
            name: "Sophie Martin",
            age: "28",
            skill: "French Language",
            role: "Teacher",
            subject: "French",
            bio: "Native French speaker passionate about teaching."
        },
        teacherProfile: {
            primarySkill: "French Language",
            certificates: [
                {
                    id: "cert_003",
                    name: "DELF B2 Teaching Certificate.pdf",

                    url: "/uploads/certificates/sophie_delf.pdf"
                },
                {
                    id: "cert_004",
                    name: "Teaching French as Foreign Language.pdf",

                    url: "/uploads/certificates/sophie_fle.pdf"
                },
                {
                    id: "cert_005",
                    name: "Masters in Linguistics.pdf",
                    url: "/uploads/certificates/sophie_masters.pdf"
                }
            ],
            teacherBio: "French native with a Master's in Linguistics. I've been teaching French for 5 years to students of all levels. My approach focuses on conversational skills and cultural immersion.",
            rating: 4.9,
            studentsCount: 47,
            verified: true
        }
    },
    {
        id: 4,
        email: "davidkim@gmail.com",
        password: "pass321!",
        profile: {
            name: "David Kim",
            age: "20",
            skill: "Physics",
            role: "Student",
            subject: "",
            bio: "Physics enthusiast exploring quantum mechanics."
        },
        teacherProfile: null
    },
    {
        id: 5,
        email: "emilyjones@gmail.com",
        password: "pass654!",
        profile: {
            name: "Emily Jones",
            age: "26",
            skill: "Graphic Design",
            role: "Teacher",
            subject: "Design",
            bio: "Creative designer with studio experience."
        },
        teacherProfile: {
            primarySkill: "Graphic Design",
            certificates: [
                {
                    id: "cert_006",
                    name: "Adobe Certified Professional.pdf",

                    url: "/uploads/certificates/emily_adobe.pdf"
                },
                {
                    id: "cert_007",
                    name: "UX Design Certificate.pdf",

                    url: "/uploads/certificates/emily_ux.pdf"
                }
            ],
            teacherBio: "Professional designer with 4 years of industry experience. I teach Adobe Creative Suite, UI/UX design, and branding. My courses are project-based and practical.",
            rating: 4.7,
            studentsCount: 35,
            verified: true
        }
    },
    {
        id: 6,
        email: "lucasgarcia@gmail.com",
        password: "pass987!",
        profile: {
            name: "Lucas Garcia",
            age: "23",
            skill: "Guitar",
            role: "Student, Teacher",
            subject: "Music",
            bio: "Musician sharing my passion for guitar."
        },
        teacherProfile: {
            primarySkill: "Guitar",
            certificates: [
                {
                    id: "cert_008",
                    name: "Music Theory Certification.pdf",

                    url: "/uploads/certificates/lucas_theory.pdf"
                }
            ],
            teacherBio: "Self-taught guitarist with 8 years of experience. I teach acoustic and electric guitar for all levels, focusing on both technique and musicality.",
            rating: 4.6,
            studentsCount: 18,
            verified: false // Pending verification
        }
    }
];

// Only save default users if localStorage is empty
if (!fromLocalStorage()) {
    toLocalStorage();
}

function toLocalStorage() {
    try {
        const arrayString = JSON.stringify(users);
        localStorage.setItem("learnLandUsers", arrayString);
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

function fromLocalStorage() {
    try {
        const storedData = localStorage.getItem("learnLandUsers");
        return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
        console.error("Error loading from localStorage:", error);
        return null;
    }
}

function authenticateUser(email, password) {
    const currentUsers = fromLocalStorage() || users;
    const user = currentUsers.find(
        user => user.email === email && user.password === password
    );

    if (user) {
        console.log("User authenticated successfully:", user.profile.name);
        localStorage.setItem("currentUser", JSON.stringify(user));
        return true;
    } else {
        console.log("Authentication failed: Invalid credentials");
        return false;
    }
}

function addNewUser(name, email, password) {
    const currentUsers = fromLocalStorage() || users;
    const existingUser = currentUsers.find(user => user.email === email);

    if (existingUser) {
        console.error("User with this email already exists!");
        return false;
    }

    const newId = currentUsers.length > 0
        ? Math.max(...currentUsers.map(user => user.id)) + 1
        : 1;

    const newUser = {
        id: newId,
        email: email,
        password: password,
        profile: {
            name: name,
            age: "",
            skill: "",
            role: "Student",
            subject: "",
            bio: ""
        },
        teacherProfile: null // New users start without teacher profile
    };

    currentUsers.push(newUser);
    users = currentUsers;
    toLocalStorage();
    console.log("New user added successfully:", newUser);
    return true;
}

// NEW: Function to upgrade user to teacher
function becomeTeacher(userId, teacherData) {
    const currentUsers = fromLocalStorage() || users;
    const user = currentUsers.find(u => u.id === userId);

    if (!user) {
        console.error("User not found!");
        return false;
    }

    // Create teacher profile
    user.teacherProfile = {
        primarySkill: teacherData.primarySkill,
        certificates: teacherData.certificates || [],
        teacherBio: teacherData.teacherBio,
        rating: 0,
        studentsCount: 0,
        verified: false // Needs admin verification
    };

    // Update role
    if (!user.profile.role.includes("Teacher")) {
        user.profile.role = user.profile.role + ", Teacher";
    }

    users = currentUsers;
    toLocalStorage();
    console.log("User upgraded to teacher:", user.profile.name);
    return true;
}

// NEW: Function to add certificate to teacher
function addCertificate(userId, certificate) {
    const currentUsers = fromLocalStorage() || users;
    const user = currentUsers.find(u => u.id === userId);

    if (!user || !user.teacherProfile) {
        console.error("User is not a teacher!");
        return false;
    }

    const certId = `cert_${Date.now()}`;
    const newCert = {
        id: certId,
        name: certificate.name,
        url: certificate.url || `/uploads/certificates/${userId}_${certId}.pdf`
    };

    user.teacherProfile.certificates.push(newCert);
    users = currentUsers;
    toLocalStorage();
    console.log("Certificate added:", newCert);
    return true;
}

// Initialize
toLocalStorage();



