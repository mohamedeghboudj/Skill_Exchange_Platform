let mydialog = document.getElementById("popup");
let mydialog2 = document.getElementById("popup2");
let request = document.querySelector(".request");


request.addEventListener('click', () => {
    mydialog.showModal();
   
});


function closePop() {
    mydialog.close();
    
}
function closePop2() {
    mydialog2.close();
    
}
mydialog.addEventListener('click', () => {

    mydialog.close();
    
})
mydialog2.addEventListener('click', () => {

    mydialog2.close();
}
)

