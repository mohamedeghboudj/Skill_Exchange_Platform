let ackBtn=document.querySelector(".acknowledge");
let closeBtn=document.querySelector(".close");
ackBtn.addEventListener("click",(e)=>{
    window.parent.closePop2();
})
closeBtn.addEventListener("click",(e)=>{
    window.parent.closePop2();
})