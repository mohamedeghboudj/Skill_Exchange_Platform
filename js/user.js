
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
            bio: "Passionate mathematics student with a love for problem-solving and analytical thinking."
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
            role: "Student, Teacher", 
            subject: "Programming", 
            bio: "Computer science major focusing on AI and machine learning."
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
            bio: "Physics enthusiast with research experience in quantum mechanics."
        }
    }
];

// addNewUser method 
//inside should check for duplicates 
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
toLocalStorage();
console.log( fromLocalStorage());