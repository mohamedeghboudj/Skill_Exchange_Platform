document.addEventListener('DOMContentLoaded', function () {

    const currentUserEmail = sessionStorage.getItem("currentUserEmail");

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


    const profileImage = document.querySelector('.profile-pic');
    const fileInput = document.getElementById('picture');

    let resetBtn = document.querySelector("#reset")
    let isTeacherModeActive = false;




    loadUserData();

    resetBtn.addEventListener('click', (event) => {
        event.preventDefault();

        loadUserData();

        const user = getCurrentUser();
        if (user) {
            profileImage.src = user.profile.picture;
        }
    });
    
    fileInput.addEventListener('change', function (e) {
        profileImage.src = URL.createObjectURL(e.target.files[0]);
        const reader = new FileReader();
        reader.onload = function (event) {
            updateProfilePicture(currentUserEmail, event.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    });

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
        function getCurrentUser() {
            const users = fromLocalStorage();
            return users.find(user => user.email === currentUserEmail);
        }

        const user = getCurrentUser();

        Name.value = user.profile.name;
        age.value = user.profile.age;
        skill.value = user.profile.skill;
        email.value = user.email;
        role.value = user.profile.role || "Student";
        bio.value = user.profile.bio;
        subject.value = user.profile.subject;
        profileImage.src = user.profile.picture;
        teachingCheckbox.checked = user.profile.role.includes('Teacher');
        isTeacherModeActive = teachingCheckbox.checked;
        updateFormForTeacherMode();
    }

    function saveToLocalStorage() {
        let users = fromLocalStorage();
        let userIndex = users.findIndex(user => user.email === currentUserEmail);

        users[userIndex].profile.name = Name.value;
        users[userIndex].profile.age = age.value;
        users[userIndex].profile.skill = skill.value;
        users[userIndex].profile.role = role.value;
        users[userIndex].profile.bio = bio.value;
        users[userIndex].profile.subject = subject.value;
        users[userIndex].profile.picture = profileImage.src;

        localStorage.setItem("learnLandUsers", JSON.stringify(users));
    }
});