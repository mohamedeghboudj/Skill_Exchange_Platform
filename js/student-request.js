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
    let PARA= document.querySelector("#DEFAULT");
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
            setErrorFor(StudentName, "Name must be at least 3 characters.");
            return;
        } else {
            setSuccessFor(StudentName);
        }
        if (SkillValue === "" || SkillValue.length < 2) {
            setErrorFor(Skill, "Skill must be at least 2 characters.");
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
        if (PARA.innerHTML === "Select available days") {
            setErrorFor(Days, "Select the days you are available.");
            return;
        } else {
            setSuccessFor(Days);
        }
        if (!isTime(StartTime, EndTime)) {
            setErrorFor(StartTime, "Start time must be at least 1 hour earlier than end time.");
            setErrorFor(EndTime, "");
            return;
        }
        else {
            setSuccessFor(StartTime);
            setSuccessFor(EndTime);
        }
        if (MessageValue.length < 50) {
            setErrorFor(Message, "Message must be at least 50 characters long.");
            return;
        } else {
            setSuccessFor(Message);
        }
    }



});














