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



//courseInfo display

import { getCourseById } from "../assets/data/courseService.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const course = getCourseById(id);
console.log(course);
console.log(id);

if (course) {
  document.querySelector("#course-name").textContent = course.title;
  document.querySelector("#description").textContent = course.description;
  document.querySelector("#price").textContent = course.price;
  document.querySelector("#duration").textContent = course.duration;
  document.querySelector(".teacher-name").textContent = course.instructor;
  document.querySelector("#teacher-name").textContent = course.instructor;

}
