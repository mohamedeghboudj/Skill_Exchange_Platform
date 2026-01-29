//main.js
const menu = document.querySelector(".menuIcon")
const navigation = document.querySelector(".navigation")
let courses = document.querySelectorAll(".course")
let category = document.querySelectorAll(".category")
let footCategory = document.querySelectorAll(".foot-cat")

menu.addEventListener("click", () => {
    navigation.classList.toggle('active');
    menu.classList.toggle('active');
})

footCategory.forEach(category => {
    category.addEventListener('click', () => {
        const categoryName = category.innerText.toLowerCase();
        window.location.href = `/pages/home.html?filter=1&category=${encodeURIComponent(categoryName)}`;
    });
})

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const shouldFilter = params.get("filter");
    const categoryName = params.get("category");

    if (shouldFilter && categoryName) {
        const courses = document.querySelectorAll(".course");

        courses.forEach(course => {
            const courseCategory = course.getAttribute("data-category").toLowerCase();

            if (courseCategory === categoryName.toLowerCase()) {
                course.style.display = "block";
            } else {
                course.style.display = "none";
            }
        });

        document.querySelector(".courseslist").scrollIntoView({behavior:"smooth"});
    }
});
