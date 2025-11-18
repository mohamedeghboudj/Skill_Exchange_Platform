let acceptBtn = document.querySelector("#ACCEPT");
let refusBtn = document.querySelector("#REFUS");


acceptBtn.addEventListener("click", () => {
    window.parent.closePop();
});

refusBtn.addEventListener("click", () => {
    window.parent.closePop();
});