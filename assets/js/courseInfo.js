let play=document.querySelector("#play");
let sendRequest=document.querySelector("#send");
let mydialog=document.getElementById("popup");

play.addEventListener("click" ,()=>{
    window.location.href="videoPlayer.html";
});

sendRequest.addEventListener('click',()=>{
    mydialog.showModal();
});

function closePop(){
    mydialog.close();
}
mydialog.addEventListener('click',()=>{
     
    
        mydialog.close();
    
})