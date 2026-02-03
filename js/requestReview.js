//requestReview.js
let acceptBtn = document.querySelector("#ACCEPT");
let refusBtn = document.querySelector("#REFUS");

// These elements only exist inside requestReview.html (loaded in iframe)
// Guard so this doesn't crash when loaded on teach.html directly
if (acceptBtn && refusBtn) {
    acceptBtn.addEventListener("click", () => {
        window.parent.closePop();
    });

    refusBtn.addEventListener("click", () => {
        window.parent.closePop();
    });
}

const messageEl = document.getElementById("message");
if (messageEl) {
    messageEl.value = "I'm interested in learning photography, especially street photography. I enjoy capturing spontaneous moments and real-life scenes. I learn best through practical exercises.";
}