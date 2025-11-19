// UPDATED: Real courses data extracted from the HTML static content
const courses = [
    {
        id: 1,
        title: "Web Development Course",
        instructor: "Dr. Sarah Ahmed",
        category: "Computer Science",
        duration: "8 weeks",
        price: 120,
        rating: 4.7,
        description: "Learn modern web development with HTML, CSS, JavaScript, and more."
    },
    {
        id: 2,
        title: "UI/UX Course",
        instructor: "Dr. John Smith",
        category: "Design",
        duration: "6 weeks",
        price: 100,
        rating: 4.5,
        description: "Learn UI/UX design principles, wireframing, prototyping, and usability testing."
    }
]

// Always overwrite localStorage during development
localStorage.setItem("courses", JSON.stringify(courses));



export function getCourses() {
    const data = localStorage.getItem("courses");
    console.log(data);

    return data ? JSON.parse(data) : [];
}

export function getCourseById(id) {
    const courses = getCourses();
    return courses.find(course => course.id === id);
}

export function addCourse(newCourse) {
    const courses = getCourses();
    newCourse.id = Date.now();
    courses.push(newCourse);
    localStorage.setItem("courses", JSON.stringify(courses));
}

export function deleteCourse(id) {
    let courses = getCourses();
    courses = courses.filter(course => course.id !== id);
    localStorage.setItem("courses", JSON.stringify(courses));
}

export function updateCourse(updatedCourse) {
    const courses = getCourses().map(course =>
        course.id === updatedCourse.id ? updatedCourse : course
    );
    localStorage.setItem("courses", JSON.stringify(courses));
}
