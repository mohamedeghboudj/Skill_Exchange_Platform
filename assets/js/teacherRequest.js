
const uploadDiv = document.querySelector('.uploadphoto');
const fileInput = document.getElementById('upload');
let skill = document.querySelector('#skills');
let bio = document.querySelector("#bio");
let terms = document.querySelector("#term");
let submit = document.querySelector("#send");
let result = document.querySelector("#result")

result.style.display = "none";
// hadil added from here : 
window.addEventListener("DOMContentLoaded", checkTeacherStatus);

async function checkTeacherStatus() {
    try {
        const res = await fetch('/assets/php/check_teacher_request_status.php');
        const data = await res.json();

        if (data.status === 'no_request') {
            // No previous request → normal form
            return;
        }
        if (data.status === 'success') {
            const status = data.teacher_status;

            if (status === 'pending') {
                showMessage("⏳ Your request is under review. You cannot submit another one now.", "orange");
                disableForm();
            } else if (status === 'approved') {
                showMessage("✅ Approved! Redirecting you...", "green");
                setTimeout(() => window.location.href = "/html/teach.html", 1500);
            } else if (status === 'rejected') {
                showMessage("❌ Your previous request was rejected. You may submit a new one.", "red");
            }
        } else {
            // Not logged in or other error
            showMessage(data.message || "An error occurred. Please try again.", "red");
        }
    } catch (err) {
        console.error(err);
        showMessage("An error occurred while checking your status.", "red");
    }
}
function showMessage(msg, color) {
    result.style.display = "block";
    result.style.color = color;
    result.innerHTML = msg;
}

function disableForm() {
    skill.disabled = true;
    bio.disabled = true;
    fileInput.disabled = true;
    terms.disabled = true;
    submit.disabled = true;
    submit.style.opacity = "0.6";
    submit.style.cursor = "not-allowed";
    uploadDiv.style.display = "none";// to hide the upload area 
}





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

// hadil was here !!
/*submit.addEventListener('click', (e) => {
    e.preventDefault();
    if (checkInputs()) {
        window.location.href = "/html/teach.html";
    };
});*/
/*submit.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!checkInputs()) return;

    const formData = new FormData();
    formData.append('primary_skill', skill.value.trim());
    formData.append('bio', bio.value.trim());
    formData.append('certificate', fileInput.files[0]);

    try {
        const response = await fetch('/assets/php/teacher_request_send.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.status === 'success') {
            showMessage(data.message, "green");
            // clearing the form 
            skill.value = '';
            bio.value = '';
            fileInput.value = '';
            terms.checked = false;
        } else {
            showMessage(data.message, "red");
        }
    } catch (error) {
        console.error(error);
        showMessage('An error occurred. Please try again.', "red");
    }
});
*/
submit.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!checkInputs()) return;

    // DEBUG: Log what we're sending
    console.log('Skill:', skill.value.trim());
    console.log('Bio:', bio.value.trim());
    console.log('File:', fileInput.files[0]);

    // Check if file is actually selected
    if (!fileInput.files || fileInput.files.length === 0) {
        showMessage('Please select a certificate file', "red");
        return;
    }

    const formData = new FormData();
    formData.append('primary_skill', skill.value.trim());
    formData.append('bio', bio.value.trim());
    formData.append('certificate', fileInput.files[0]);

    // DEBUG: Log FormData contents
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
    }

    try {
        const response = await fetch('/assets/php/teacher_request_send.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        console.log('Server response:', data); // DEBUG

        if (data.status === 'success') {
            showMessage(data.message, "green");
            skill.value = '';
            bio.value = '';
            fileInput.value = '';
            terms.checked = false;
        } else {
            showMessage(data.message, "red");
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again.', "red");
    }
});





function checkInputs() {
    const skillvalue = skill.value.trim();
    const biovalue = bio.value.trim();
    result.innerHTML = "";
    result.style.display = "none";


    if (!skillvalue) {
        setErrorFor(skill, "Please fill your skills!");
        return false;
    } else if (skillvalue.length < 10) {
        setErrorFor(skill, "Please enter more skills!");
        return false;
    } else {
        setSuccessFor(skill);
    }

    if (fileInput.files.length == 0) {
        setErrorFor(fileInput, "Certificates are required for this process!");
        return false;
    } else {
        setSuccessFor(fileInput);
    }

    if (!biovalue) {
        setErrorFor(bio, "Please fill the bio area!");
        return false;
    } else if (biovalue.length < 10) {
        setErrorFor(bio, "Please let us know more about your experience!");
        return false;
    } else {
        setSuccessFor(bio);
    }

    if (!terms.checked) {
        result.style.display = "block";
        result.innerHTML = "You must agree before continuing!";
        return false;

    }
    result.innerHTML = "";
    result.style.display = "none";

    return true;
}

