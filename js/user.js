

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
            bio: "Passionate mathematics student with a love for problem-solving and analytical thinking.",
            picture:"images1/profilePicture1.jpg"
        }
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
            bio: "Computer science major focusing on AI and machine learning.",
            picture:"images1/image3.png"
        }
    }
];

// Only save default users if localStorage is empty
if (!fromLocalStorage()) {
    toLocalStorage();
}

function toLocalStorage() {
    try {
        arrayString = JSON.stringify(users);
        localStorage.setItem("learnLandUsers", arrayString);
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}
function fromLocalStorage() {
    try {
        storedData = localStorage.getItem("learnLandUsers");
        return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
        console.error("Error loading from localStorage:", error);
        return null;
    }
}
function authenticateUser(email, password) {
    const currentUsers = fromLocalStorage() || users;
    const user = currentUsers.find(user =>
        user.email === email && user.password === password
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
    // Always load from localStorage to get the latest data
    const currentUsers = fromLocalStorage() || users;

    const existingUser = currentUsers.find(user => user.email === email);
    if (existingUser) {
        console.error("User with this email already exists!");
        return false;
    }

    const newId = currentUsers.length > 0 ? Math.max(...currentUsers.map(user => user.id)) + 1 : 1;

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
        }
    };

    // Add to both the array and update storage
    currentUsers.push(newUser);
    users = currentUsers; // Update global users array
    toLocalStorage();

    console.log("New user added successfully:", newUser);
    return true;
}
toLocalStorage();





