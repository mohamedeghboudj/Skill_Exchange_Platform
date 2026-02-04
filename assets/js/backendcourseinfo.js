// courseInfo.js - FINAL CLEAN VERSION (no Name/Skill fields)
let play = document.querySelector("#play");
let sendRequest = document.querySelector("#send");
let mydialog = document.getElementById("popup");

// EXACT SAME UI behavior
play.addEventListener("click", () => {
    window.location.href = "videoPlayer.html";
});

sendRequest.addEventListener('click', () => {
    mydialog.showModal();
});

function closePop() {
    mydialog.close();
}

mydialog.addEventListener('click', (e) => {
    if (e.target === mydialog) {
        mydialog.close();
    }
});

// Load course data - TRY BACKEND FIRST, then fallback
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

console.log("Course ID from URL:", id);

if (id) {
    loadCourseFromBackend(id);
} else {
    console.error("No course ID found in URL");
    // Try to get from localStorage as fallback
    const storedId = localStorage.getItem('selected_course_id');
    if (storedId) {
        loadCourseFromBackend(storedId);
    }
}

async function loadCourseFromBackend(courseId) {
    try {
        console.log("Loading course from backend, ID:", courseId);
        const response = await fetch(`/api/get_course_details.php?course_id=${courseId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Backend response received:", data);
        
        if (data.success) {
            populateCourseFromBackend(data.course);
        } else {
            console.warn("Backend failed:", data.message);
            loadCourseFromLocalStorage(courseId);
        }
    } catch (error) {
        console.error("Backend error:", error);
        loadCourseFromLocalStorage(courseId);
    }
}

function populateCourseFromBackend(course) {
    console.log("Populating course from backend:", course.title);
    
    // Update all course info fields
    const courseName = document.querySelector("#course-name");
    const description = document.querySelector("#description");
    const price = document.querySelector("#price");
    const duration = document.querySelector("#duration");
    const teacherName = document.querySelector(".teacher-name");
    const teacherNameHeading = document.querySelector("#teacher-name");
    
    if (courseName) courseName.textContent = course.title;
    if (description) description.textContent = course.description;
    if (price) price.textContent = `$${course.price}`;
    if (duration) duration.textContent = course.duration;
    if (teacherName) teacherName.textContent = course.teacher.name;
    if (teacherNameHeading) teacherNameHeading.textContent = course.teacher.name;
    
    // Store course ID for request form
    localStorage.setItem('current_course_id', course.id);
}

function loadCourseFromLocalStorage(courseId) {
    console.log("Falling back to localStorage for course ID:", courseId);
    
    import("/assets/data/courseService.js").then(module => {
        const course = module.getCourseById(courseId);
        console.log("LocalStorage course found:", course);
        
        if (course) {
            const courseName = document.querySelector("#course-name");
            const description = document.querySelector("#description");
            const price = document.querySelector("#price");
            const duration = document.querySelector("#duration");
            const teacherName = document.querySelector(".teacher-name");
            const teacherNameHeading = document.querySelector("#teacher-name");
            
            if (courseName) courseName.textContent = course.title;
            if (description) description.textContent = course.description;
            if (price) price.textContent = course.price;
            if (duration) duration.textContent = course.duration;
            if (teacherName) teacherName.textContent = course.instructor;
            if (teacherNameHeading) teacherNameHeading.textContent = course.instructor;
            
            // Store course ID for request form
            localStorage.setItem('current_course_id', courseId);
            
        }
    }).catch(error => {
        console.error("Failed to load courseService.js:", error);
    });
}