document.addEventListener('DOMContentLoaded', function () {

    function getUserFromArray() {
        const users = fromLocalStorage(); 
        return users[0];
    }

    const user = getUserFromArray(); 

    let NameValue = document.querySelector('#FullnameV'),
        ageValue = document.querySelector('#AgeV'),
        emailValue = document.querySelector('#emailV'),
        skillValue = document.querySelector('#skillV'),
        bioValue = document.querySelector('#bioV'),
        teacherModeElement = document.querySelector('.teacher-mode'),
        certificateSection = document.querySelector('.certificate-section');

    // Set form values
    NameValue.value = user.profile.name;
    ageValue.value = user.profile.age;
    emailValue.value = user.email;
    skillValue.value = user.profile.skill;
    bioValue.value = user.profile.bio;

})
let remove = document.getElementById("remove");
let mydialog = document.getElementById("popup");
remove.addEventListener('click', () => {
    mydialog.showModal();
});
function closePop() {
    mydialog.close();
}
mydialog.addEventListener('click', () => {

    mydialog.close();





    function updateUIForUserRole() {
        const userRole = user.profile.role;
        const isTeacher = userRole.includes('Teacher');

        if (isTeacher) {

            teacherModeElement.style.display = 'block';

            certificateSection.style.display = 'flex';
        } else {

            teacherModeElement.style.display = 'none';

            certificateSection.style.display = 'none';
        }
    }


    updateUIForUserRole();
});