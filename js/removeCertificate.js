let removeBtn=document.querySelector(".remove");
let cancelBtn=document.getElementById("cancel");


removeBtn.addEventListener('click',()=>{
   
    window.parent.postMessage('hideCertificate', '*');
    window.parent.closePop();
   
});
cancelBtn.addEventListener('click',()=>{
    window.parent.closePop();
});


