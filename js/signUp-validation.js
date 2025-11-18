document.addEventListener("DOMContentLoaded", () => {

    //sign up validation 
    let UserName = document.querySelector("#Name");
    let EmailUp = document.querySelector("#Email");
    let PasswordUp = document.querySelector("#Password");
    let Result = document.querySelector("#Result");
    let SignUpBTN = document.querySelector("#SIGNUP");

    SignUpBTN.addEventListener("click", (event) => {
        event.preventDefault();

        if (CheckInputs()) {

            //  the function to add the user to the localstorage and when trying to test it i found and error in the consol from home4.html
            if (addNewUser(UserName.value, EmailUp.value, PasswordUp.value)) {
                sessionStorage.setItem("currentUserEmail", EmailUp.value);
                window.location.href = "/pages/home.html";
            } else {
                setErrorFor(EmailUp, "This email is already registered.");
            }
        };

    });
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
        const Username = UserName.value.trim();
        const EmailSIGNUP = EmailUp.value.trim();
        const Pass = PasswordUp.value.trim();
        const charOnly = /^[A-Za-z\s]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/;
        const mail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        Result.innerText = "";
        if (Username === "" || Username.length < 3 || !charOnly.test(Username)) {

            setErrorFor(UserName, "Name cannot be blank or shorter than 3 letters.");
            return false;

        } else {
            setSuccessFor(UserName);
        }
        if (!EmailSIGNUP || !mail.test(EmailSIGNUP)) {
            setErrorFor(EmailUp, "Invalid email");
            return false;
        } else {
            setSuccessFor(EmailUp);
        }
        if (!Pass || !passwordRegex.test(Pass)) {
            setErrorFor(PasswordUp, "Password must be 8 chars and include a letter, number, and one of: @$!%*?& ");
            return false;
        } else {
            setSuccessFor(PasswordUp);
        }

        return true;
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
});

















