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

SignUpBTN.addEventListener("click", async (event) => {
    event.preventDefault();

    // Validate all inputs simultaneously
    const validationResult = CheckInputs();
    // Only proceed if all validations pass
    if (validationResult.isValid) {
        // Register user via database
        const result = await registerUser(UserName.value, EmailUp.value, PasswordUp.value);
        if (result.success) {
            // Session is already started in PHP
            window.location.href = "/pages/home.html";
        } else {
            setErrorFor(EmailUp, result.message, emailerror);
        }
    }
});

async function registerUser(name, email, password) {
    try {

        const response = await fetch('./register.php', { // hadil removed the slash here !!!

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status}`);
            return { success: false, message: `Server error: ${response.status}` };
        }

        const data = await response.json();

        if (data.success) {
            console.log("User registered successfully:", data.user);
            return { success: true, message: "Registration successful" };
        } else {
            console.log("Registration failed:", data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "An error occurred during registration" };
    }
}

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

// Terms popup functionality
let showTerms = document.querySelector('#term');
let mydialog2 = document.getElementById("popup1");

if (showTerms) {
    showTerms.addEventListener('click', () => {
        if (mydialog2) mydialog2.showModal();
    });
}

function closePop() {
    if (mydialog2) mydialog2.close();
}

if (mydialog2) {
    mydialog2.addEventListener('click', () => {
        mydialog2.close();
    });
}

