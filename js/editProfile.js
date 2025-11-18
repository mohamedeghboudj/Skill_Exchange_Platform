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
    const Image = document.querySelector(".profile-pic");
    const imageLoad = document.querySelector(".chnage-pic");
    let isTeacherModeActive = false;
    loadUserData();



    imageLoad.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            
            const objectURL = URL.createObjectURL(file);

            Image.src = objectURL;


        }

    })

    function updateFormForTeacherMode() {
        if (isTeacherModeActive) {

            if (!role.value.includes('Teacher')) {
                role.value = role.value === 'Student' ? 'Student,Teacher' : 'Teacher';
            }
            subject.disabled = false;
        } else {

            if (role.value === 'Student,Teacher') {
                role.value = 'Student';
            } else if (role.value === 'Teacher') {
                role.value = 'Student';
            }


            subject.disabled = true;
            subject.value = '';
        }
    }
    updateFormForTeacherMode();
    teachingCheckbox.addEventListener('change', function () {
        isTeacherModeActive = this.checked;
        updateFormForTeacherMode();
    });
    save_btn.addEventListener("click", (event) => {
        event.preventDefault();
        checkInputs();

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
            const userArray = fromLocalStorage()[0];
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
        // Image.src=user.profile.picture;
        teachingCheckbox.checked = user.profile.role.includes('Teacher');
        updateFormForTeacherMode();

    }
    function saveToLocalStorage() {
        try {
            const storedUsers = fromLocalStorage();


            if (!storedUsers || !Array.isArray(storedUsers) || storedUsers.length === 0) {
                console.error("Invalid user data structure");
                return false;
            }


            const updatedUsers = [...storedUsers];
            updatedUsers[0] = {
                ...updatedUsers[0],
                profile: {
                    ...updatedUsers[0].profile,
                    name: Name.value.trim(),
                    age: age.value.trim(),
                    skill: skill.value.trim(),
                    role: role.value.trim(),
                    bio: bio.value.trim(),
                    subject: subject.value.trim()
                }
            };

            localStorage.setItem("learnLandUsers", JSON.stringify(updatedUsers));
            console.log("Data saved successfully!");
            return true;

        } catch (error) {
            console.error("Error saving to localStorage:", error);
            return false;
        }
    }
})