const slider_btn = document.querySelector("#slider");
const chat = document.querySelector("aside");
const content = document.querySelector(".content");

slider_btn.addEventListener("click", () => {
    const chatVisible = window.getComputedStyle(chat).display !== "none";

    if (chatVisible) {
        chat.style.display = "none";
        content.style.display = "flex";
    } else {
        chat.style.display = "flex";
        content.style.display = "none";
    }
});
