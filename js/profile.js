document.addEventListener('DOMContentLoaded', function () {

    const currentUserEmail = sessionStorage.getItem("currentUserEmail");

    function getUserFromArray() {
        const users = fromLocalStorage();
        // Find user by email instead of taking the first one
        return users.find(user => user.email === currentUserEmail);
    }

    const user = getUserFromArray();

    // Check if user exists
    if (!user) {
        console.log("User not found - redirecting to login");
        window.location.href = "/auth.html";
        return;
    }

    let NameValue = document.querySelector('#FullnameV'),
        ageValue = document.querySelector('#AgeV'),
        emailValue = document.querySelector('#emailV'),
        skillValue = document.querySelector('#skillV'),
        bioValue = document.querySelector('#bioV'),
        teacherModeElement = document.querySelector('.teacher-mode'),
        certificateSection = document.querySelector('.certificate-section');
    profileImage = document.querySelector('.profile-pic');


    // Set form values
    NameValue.value = user.profile.name;
    ageValue.value = user.profile.age;
    emailValue.value = user.email;
    skillValue.value = user.profile.skill;
    bioValue.value = user.profile.bio;

    profileImage.src = user.profile.picture;

    // ADD UPLOAD FUNCTIONALITY HERE
    const uploadButton = document.querySelector('.Upload-button');
    const certificateInput = document.getElementById('Certificate');
    const certificateObject = document.querySelector('.certificate-object');

    

    // When certificate is selected, show the certificate
    if (certificateInput && certificateObject) {
        certificateInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                certificateObject.style.display = 'block';
                
                // Update certificate text with file name
                const fileName = e.target.files[0].name;
                const certificateText = certificateObject.querySelector('p');
                if (certificateText) {
                    certificateText.textContent = fileName;
                }
            }
        });
    }

    function updateUIForUserRole() {
        const userRole = user.profile.role;
        const isTeacher = userRole.includes('Teacher');

        if (teacherModeElement && certificateSection) {
            if (isTeacher) {
                teacherModeElement.style.display = 'block';
                certificateSection.style.display = 'flex';
            } else {
                teacherModeElement.style.display = 'none';
                certificateSection.style.display = 'none';
            }
        }
    }

    updateUIForUserRole();
    window.addEventListener('message', function (event) {
        if (event.data === 'hideCertificate') {
            const certificateObject = document.querySelector(".certificate-object");
            if (certificateObject) {
                certificateObject.style.display = 'none';
            }
        }
    });



    let remove = document.querySelector(".Remove");
    let mydialog = document.getElementById("popup");


    remove.addEventListener('click', () => {
        mydialog.showModal();
    });

    window.closePop = function () {
        mydialog.close();
    };

    mydialog.addEventListener('click', () => {
        mydialog.close();
    });

    let showTrems = document.querySelector("#vpt");
    let mydialog2 = document.getElementById("popup1");

    showTrems.addEventListener('click', (e) => {
        e.preventDefault();
        mydialog2.showModal();
    });



    mydialog2.addEventListener('click', (e) => {
        e.preventDefault();
        mydialog2.close();
    });
    let closeBtn = document.querySelector(".close");


    closeBtn.addEventListener("click", () => {
        mydialog2.close();
    })
    let teachnav = document.querySelector(".teachnav")
    function handleBecomeTeacherClick() {
        const storedCurrentUser = localStorage.getItem("currentUser");

        if (!storedCurrentUser) {
            console.warn("No user logged in");
            return;
        }

        const currentUser = JSON.parse(storedCurrentUser);

        // Load the latest users array
        const allUsers = fromLocalStorage() || users;

        // Find the fresh user by ID
        const freshUser = allUsers.find(u => u.id === currentUser.id);

        if (!freshUser) {
            console.error("User not found in database");
            return;
        }

        // Check teacherProfile properly
        if (freshUser.teacherProfile) {
            // User is a teacher
            window.location.href = "/html/teach.html";
        } else {
            // User is not yet a teacher
            window.location.href = "/pages/teacherrequest.html";
        }
    }

    document.querySelector(".teachnav").addEventListener("click", (e) => {
        e.preventDefault();
        handleBecomeTeacherClick();
    });

});