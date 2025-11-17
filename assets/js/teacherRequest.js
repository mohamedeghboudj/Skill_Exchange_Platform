const uploadDiv = document.querySelector('.uploadphoto');
const fileInput = document.getElementById('upload');
let skill = document.querySelector('#skills');
let bio = document.querySelector("#bio");
let terms = document.querySelector("#term");
let submit = document.querySelector("#send");
let result = document.querySelector("#result")

result.style.display = "none";
function setErrorFor(input, message) {
    result.style.display = "block";
    result.innerHTML = message;
    input.classList.add('error');
    input.classList.remove("success");
}
function setSuccessFor(input) {
    input.classList.add('success');
    input.classList.remove("error");
}


uploadDiv.addEventListener('click', () => {
    fileInput.click();
});

submit.addEventListener('click', (e) => {
    e.preventDefault();
    checkInputs();
});

function checkInputs() {
    const skillvalue = skill.value.trim();
    const biovalue = bio.value.trim();
    result.innerHTML = "";
    result.style.display = "none";


    if (!skillvalue) {
        setErrorFor(skill, "Please fill your skills!");
        return;
    } else if (skillvalue.length < 10) {
        setErrorFor(skill, "Please enter more skills!");
        return;
    } else {
        setSuccessFor(skill);
    }

    if (fileInput.files.length == 0) {
        setErrorFor(fileInput, "Certificates are required for this process!");
        return;
    } else {
        setSuccessFor(fileInput);
    }

    if (!biovalue) {
        setErrorFor(bio, "Please fill the bio area!");
        return;
    } else if (biovalue.length < 10) {
        setErrorFor(bio, "Please let us know more about your experience!");
        return;
    } else {
        setSuccessFor(bio);
    }

    if (!terms.checked) {
        result.style.display="block";
        result.innerHTML = "You must agree before continuing!";
        return;

    }
    result.innerHTML = "";
    result.style.display = "none";
    skill.value = "";
    bio.value = "";
    terms.checked = false;
}
