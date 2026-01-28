document.addEventListener("DOMContentLoaded", () => {
    // Sign in validation
    let EmailIn = document.querySelector("#email");
    let PasswordIn = document.querySelector("#password");
    let EmailError = document.querySelector("#emailError");
    let passError = document.querySelector("#passwordError");
    let SignInBTN = document.querySelector("#SIGNIN");

    SignInBTN.addEventListener("click", async (event) => {
        event.preventDefault();

        // Check all inputs simultaneously
        const validationResult = CheckInputs();

        // Only proceed to authentication if all inputs are valid
        if (validationResult.isValid) {
            const result = await authenticateUser(EmailIn.value, PasswordIn.value);
            if (result.success) {
                window.location.href = "/pages/home.html";
            } else {
                setErrorFor(EmailIn, "Invalid email or password.", EmailError);
                setErrorFor(PasswordIn, "Invalid email or password.", passError);
            }
        }
    });

    async function authenticateUser(email, password) {
        try {
            const response = await fetch('/assets/php/authenticate.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: "include" // hadil added this to test the work of the session 
        
                
            });

            const data = await response.json();

            if (data.success) {
                console.log("User authenticated successfully via PHP sessions");
                return { success: true };
            } else {
                console.log("Authentication failed:", data.message);
                return { success: false };
            }
        } catch (error) {
            console.error("Authentication error:", error);
            return { success: false };
        }
    }

    function setErrorFor(input, message, errorElement) {
        errorElement.innerText = message;

        errorElement.style.display = "block"; // Make sure it's visible
        input.classList.add("error");
        input.classList.remove("success");
    }

    function setSuccessFor(input, errorElement) {
        errorElement.innerText = "";
        errorElement.style.display = "none"; // Hide the error message
        input.classList.add("success");
        input.classList.remove("error");
    }

    function CheckInputs() {
        const EmailSIGNIN = EmailIn.value.trim();
        const Pass = PasswordIn.value.trim();

        // Regex patterns
        const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const mail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

        let isValid = true;

        // Validate email
        if (!EmailSIGNIN || !mail.test(EmailSIGNIN)) {
            setErrorFor(EmailIn, "Please enter a valid email address", EmailError);
            isValid = false;
        } else {
            setSuccessFor(EmailIn, EmailError);
        }

        // Validate password
        if (!Pass) {
            setErrorFor(PasswordIn, "Password is required", passError);
            isValid = false;
        } else if (!passwordRegex.test(Pass)) {
            setErrorFor(PasswordIn, "Password must be at least 8 characters and include a letter, number, and special character (@$!%*?&)", passError);
            isValid = false;
        } else {
            setSuccessFor(PasswordIn, passError);
        }

        return { isValid };
    }
});
