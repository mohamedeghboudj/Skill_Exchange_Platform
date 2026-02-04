// droplist.js
const btn = document.getElementById('category-btn');
const droplist = document.querySelector('#droplist-ul');
const select = document.querySelector('.select-txt');

// Only run on pages that actually have the dropdown (e.g. addcourse.html)
if (btn && droplist && select) {
    btn.addEventListener('click', () => {
        droplist.classList.toggle('show');
    });

    select.addEventListener("click", () => {
        droplist.classList.toggle('show');
    });

    droplist.querySelectorAll("li").forEach(li => {
        li.addEventListener("click", () => {
            select.textContent = li.textContent;
            droplist.classList.remove("show");
        });
    });

    // close dropdown if clicked outside
    document.addEventListener("click", (e) => {
        if (!select.contains(e.target) && !droplist.contains(e.target) && !btn.contains(e.target)) {
            droplist.classList.remove("show");
        }
    });
}