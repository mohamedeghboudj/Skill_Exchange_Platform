//droplist.js
const btn = document.getElementById('category-btn');
// const selectedDiv = document.querySelector("#dropdown-selected");
const droplist = document.querySelector('#droplist-ul');
const select = document.querySelector('.select-txt');

// toggle dropdown 
btn.addEventListener('click', () => {
    droplist.classList.toggle('show');
});

selectedDiv.addEventListener("click", () => {
    droplist.classList.toggle('show');
});

// handle item selection
droplist.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {

        // update visible selected value
        select.textContent = li.textContent;

        // close 
        droplist.classList.remove("show");
    });
});

// close dropdown if clicked outside
document.addEventListener("click", (e) => {
    if (!selectedDiv.contains(e.target) && !droplist.contains(e.target) && !btn.contains(e.target)) {
        droplist.classList.remove("show");
    }
});
