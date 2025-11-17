document.addEventListener("DOMContentLoaded", () => {

    //sign up validation 
    let UserName = document.querySelector("#Name");
    let EmailUp = document.querySelector("#Email");
    let PasswordUp = document.querySelector("#Password");
    let Result = document.querySelector("#Result");
    let SignUpBTN = document.querySelector("#SIGNUP");


    SignUpBTN.addEventListener("click", (event) => {
        event.preventDefault();
        CheckInputs();
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
            return;
        } else {
            setSuccessFor(UserName);
        }
        if (!EmailSIGNUP || !mail.test(EmailSIGNUP)) {
            setErrorFor(EmailUp, "Invalid email");
            return;
        } else {
            setSuccessFor(EmailUp);
        }
        if (!Pass || !passwordRegex.test(Pass)) {
            setErrorFor(PasswordUp, "Password must be 8 chars and include a letter, number, and one of: @$!%*?& ");
            return;
        } else {
            setSuccessFor(PasswordUp);
        }
    }
});

















