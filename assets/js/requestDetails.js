let payBtn = document.querySelector(".pay");
let cancelBtn = document.querySelector(".cancel");
let parentDialog = window.parent.document.getElementById("popup2");

    payBtn.addEventListener("click", () => {
        window.parent.closePop();

       parentDialog.showModal();

    });



cancelBtn.addEventListener("click", () => {
    window.parent.closePop();
});