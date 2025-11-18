const slider_btn = document.querySelector("#slider");
const chat = document.querySelector("aside");
const content = document.querySelector(".content");

//on page load
InitializeState();

// on resize 
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


function InitializeState() {
    if (window.innerWidth < 768) {
        chat.classList.add("hidden");
        content.classList.remove("hidden");
    }
}
