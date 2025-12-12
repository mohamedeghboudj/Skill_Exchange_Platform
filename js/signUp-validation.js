//sign up validation 
let UserName = document.querySelector("#Name");
let EmailUp = document.querySelector("#Email");
let PasswordUp = document.querySelector("#Password");
let PasswordConfirm = document.querySelector("#PasswordConfirmation");
let emailerror = document.querySelector("#emailError2");
let nameerror = document.querySelector("#nameError2");
let passerror = document.querySelector("#passwordError2");
let passConfirmerror = document.querySelector("#passwordConfirmationError2");
let SignUpBTN = document.querySelector("#SIGNUP");

SignUpBTN.addEventListener("click", (event) => {
    event.preventDefault();

    // Validate all inputs simultaneously
    const validationResult = CheckInputs();

    // Only proceed if all validations pass
    if (validationResult.isValid) {
        // Add the user to localStorage
        if (addNewUser(UserName.value, EmailUp.value, PasswordUp.value)) {
            localStorage.setItem("currentUserEmail", EmailUp.value);
            window.location.href = "/pages/home.html";
        } else {
            setErrorFor(EmailUp, "This email is already registered.", emailerror);
        }
    }
});

function setErrorFor(input, message, errorElement) {
    errorElement.innerText = message;
    errorElement.classList.add("show");
    errorElement.style.display = "block";
    input.classList.add("error");
    input.classList.remove("success");
}

function setSuccessFor(input, errorElement) {
    errorElement.innerText = "";
    errorElement.classList.remove("show");
    errorElement.style.display = "none";
    input.classList.add("success");
    input.classList.remove("error");
}

function CheckInputs() {
    const Username = UserName.value.trim();
    const EmailSIGNUP = EmailUp.value.trim();
    const Pass = PasswordUp.value.trim();
    const PassConfirm = PasswordConfirm.value.trim();
    
    // Regex patterns
    const charOnly = /^[A-Za-z\s]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    
    let isValid = true;

    // Validate Name (check all conditions, don't return early)
    if (Username === "" || Username.length < 3 || !charOnly.test(Username)) {
        setErrorFor(UserName, "Name cannot be shorter than 3 letters.", nameerror);
        isValid = false;
    } else {
        setSuccessFor(UserName, nameerror);
    }

    // Validate Email (check all conditions, don't return early)
    if (!EmailSIGNUP || !mail.test(EmailSIGNUP)) {
        setErrorFor(EmailUp, "Please enter a valid email address.", emailerror);
        isValid = false;
    } else {
        setSuccessFor(EmailUp, emailerror);
    }

    // Validate Password (check all conditions, don't return early)
    if (!Pass) {
        setErrorFor(PasswordUp, "Password is required.", passerror);
        isValid = false;
    } else if (!passwordRegex.test(Pass)) {
        setErrorFor(PasswordUp, "Enter 8 characters including a letter, number, and special character.", passerror);
        isValid = false;
    } else {
        setSuccessFor(PasswordUp, passerror);
    }

    // Validate Password Confirmation (check all conditions, don't return early)
    if (!PassConfirm) {
        setErrorFor(PasswordConfirm, "Please confirm your password.", passConfirmerror);
        isValid = false;
    } else if (Pass !== PassConfirm) {
        setErrorFor(PasswordConfirm, "Passwords do not match.", passConfirmerror);
        isValid = false;
    } else {
        setSuccessFor(PasswordConfirm, passConfirmerror);
    }

    return { isValid };
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
            bio: "",
            picture: "images1/Fotos de perfil 1_ are secciones.jpg"
        }
    };

    // Add to both the array and update storage
    currentUsers.push(newUser);
    users = currentUsers; // Update global users array
    toLocalStorage();

    console.log("New user added successfully:", newUser);
    return true;
}

// Terms popup functionality
let showTerms = document.querySelector('#term');
let mydialog2 = document.getElementById("popup1");

showTerms.addEventListener('click', () => {
    mydialog2.showModal();
});

function closePop() {
    mydialog2.close();
}

mydialog2.addEventListener('click', () => {
    mydialog2.close();
});








