const search = document.querySelector(".searching")
let courses = document.querySelectorAll(".course")
let category = document.querySelectorAll(".category")

let searchcat = document.querySelector("#search-cat");
const catsection = document.querySelector(".categories");
import { getCourses } from "../data/courseService.js";
import "../data/courses.js";


const container = document.querySelector("#course-list");


searchcat.addEventListener('click', () => {

    catsection.classList.toggle('hidden');
})
search.addEventListener("input", () => {
    const query = search.value.trim();

    fetch(`/learn-land/search_courses.php?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            courses = [];

            if (data.length === 0) {
                document.getElementById("noCourses").style.display = "block";
                return;
            }

            document.getElementById("noCourses").style.display = "none";

            data.forEach(course => {
                const card = `
                <div class="course" data-category="${course.category}" data-id="${course.id}">
                    <div class="skillicon">
                        <img src="/assets/images/${course.category.replace(/\s+/g, '').toLowerCase()}.png" height="50">
                    </div>

                    <h3>${course.title}</h3>

                    <div class="teacher">
                        <img src="/assets/images/person.webp" height="25" width="25">
                        <p id="teacherName">${course.instructor}</p>
                    </div>

                    <div class="time">
                        <img src="../assets/images/clock.png" width="12" height="12">
                        <p>${course.duration} to complete</p>
                    </div>

                    <p class="description">${course.description}</p>

                    <div class="coursefoot">
                        <div class="info">
                            <div class="rating">
                                ⭐ <p>${course.rating}</p>
                            </div>
                            <span id="price">${course.price}</span>
                        </div>
                        <button>start →</button>
                    </div>
                </div>
                `;

                container.innerHTML += card;
            });

            courses = document.querySelectorAll(".course");
        });
});

category.forEach(catEl => {
    catEl.addEventListener('click', () => {
        const categoryName = catEl.querySelector("h3").innerText.trim();

        fetch(`/learn-land/fetch_courses_by_category.php?category=${encodeURIComponent(categoryName)}`)
            .then(res => res.json())
            .then(data => {
                container.innerHTML = "";

                if (data.length === 0) {
                    document.getElementById("noCourses").style.display = "block";
                    return;
                }
                document.getElementById("noCourses").style.display = "none";

                data.forEach(course => {
                    const card = `
                        <div class="course" data-category="${course.category}" data-id="${course.id}">
                            <div class="skillicon">
                                <img src="/assets/images/${course.category.replace(/\s+/g, '').toLowerCase()}.png" height="50">
                            </div>
                            <h3>${course.title}</h3>
                            <div class="teacher">
                                <img src="/assets/images/person.webp" height="25" width="25">
                                <p id="teacherName">${course.instructor}</p>
                            </div>
                            <div class="time">
                                <img src="../assets/images/clock.png" width="12" height="12">
                                <p>${course.duration} to complete</p>
                            </div>
                            <p class="description">${course.description}</p>
                            <div class="coursefoot">
                                <div class="info">
                                    <div class="rating">
                                        ⭐ <p>${course.rating}</p>
                                    </div>
                                    <span id="price">${course.price}</span>
                                </div>
                                <button>start →</button>
                            </div>
                        </div>
                    `;
                    container.innerHTML += card;
                });

                // Attach click to new courses
                document.querySelectorAll(".course").forEach(course => {
                    course.addEventListener('click', () => {
                        window.location.href = 'courseInfo.html';
                    });
                });
            })
            .catch(err => console.error("Error fetching category courses:", err));
    });
});


function checkIfAnyCourseVisible() {
    const noCoursesMsg = document.getElementById("noCourses");

    let anyVisible = false;

    courses.forEach(course => {
        if (getComputedStyle(course).display !== "none") {
            anyVisible = true;
        }
    });

    noCoursesMsg.style.display = anyVisible ? "none" : "block";
}






courses.forEach(course => {
    course.addEventListener('click', () => {
        window.location.href = 'courseInfo.html';
    });
});
//
// hadil has to change starting from here !
//--------------------------------------------------------THIS IS NOT WORKING YET -----------------------------------------
function handleBecomeTeacherClick() {
    //  const storedCurrentUser = localStorage.getItem("currentUser");

    // if (!storedCurrentUser) {
    //    console.warn("No user logged in");
    //   return;
    // }

    // const currentUser = JSON.parse(storedCurrentUser);

    // Load the latest users array
    // const allUsers = fromLocalStorage() || users;

    // Find the fresh user by ID
    // const freshUser = allUsers.find(u => u.id === currentUser.id);

    // if (!freshUser) {
    //    console.error("User not found in database");
    //   return;
    // }

    // Check teacherProfile properly
    // if (freshUser.teacherProfile) {
    // User is a teacher
    //    window.location.href = "/html/teach.html";
    window.location.href = "/html/teach.html";
    //} else {
    // User is not yet a teacher
    //     window.location.href = "/pages/teacherrequest.html";
    // }
}

// Attach to button
document.getElementById("becomeTeacher")
    .addEventListener("click", handleBecomeTeacherClick);


document.getElementById("becomeTeacher").addEventListener("click", handleBecomeTeacherClick);
// adding the logic to the nav bar 
document.querySelector(".teachnav").addEventListener("click", (e) => {
    e.preventDefault();
    handleBecomeTeacherClick();

});

function renderCourses(data) {
    container.innerHTML = "";

    if (!data || data.length === 0) {
        document.getElementById("noCourses").style.display = "block";
        return;
    }

    document.getElementById("noCourses").style.display = "none";

    data.forEach(course => {
        const card = `
            <div class="course" data-id="${course.id}">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <span>${course.price}</span>
            </div>
        `;
        container.innerHTML += card;
    });
}
