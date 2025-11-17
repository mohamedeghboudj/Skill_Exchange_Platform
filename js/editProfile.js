document.addEventListener('DOMContentLoaded', function () {



    let Name = document.querySelector('#fullname');
    let age = document.querySelector('#age');
    let skill = document.querySelector('#skill');
    let role = document.querySelector('#role');
    let subject = document.querySelector('#subject');
    let bio = document.querySelector('#bio');
    let email = document.querySelector('#email')
    let teachingCheckbox = document.querySelector('#teaching-option');
    let save_btn = document.querySelector('.submit');
    let small = document.querySelector("small");
    let isTeacherModeActive = false;
    loadUserData();

    teachingCheckbox.addEventListener('change', function () {
        isTeacherModeActive = this.checked;
        updateFormForTeacherMode();
    });

    function updateFormForTeacherMode() {
        if (isTeacherModeActive) {
            role.value += ',Teacher';
            subject.disabled = false;
        } else {

            role.disabled = false;
            subject.disabled = true;
            subject.value = '';
        }
    }
    updateFormForTeacherMode();

    save_btn.addEventListener("click", (event) => {
        event.preventDefault();


        if (checkInputs()) {
            saveToLocalStorage();
            window.location.href = "profile.htm";
        } else {
            alert('Please fix the errors before saving.');
        }
    });

    function checkInputs() {

        small.innerText = "";

        let isValid = true;

        const nameValue = Name.value.trim();
        const ageValue = age.value.trim();
        const skillValue = skill.value.trim();
        const roleValue = role.value.trim();
        const bioValue = bio.value.trim();
        const subjectValue = subject.value.trim();


        if (nameValue === "") {
            setErrorFor(Name, "Name can not be empty");
            isValid = false;
        } else if (!nameValue.includes(" ")) {
            setErrorFor(Name, "Please enter both first name and surname separated by a space");
            isValid = false;
        } else {
            setSuccessFor(Name);
        }

        // Age validation
        if (ageValue === "") {
            setErrorFor(age, "Age cannot be blank");
            isValid = false;
        } else if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
            setErrorFor(age, 'Please enter a valid age (1-120)');
            isValid = false;
        } else {
            setSuccessFor(age);
        }


        if (skillValue === '') {
            setErrorFor(skill, "You should give your skills");
            isValid = false;
        } else {
            setSuccessFor(skill);
        }


        if (roleValue === "") {
            setErrorFor(role, "Role cannot be blank");
            isValid = false;
        } else if (roleValue !== "Student" && roleValue !== "Teacher" && roleValue !== "Student,Teacher") {
            setErrorFor(role, "Role must be Student or Teacher or both");
            isValid = false;
        } else {
            setSuccessFor(role);
        }

        // Subject validation for teachers
        if (isTeacherModeActive) {
            if (subjectValue === '') {
                setErrorFor(subject, "Name the subject you will teach");
                isValid = false;
            } else {
                setSuccessFor(subject);
            }
        } else {

            if (subjectValue !== '') {
                setErrorFor(subject, "Subject should be empty when not in teacher mode");
                isValid = false;
            } else {
                setSuccessFor(subject);
            }
        }

        if (bioValue === "") {
            setErrorFor(bio, "Bio cannot be blank");
            isValid = false;
        } else if (bioValue.length < 10) {
            setErrorFor(bio, "Bio must be at least 10 characters");
            isValid = false;
        } else {
            setSuccessFor(bio);
        }

        return isValid;
    }

    function setErrorFor(input, message) {
        small.innerText += "\n" + message;
        input.classList.remove("success");
        input.classList.add("error");
    }

    function setSuccessFor(input) {
        input.classList.remove("error");
        input.classList.add("success");
    }

    function loadUserData() {
        function getUserFromArray() {
            const userArray = fromLocalStorage()[0];// out of default case it is index
            return userArray;
        }
        const user = getUserFromArray();
        Name.value = user.profile.name;
        age.value = user.profile.age;
        skill.value = user.profile.skill;
        email.value = user.email;
        role.value = user.profile.role || "Student";
        bio.value = user.profile.bio;
        subject.value = user.profile.subject;

        teachingCheckbox.checked = user.profile.role.includes('Teacher');
        updateFormForTeacherMode();
    }
    function saveToLocalStorage() {
        let users = fromLocalStorage();  
    let user = users[0]; 
        user.profile.name = Name.value;
        user.profile.age = age.value;
        user.profile.skill = skill.value;
        user.profile.role = role.value;
        user.profile.bio = bio.value;
        user.profile.subject = subject.value;
        localStorage.setItem("learnLandUsers", JSON.stringify(users))
    }
})