const chatToggle = document.querySelector(".chat-toggle");
const sidebar = document.querySelector(".sidebar");
const closeChat = document.querySelector(".close-chat");
const leftArrow=document.getElementById("left-arrow")

chatToggle.onclick = () => {
  sidebar.classList.add("active");
};

closeChat.onclick = () => {
  sidebar.classList.remove("active");
};

leftArrow.addEventListener('click',()=>{
  window.location.href="/html/teach.html";
})