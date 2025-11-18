const slider_btn = document.querySelector("#slider");
const chat = document.querySelector("aside");
const content = document.querySelector(".content");

// Apply on page load
InitializeState();

// fix on resize 
window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        chat.classList.remove("hidden");
        content.classList.remove("hidden");
    } else {

        chat.classList.add("hidden");
        content.classList.remove("hidden");
    }
});

// Toggle button 
slider_btn.addEventListener("click", () => {
    if (window.innerWidth < 768) {
        chat.classList.toggle("hidden");
        content.classList.toggle("hidden");
    }
});

// Initial state function
function InitializeState() {
    if (window.innerWidth < 768) {
        chat.classList.add("hidden");
        content.classList.remove("hidden");
    }
}
