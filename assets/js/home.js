document.addEventListener("DOMContentLoaded", () => {
    const search = document.querySelector(".searching");
    const categories = Array.from(document.querySelectorAll(".category"));
    const searchToggle = document.querySelector("#search-cat");
    const categoriesSection = document.querySelector(".categories");
    const container = document.querySelector("#course-list");
    const noCourses = document.getElementById("noCourses");
    const becomeTeacherBtn = document.getElementById("becomeTeacher");
    const teachNavLink = document.querySelector(".teachnav");

    const hasCourseCatalog = Boolean(
        search &&
        searchToggle &&
        categoriesSection &&
        container &&
        noCourses
    );

    function getProfilePicturePath(profilePath) {
        if (!profilePath || profilePath.trim() === "") {
            return "/assets/images/person.webp";
        }

        return profilePath.startsWith("/") ? profilePath : `/${profilePath}`;
    }

    function attachCourseClickListeners() {
        document.querySelectorAll(".course").forEach(courseCard => {
            courseCard.addEventListener("click", function () {
                const courseId = this.dataset.id;
                if (courseId) {
                    window.location.href = `/pages/courseInfo.html?id=${courseId}`;
                }
            });
        });

        document.querySelectorAll(".start-btn").forEach(button => {
            button.addEventListener("click", function (e) {
                e.stopPropagation();

                const courseId = this.dataset.courseId;
                if (courseId) {
                    window.location.href = `/pages/courseInfo.html?id=${courseId}`;
                }
            });
        });
    }

    function renderCourses(data) {
        if (!hasCourseCatalog) {
            return;
        }

        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            noCourses.style.display = "block";
            return;
        }

        noCourses.style.display = "none";

        data.forEach(course => {
            const profilePic = getProfilePicturePath(course.teacher_profile);

            container.innerHTML += `
                <div class="course" data-category="${course.category}" data-id="${course.id}">
                    <div class="skillicon">
                        <img src="/assets/images/${course.category}.png" height="50">
                    </div>
                    <h3>${course.title}</h3>
                    <div class="teacher">
                        <img src="${profilePic}" alt="${course.instructor || "Unknown"}" height="25" width="25">
                        <p id="teacherName">${course.instructor || "Unknown"}</p>
                    </div>
                    <div class="time">
                        <img src="/assets/images/clock.png" width="12" height="12">
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
                        <button class="start-btn" data-course-id="${course.id}">start →</button>
                    </div>
                </div>
            `;
        });

        attachCourseClickListeners();
    }

    async function loadCourses(url) {
        if (!hasCourseCatalog) {
            return;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            renderCourses(data);
        } catch (error) {
            console.error("Error loading courses:", error);
            noCourses.style.display = "block";
        }
    }

    if (hasCourseCatalog) {
        searchToggle.addEventListener("click", () => {
            categoriesSection.classList.toggle("hidden");
        });

        search.addEventListener("input", () => {
            const query = search.value.trim();
            loadCourses(`/assets/php/search-courses.php?q=${encodeURIComponent(query)}`);
        });

        categories.forEach(categoryElement => {
            categoryElement.addEventListener("click", () => {
                const categoryName = categoryElement.querySelector("h3")?.innerText.trim();
                if (categoryName) {
                    loadCourses(`/assets/php/fetch_courses_by_category.php?category=${encodeURIComponent(categoryName)}`);
                }
            });
        });

        loadCourses("/assets/php/fetch_courses_by_category.php");
    }

    async function handleBecomeTeacherClick() {
        try {
            const response = await fetch("/assets/php/check_teacher_home.php", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            window.location.href = data.redirect || "/pages/teacherrequest.html";
        } catch (error) {
            console.error("Error checking teacher status:", error);
            window.location.href = "/pages/teacherrequest.html";
        }
    }

    if (becomeTeacherBtn) {
        becomeTeacherBtn.addEventListener("click", handleBecomeTeacherClick);
    }

    if (teachNavLink) {
        teachNavLink.addEventListener("click", e => {
            e.preventDefault();
            handleBecomeTeacherClick();
        });
    }
});
