let ackBtn = document.querySelector(".acknowledge");
let closeBtn = document.querySelector(".close");
ackBtn.addEventListener("click", () => {
    window.parent.closePop();
})
closeBtn.addEventListener("click", () => {
    window.parent.closePop();
})