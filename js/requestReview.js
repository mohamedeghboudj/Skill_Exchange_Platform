let acceptBtn = document.querySelector("#ACCEPT");
let refusBtn = document.querySelector("#REFUS");


acceptBtn.addEventListener("click", () => {
    window.parent.closePop();
});

refusBtn.addEventListener("click", () => {
    window.parent.closePop();
});

document.getElementById("message").value = "I'm interested in learning photography, especially street photography. I enjoy capturing spontaneous moments and real-life scenes. I learn best through practical exercises combined with clear, step-by-step explanations.";