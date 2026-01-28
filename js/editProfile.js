document.addEventListener('DOMContentLoaded', function () {

    const currentUserEmail = localStorage.getItem("currentUserEmail");

    let Name = document.querySelector('#fullname');
    let age = document.querySelector('#age');
    let skill = document.querySelector('#skill');
    let role = document.querySelector('#role');
    let link1 = document.querySelector('#whats');
    let link2 = document.querySelector('#linkedin');
    let link3 = document.querySelector('#insta');
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
        // TODO: Fetch user profile picture from backend
        // profileImage.src = user.profile.picture;
    });

    fileInput.addEventListener('change', function (e) {
        profileImage.src = URL.createObjectURL(e.target.files[0]);
        const reader = new FileReader();
        reader.onload = function (event) {
            // TODO: Upload profile picture to backend
            // updateProfilePicture(currentUserEmail, event.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    function updateFormForTeacherMode() {
        if (isTeacherModeActive) {
            if (!role.value.includes('Teacher')) {
                role.value = role.value === 'Student' ? 'Student,Teacher' : 'Teacher';
            }
            link1.disabled = false;
            link2.disabled = false;
            link3.disabled = false;
        } else {
            if (role.value === 'Student,Teacher') {
                role.value = 'Student';
            } else if (role.value === 'Teacher') {
                role.value = 'Student';
            }
            link1.disabled = true;
            link1.value = '';
            link2.disabled = true;
            link2.value = '';
            link3.disabled = true;
            link3.value = '';
        }
    }

    updateFormForTeacherMode();

    teachingCheckbox.addEventListener('change', function () {
        isTeacherModeActive = this.checked;
        updateFormForTeacherMode();
    });

    save_btn.addEventListener("click", (event) => {
        event.preventDefault();

        if (checkInputs()) {
            // TODO: Save profile data to backend
            // saveToBackend();

            // Redirect based on teaching mode
            if (isTeacherModeActive) {
                window.location.href = "pages/teacherrequest.html";
            } else {
                window.location.href = "profile.htm";
            }
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
        const link1Value = link1.value.trim();
        const link2Value = link2.value.trim();
        const link3Value = link3.value.trim();

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
            if (link1Value === '') {
                setErrorFor(link1, "WhatsApp link is required for teachers");
                isValid = false;
            } else if (!isValidUrl(link1Value)) {
                setErrorFor(link1, "Please enter a valid URL for WhatsApp");
                isValid = false;
            } else {
                setSuccessFor(link1);
            }
            if (link2Value === '') {
                setErrorFor(link2, "LinkedIn link is required for teachers");
                isValid = false;
            } else if (!isValidUrl(link2Value)) {
                setErrorFor(link2, "Please enter a valid URL for LinkedIn");
                isValid = false;
            } else {
                setSuccessFor(link2);
            }
            if (link3Value === '') {
                setErrorFor(link3, "Instagram link is required for teachers");
                isValid = false;
            } else if (!isValidUrl(link3Value)) {
                setErrorFor(link3, "Please enter a valid URL for Instagram");
                isValid = false;
            } else {
                setSuccessFor(link3);
            }
        } else {
            setSuccessFor(link1);
            setSuccessFor(link2);
            setSuccessFor(link3);
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

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
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
    //--------hadil added from here 
    function loadUserData() {

        fetch('/LearnLand/api/get_profile.php', { credentials: "include" })// to send the session cookie 
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(user => {
                populateForm(user);
            })
            .catch(err => {
                console.error('Failed to load user data:', err);
                small.innerText = 'Failed to load profile data.';
            });
    };
    function populateForm(user) {
        Name.value = user.full_name || '';
        age.value = user.age || '';
        skill.value = user.skill || '';
        email.value = user.email || '';
        bio.value = user.bio || '';

        // Teacher mode
        if (user.is_teacher && user.is_teacher == 1) {
            isTeacherModeActive = true;
            role.value = "Teacher";
            teachingCheckbox.checked = true;
        } else {
            isTeacherModeActive = false;
            role.value = "Student";
            teachingCheckbox.checked = false;
        }

        updateFormForTeacherMode();

        // Teacher links
        link1.value = user.whatsapp_link || '';
        link2.value = user.linkedIn_link || '';
        link3.value = user.insta_link || '';

        // Profile picture
        profileImage.src = user.profile_picture || 'images1/profilePicture1.jpg';
    }


    /*
    const user = getCurrentUserFromBackend();
    if (user) {
        Name.value = user.profile.name || '';
        age.value = user.profile.age || '';
        skill.value = user.profile.skill || '';
        email.value = user.email || '';
        role.value = user.profile.role || "Student";
        bio.value = user.profile.bio || '';
        link1.value = user.profile.whatsapp || '';
        link2.value = user.profile.linkedin || '';
        link3.value = user.profile.instagram || '';
        profileImage.src = user.profile.picture || '';
        teachingCheckbox.checked = user.profile.role ? user.profile.role.includes('Teacher') : false;
        isTeacherModeActive = teachingCheckbox.checked;
        updateFormForTeacherMode();
    }
    */
}); // TODO: Remove these localStorage functions and implement backend equivalents
// function saveToLocalStorage() { ... }
// function fromLocalStorage() { ... }
// function updateProfilePicture(email, pictureData) { ... }
// function getCurrentUser() { ... }



