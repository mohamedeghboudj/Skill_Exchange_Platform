const menu=document.querySelector(".menuIcon")
const navigation=document.querySelector(".navigation")


menu.addEventListener("click",()=>{
    navigation.classList.toggle('active');
    menu.classList.toggle('active');
})