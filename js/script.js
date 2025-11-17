
document.addEventListener("DOMContentLoaded", () => {
    // Inddex page 
    const counter = document.querySelectorAll('.number.counter');
    console.log(counter);
    const Speed = 1000;
    counter.forEach(Counter => {
        const updateCount = () => {
            const target = +Counter.getAttribute('data_target');
            const count = +Counter.innerText;
            const inc = target / Speed;
            if (count < target) {
                Counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            }
            else {
                Counter.innerText = target;
            }
        }
        updateCount();
    });


    // FAQ 

    const question = document.querySelectorAll(".faq-ques");
    question.forEach(question => {
        question.addEventListener("click", () => {
            question.classList.toggle("active");
            const answer = question.nextElementSibling;
            const icon = question.querySelector(".icon");
            if (answer.style.display == "block") {
                answer.style.display = "none";
                icon.textContent = "+";
            } else {
                answer.style.display = "block";
                icon.textContent = "-";
            }
        })
    });
    //Height of the text area - index page :
    const textarea = document.getElementById("question");
    if (textarea) {
        textarea.addEventListener("input", () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        });
        textarea.addEventListener("blur", () => {
            textarea.style.height = "40px";
        });
    }

    //animation sign in sign up page
    const signUpButton = document.getElementById('SignUp');
    const signInButton = document.getElementById('SignIn');
    const container = document.getElementById('container');
    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });
        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }


    //dropdown list select level student request
    const level = document.getElementById('selected');
    const list = document.getElementById('level-list');
    let para = document.querySelector("#default");

    if (level && list) {
        level.addEventListener('click', () => {
            list.style.display = (list.style.display === "block") ? "none" : "block";

        });
        const beginner = document.getElementById('beginner');
        const intermediate = document.getElementById('intermediate');
        const advanced = document.getElementById('advanced');
        beginner.addEventListener('click', () => {
            para.innerHTML = beginner.innerHTML;
            para.style.color = "black";
            list.style.display = (list.style.display === "block") ? "none" : "block";

        });
        intermediate.addEventListener('click', () => {
            para.innerHTML = intermediate.innerHTML;
            para.style.color = "black";
            list.style.display = (list.style.display === "block") ? "none" : "block";
        });
        advanced.addEventListener('click', () => {
            para.innerHTML = advanced.innerHTML;
            para.style.color = "black";
            list.style.display = (list.style.display === "block") ? "none" : "block";
        });
        document.addEventListener('click', (e) => {
            if (!list.contains(e.target) && !level.contains(e.target)) {
                list.style.display = "none";
            }
        });
    }
    const days = document.getElementById('selected-day');
    const DayList = document.getElementById('days-list');
    const choice = document.querySelectorAll('.chosen-day');
    const Input = document.querySelectorAll('.Day');
    let PARA = document.querySelector("#DEFAULT");
    if (days && DayList && choice && Input) {
        days.addEventListener('click', () => {
            DayList.style.display = (DayList.style.display === "block") ? "none" : "block";
        });


        // selecting the avilable days student request 
        Input.forEach((input) => {
            input.addEventListener('change', () => {

                const selectedDays = Array.from(Input)
                    .filter(i => i.checked)
                    .map(i => i.value);
                PARA.innerHTML = selectedDays.join('-');
                PARA.style.color = "black";
            });
        });
        document.addEventListener('click', (e) => {
            if (!DayList.contains(e.target) && !days.contains(e.target)) {
                DayList.style.display = "none";
            }
        });

    }

    // flipping the sign in sign up card in mobile version 


    const signUpRotate = document.getElementById('signUpRotate');
    const Container = document.getElementById('container');
    const signInRotate = document.getElementById('signInRotate');
    if (Container && signUpRotate && signInRotate) {
        signUpRotate.addEventListener('click', () => {
            Container.classList.add('flipped');
        });
        signInRotate.addEventListener('click', () => {
            Container.classList.remove('flipped');
        });
    } else {
        console.log({ Container, signUpRotate, signInRotate });
    }

    //2-form validation
    // 3-moc data manipulation 
    //ربي ما فيه غير الخير 
});