const search = document.querySelector(".searching")
let courses = document.querySelectorAll(".course")
let category = document.querySelectorAll(".category")
import { getCourses } from "../data/courseService.js";
import "../data/courses.js";

const container = document.querySelector("#course-list");

const mycourses = getCourses();




mycourses.forEach(course => {
    const card = `
                 <div class="course" data-category="${course.category}"  data-id="${course.id}">
                 <div class="skillicon">
                        <img src="/assets/images/${course.category}.png" alt="" height="50px">
                    </div>
                    <h3>${course.title}</h3>
                    <div class="teacher">
                        <div id="teacherimg">
                            <img src="/assets/images/person.webp" alt="person" height="25px" width="25px">
                        </div>
                        <p id="teacherName">${course.instructor}</p>
                    </div>

                    <div class="time">
                        <img src="../assets/images/3421313226a74d0e15b976fd032e4d85-removebg-preview.png" alt=""
                            width="12" height="12">
                        <p>${course.duration} to complete</p>
                    </div>
                    <p class="description">${course.description}</p>


                    <div class="coursefoot">
                        <div class="info">
                            <div class="rating"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-star-icon lucide-star">
                                    <path
                                        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                </svg>
                                <p>${course.rating}</p>
                            </div>
                            <span id="price">${course.price}</span>
                        </div>
                        <button><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>start</button>
                    </div>

                 </div>`;
    container.innerHTML += card;
    // Refresh NodeList AFTER cards are created
    courses = document.querySelectorAll(".course");

});

category.forEach(catEl => {
    catEl.addEventListener('click', () => {
        const categoryName = catEl.querySelector("h3").innerText.toLowerCase();
        const currentCourses = document.querySelectorAll(".course");

        currentCourses.forEach(course => {
            const courseCategory = course.getAttribute("data-category");

            if (courseCategory.toLowerCase() === categoryName) {
                course.style.display = "block";
            } else {
                course.style.display = "none";
            }
        });
    });
})

search.addEventListener('input', () => {
    const currentCourses = document.querySelectorAll(".course");
    const searchText = search.value.trim().toLowerCase();

    currentCourses.forEach(course => {
        const courseName = course.querySelector("h3").innerText.toLowerCase();
        const teacherName = course.querySelector("#teacherName").innerText.toLowerCase();

        if (searchText && !courseName.includes(searchText) && !teacherName.includes(searchText)) {
            course.style.display = "none";
        } else {
            course.style.display = "block";
        }
    });
});






courses.forEach(course => {
    course.addEventListener('click', () => {
        window.location.href = 'courseInfo.html';
    });
});
//
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

// Attach to button
document.getElementById("becomeTeacher")
    .addEventListener("click", handleBecomeTeacherClick);


document.getElementById("becomeTeacher").addEventListener("click", handleBecomeTeacherClick);

document.querySelector(".teachnav").addEventListener("click", (e) => {
    e.preventDefault();
    handleBecomeTeacherClick();

});
