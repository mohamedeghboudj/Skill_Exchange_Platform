
document.addEventListener("DOMContentLoaded", () => {
    const search = document.querySelector(".searching")
    let courses = document.querySelectorAll(".course")
    let category = document.querySelectorAll(".category")
    let searchcat = document.querySelector("#search-cat");
    const catsection = document.querySelector(".categories");
    const container = document.querySelector("#course-list");

    searchcat.addEventListener('click', () => {
        catsection.classList.toggle('hidden');
    })

    search.addEventListener("input", () => {
        const query = search.value.trim();

        fetch(`/assets/php/search-courses.php?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                renderCourses(data);
            })
            .catch(err => console.error("Error searching courses:", err));
    });

    category.forEach(catEl => {
        catEl.addEventListener('click', () => {
            const categoryName = catEl.querySelector("h3").innerText.trim();

            fetch(`/assets/php/fetch_courses_by_category.php?category=${encodeURIComponent(categoryName)}`)
                .then(res => res.json())
                .then(data => {
                    renderCourses(data);
                })
                .catch(err => console.error("Error fetching category courses:", err));
        });
    });

    // Load all courses on page load
    fetch("/assets/php/fetch_courses_by_category.php")
        .then(res => res.json())
        .then(renderCourses)
        .catch(err => console.error("Error loading courses:", err));

    // Helper function to fix profile picture paths
    function getProfilePicturePath(profilePath) {
        if (!profilePath || profilePath.trim() === '') {
            return '/assets/images/person.webp';
        }

        // If already starts with /, use as-is
        if (profilePath.startsWith('/')) {
            return profilePath;
        }

        // Add leading slash if missing
        return '/' + profilePath;
    }

    function renderCourses(data) {
        container.innerHTML = "";

        if (!data || data.length === 0) {
            document.getElementById("noCourses").style.display = "block";
            return;
        }

        document.getElementById("noCourses").style.display = "none";

        data.forEach(course => {
            const profilePic = getProfilePicturePath(course.teacher_profile);
            const card = `
            <div class="course" data-category="${course.category}" data-id="${course.id}">
                <div class="skillicon">
                    <img src="/assets/images/${course.category}.png" height="50">
                </div>
                <h3>${course.title}</h3>
                <div class="teacher">
                    <img src="${profilePic}" alt="${course.instructor || 'Unknown'}" height="25" width="25">
                    <p id="teacherName">${course.instructor || 'Unknown'}</p>
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
                    <button>start →</button>
                </div>
            </div>
        `;
            container.innerHTML += card;
        });
        attachCourseClickListeners();

    }


    // Add this new function to attach click listeners
    function attachCourseClickListeners() {
        // Click on entire course card
        document.querySelectorAll('.course').forEach(courseCard => {
            courseCard.addEventListener('click', function (e) {
                // Don't trigger if clicking the button directly
                if (e.target.classList.contains('start-btn')) {
                    return;
                }

                const courseId = this.dataset.id;
                if (courseId) {
                    window.location.href = `/pages/courseInfo.html?id=${courseId}`;
                }
            });
        });

        // Click on start button
        document.querySelectorAll('.start-btn').forEach(button => {
            button.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent triggering the card click
                const courseId = this.dataset.courseId;
                if (courseId) {
                    window.location.href = `/pages/courseInfo.html?id=${courseId}`;
                }
            });
        });
    }

    category.forEach(catEl => {
        catEl.addEventListener('click', () => {
            const categoryName = catEl.querySelector("h3").innerText.trim();

            fetch(`/assets/php/fetch_courses_by_category.php?category=${encodeURIComponent(categoryName)}`)
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

    fetch("/assets/php/fetch_courses_by_category.php")
        .then(res => res.json())
        .then(renderCourses);






    courses.forEach(course => {
        course.addEventListener('click', () => {
            window.location.href = 'courseInfo.html';
        });
    });
    //
    // hadil has to change starting from here !
    //--------------------------------------------------------THIS IS NOT WORKING YET -----------------------------------------

    // ============================================================
    // HADIL COMMENTED OUT ORIGINAL CODE (preserved for grading)
    // ============================================================
    /*
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
    */
    // ============================================================
    // END OF ORIGINAL CODE
    // ============================================================


    // ============================================================
    // HADIL'S NEW VERSION: Backend-based teacher mode activation
    // ============================================================

    // Updated handleBecomeTeacherClick function with backend API call
    async function handleBecomeTeacherClick() {
        try {
            // Call backend API to check teacher status
            const response = await fetch('/assets/php/check_teacher_home.php', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log('Teacher status check:', data);

            // Redirect based on backend response
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                // Fallback - should not reach here
                window.location.href = '/pages/teacherrequest.html';
            }

        } catch (error) {
            console.error('Error checking teacher status:', error);
            // On error, default to teacher request page
            window.location.href = '/pages/teacherrequest.html';
        }
    }

    // HADIL ADDED: Attach event listeners on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        const becomeTeacherBtn = document.getElementById('becomeTeacher');
        const teachNavLink = document.querySelector('.teachnav');

        if (becomeTeacherBtn) {
            // Remove any existing listeners and add new one
            becomeTeacherBtn.replaceWith(becomeTeacherBtn.cloneNode(true));
            document.getElementById('becomeTeacher').addEventListener('click', handleBecomeTeacherClick);
        }

        if (teachNavLink) {
            teachNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleBecomeTeacherClick();
            });
        }
    });

});
