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


    let remove = document.getElementById("remove");
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
});