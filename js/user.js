
let users = [
    {
        id: 1,
        email: "ava.stone@example.com",
        password: "password123",
        profile: {
            name: "Ava Stone",
            age: "19",
            skill: "Mathematics",
            role: "Student",
            subject: "",
            bio: "Passionate mathematics student with a love for problem-solving and analytical thinking.",
            picture:"../profilePicture1.jpg"
        }
    },
    {
        id: 2,
        email: "michael.chen@example.com",
        password: "password456",
        profile: {
            name: "Michael Chen",
            age: "21",
            skill: "Computer Science",
            role: "Student,Teacher",
            subject: "Programming",
            bio: "Computer science major focusing on AI and machine learning.",
            picture:"../image2.jpg"
        }
    },
    {
        id: 3,
        email: "sophia.rodriguez@example.com",
        password: "password789",
        profile: {
            name: "Sophia Rodriguez",
            age: "20",
            skill: "Physics",
            role: "Student",
            subject: "",
            bio: "Physics enthusiast with research experience in quantum mechanics.",
            picture:"../image3.jpg"
        }
    }
];


function toLocalStorage() {
    try {
        localStorage.setItem("learnLandUsers", JSON.stringify(users));
        return true;
    } catch (error) {
        console.error("Error saving to localStorage:", error);
        return false;
    }
}

function fromLocalStorage() {
    try {
        const storedData = localStorage.getItem("learnLandUsers");
        if (!storedData) {
            toLocalStorage();
            return users;
        }
        return JSON.parse(storedData);
    } catch (error) {
        console.error("Error loading from localStorage:", error);
        return users; 
    }
}


if (!localStorage.getItem("learnLandUsers")) {
    toLocalStorage();
}
