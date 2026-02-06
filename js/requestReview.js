//requestReview.js
let acceptBtn = document.querySelector("#ACCEPT");
let refusBtn = document.querySelector("#REFUS");

if (acceptBtn && refusBtn) {
    acceptBtn.addEventListener("click", () => {
        window.parent.closePop();
    });

    refusBtn.addEventListener("click", () => {
        window.parent.closePop();
    });
}
