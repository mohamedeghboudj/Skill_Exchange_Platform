document.addEventListener("DOMContentLoaded", () => {

    //sign in validation 

    let EmailIn = document.querySelector("#email");
    let PasswordIn = document.querySelector("#password");
    let Result = document.querySelector("#RESULT");
    let SignInBTN = document.querySelector("#SIGNIN");


    SignInBTN.addEventListener("click", (event) => {
        event.preventDefault();
        // to verify the user exists in the array


        if (CheckInputs()) {

            if (authenticateUser(EmailIn.value, PasswordIn.value)) {
                window.location.href = "/pages/home.html";
            } else {
                setErrorFor(EmailIn, "Invalid email or password.");
                setErrorFor(PasswordIn, "");
            }
        };
    });

    // function authenticateUser(email, password) {

    //     const currentUsers = fromLocalStorage();
    //     const user = currentUsers.find(user =>
    //         user.email === email && user.password === password
    //     );

    //     if (user) {
    //         console.log("User authenticated successfully:", user.profile.name);
    //         localStorage.setItem("currentUserEmail", user.email);
    //         localStorage.setItem("currentUser", JSON.stringify(user));

    //         return true;
    //     } else {
    //         console.log("Authentication failed: Invalid credentials");
    //         return false;
    //     }
    // }
    function setErrorFor(input, message) {
        Result.innerText += "\n" + message;
        input.classList.add("error");
        input.classList.remove("success");
    }

    function setSuccessFor(input) {
        input.classList.add("success");
        input.classList.remove("error");
    }
    function CheckInputs() {

        const EmailSIGNIN = EmailIn.value.trim();
        const Pass = PasswordIn.value.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/;

        const mail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        Result.innerText = "";

        if (!EmailSIGNIN || !mail.test(EmailSIGNIN)) {
            setErrorFor(EmailIn, "Invalid email");
            return false;
        } else {
            setSuccessFor(EmailIn);
        }
        if (!Pass || !passwordRegex.test(Pass)) {
            setErrorFor(PasswordIn, "Password must be 8 chars and include a letter, number, and one of: @$!%*?&");
            return false;
        } else {
            setSuccessFor(PasswordIn);
        }

        return true;

    }

});