let mydialog = document.getElementById("popup");
let mydialog2 = document.getElementById("popup2");
let request = document.querySelector(".request");

console.log("js is working")
request.addEventListener('click', () => {
    mydialog.showModal();
   
});


function closePop() {
    mydialog.close();
    
}
function closePop2() {
    mydialog2.close();
    
}
mydialog.addEventListener('click', () => {

    mydialog.close();
    
})
mydialog2.addEventListener('click', () => {

    mydialog2.close();
}
)

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




document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".teachnav").addEventListener("click", (e) => {
        e.preventDefault();
        handleBecomeTeacherClick();
    });
});
// Hadil touched this ---------------------------------------------------------------------------------
/*let chatLabels = document.getElementsByClassName("chat");

for (let chatLabel of chatLabels) {
  chatLabel.addEventListener('click', () => {
    window.location.href = "/html/studentProgress.html";
  });
}*/ 
