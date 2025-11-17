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
