document.addEventListener("DOMContentLoaded", () => {
    let StudentName = document.querySelector("#name");
    let Skill = document.querySelector("#skill");
    const Level = document.querySelector("#selected");
    const Days = document.querySelector("#selected-day");
    const StartTime = document.querySelector("#startTime");
    const EndTime = document.querySelector("#endTime");
    const Message = document.querySelector("#message");
    let result = document.querySelector("#submissionResult");
    let submitBtn = document.querySelector("#SubmitButton");
    let para = document.querySelector("#default");
    submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        CheckInputs();
    });
    function setErrorFor(input, message) {
        if (message === "") {
            input.classList.add("error");
            input.classList.remove("success");
            return;
        } else {
            result.innerText += "\n" + message;
            input.classList.add("error");
            input.classList.remove("success");
        }
    }
    function isTime(start, end) {
        if (!start.value || !end.value) return false;
        const [startH, startM] = start.value.split(':').map(Number);
        const [endH, endM] = end.value.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        return (endTotal - startTotal) >= 60;
    }


    function setSuccessFor(input) {
        input.classList.add("success");
        input.classList.remove("error");
    }
    function CheckInputs() {
        const NameValue = StudentName.value.trim();
        const SkillValue = Skill.value.trim();
        const MessageValue = Message.value.trim();
        const charOnly = /^[A-Za-z\s]+$/;
        result.innerText = "";
        if (NameValue === "" || NameValue.length < 3 || !charOnly.test(NameValue)) {
            setErrorFor(StudentName, "Name cannot be blank or less than 3 letters");
            return;
        } else {
            setSuccessFor(StudentName);
        }
        if (SkillValue === "" || SkillValue.length < 2) {
            setErrorFor(Skill, "Skill cannot be blank or less than 2 char");
            return;
        } else {
            setSuccessFor(Skill);
        }
        if (para.innerHTML=== "Select level") {
            setErrorFor(Level, "Select a level");
            return;
        } else {
            setSuccessFor(Level);
        }
        if (Days.textContent === "Select available days") {
            setErrorFor(Days, "Select your availability days");
            return;
        } else {
            setSuccessFor(Days);
        }
        if (!isTime(StartTime, EndTime)) {
            setErrorFor(StartTime, "Start time must be less than end time by at least 1H");
            setErrorFor(EndTime, "");
            return;
        }
        else {
            setSuccessFor(StartTime);
            setSuccessFor(EndTime);
        }
        if (MessageValue.length < 50) {
            setErrorFor(Message, "the message must have at least 50 char length");
            return;
        } else {
            setSuccessFor(Message);
        }
    }



});














