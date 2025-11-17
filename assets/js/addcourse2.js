const CONFIG = {
  COURSE_NAME_MAX: 100,         
  DESCRIPTION_MIN: 20,          
  DESCRIPTION_MAX: 2000,    
  DURATION_MIN: 1,    
  PRICE_MIN: 0,                 
  FILE_MAX_BYTES: 2 * 1024 * 1024 * 1024, // 200 MB 
  ALLOWED_VIDEO_MIMES: ['video/mp4','video/webm','video/mov'],
  ALLOWED_FILE_MIMES: null, // null = allow anything 
};

// let courseName = document.querySelector("#courseName"), 

// timetocomplete = document.querySelector("#timeToComplete"), 

// price = document.querySelector("#price"), 

// teacher = document.querySelector("#teacher"), 

// description = document.querySelector("#description"), 

// droplist = document.querySelector("#droplist-ul"), 

// videos = document.querySelector("#vdFiles"), 

// assignment = document.querySelector("#assignment"), 

// Submit_Btn = document.querySelector("#submit");

// const selectedDiv = document.querySelector(".select-txt");

//check empty fields
const isEmptyStr = s => typeof s === 'string' && s.trim().length == 0 ;
//validate course name
validateCourseName = name => { 
    const errors= [];
    if (isEmptyStr(name)) errors.push('Course name is not valid.');
    if (typeof name === 'string' && name.length > CONFIG.COURSE_NAME_MAX)
        errors.push(`course name cannot exceed ${CONFIG.COURSE_NAME_MAX} characters.`);
    return errors;
}
//validate price
const validatePrice = price => {
    const errors = [];
    if (isEmptyStr(price)) {
        errors.push('Enter the price.')
        return errors;
    }
    const n = Number(price);
    if(!Number.isInteger(n)){
        errors.push('The price must be a number. (ex:50).')
    }
    if(n < CONFIG.PRICE_MIN) errors.push(`price must be at least ${CONFIG.PRICE_MIN}.`);
    return errors;

}
//validate time to complete

const validateTimeToComplete = time => {
    const errors = [];
    if (isEmptyStr(time)) {
    errors.push('Time to complete is required');
    return errors;
    }
    if (isNaN(time) || time < CONFIG.DURATION_MIN){
    // if (time.trim() < DURATION_MIN ) {
    errors.push('Please enter a valid time duration');
    return errors;
    }
}
//validate teacher name

const validateTeacherName = tname => {
    const errors =[];
    if (isEmptyStr(tname)) {
        errors.push('Enter your name.') }
    
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/ug;
    if (!isEmptyStr(tname) && !nameRegex.test(tname)) {
            errors.push('Please enter your real name.');
        }
    return errors;
}
//validate description
const validateDescription = desc => {
    const errors = [];
    if (isEmptyStr(desc)) errors.push('The description is required.');
    if (!isEmptyStr(desc) && desc.trim().length < CONFIG.DESCRIPTION_MIN)
        errors.push(`The description must n=be at least ${CONFIG.DESCRIPTION_MIN} characters.`);
    if (!isEmptyStr(desc) && desc.length > CONFIG.DESCRIPTION_MAX)
        errors.push(`The description cannot exceed ${CONFIG.DESCRIPTION_MAX} characters.`);
    return errors;
}
//validate vd files 
const validateVideos = files => {
    const errors = [];
    
    if (!files || files.length === 0) {
        errors.push('Please upload at least one video.');
        return errors;
    }

    for (let file of files) {
        if (!CONFIG.ALLOWED_VIDEO_MIMES.includes(file.type)) {
            errors.push(`Video ${file.name} has invalid type (${file.type}). Allowed: ${CONFIG.ALLOWED_VIDEO_MIMES.join(', ')}`);
        }
        if (file.size > CONFIG.FILE_MAX_BYTES) {
            errors.push(`Video ${file.name} exceeds max size of ${CONFIG.FILE_MAX_BYTES / (1024*1024)} MB.`);
        }
    }

    return errors;
};
// validate assignment
const validateAssignment = file => {
    const errors = [];
    if (file.size > CONFIG.FILE_MAX_BYTES) {
        errors.push(`Assignment file exceeds max size of ${CONFIG.FILE_MAX_BYTES / (1024*1024)} MB.`);
    }

    return errors;
};
//validate category
// const validateDroplist = () => {
//     const errors = [];
//     if (select.textContent.trim() === "" || select.textContent === "Select a category") {
//         errors.push("Please select a category.");
//     }

//     return errors;
// };

// //how to display errors
// const showErrorsDynamic = (field, messages) => {
//     //remove old errors bch myzidhmch fo9 b3d
//     const parent = field.parentElement;
//     const existingError = parent.querySelector(".error-msg");
//     if (existingError) existingError.remove();

//     field.classList.remove("error");

//     if (messages.length > 0) {
//         field.classList.add("error");
//         const errorDiv = document.createElement("div");
//         errorDiv.className = "error-msg";
//         errorDiv.textContent = messages.join(", ");
//         parent.appendChild(errorDiv);
//     }
// };

// //checking all inputs
// Submit_Btn.addEventListener("click", e => {
//     e.preventDefault();

//     showErrorsDynamic(courseName, validateCourseName(courseName.value));
//     showErrorsDynamic(price, validatePrice(price.value));
//     showErrorsDynamic(timetocomplete, validateTimeToComplete(timetocomplete.value));
//     showErrorsDynamic(teacher, validateTeacherName(teacher.value));
//     showErrorsDynamic(descrtption, validateDescription(descrtption.value));
//     showErrorsDynamic(selectedDiv, validateDroplist());
//     showErrorsDynamic(videos, validateVideos(videos.files));
//     showErrorsDynamic(assignment, assignment.files[0] ? validateAssignment(assignment.files[0]) : []);

//     // Stop submission if any errors
//     if (document.querySelectorAll(".error-msg").length > 0) return;
// });







const courseName = document.querySelector("#courseName"),
      timetocomplete = document.querySelector("#timeToComplete"),
      price = document.querySelector("#price"),
      teacher = document.querySelector("#teacher"),
      description = document.querySelector("#description"),
      submitBtn = document.querySelector("#submit"),
      selectedDiv = document.querySelector(".select-txt");

const isEmptyStr = s => typeof s === 'string' && s.trim().length === 0;

const showErrorsDynamic = (field, messages) => {
    // remove previous error
    const existingError = field.parentElement.querySelector(".error-msg");
    if (existingError) existingError.remove();

    field.classList.remove("error");

    if (messages.length > 0) {
        field.classList.add("error");
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-msg";
        errorDiv.textContent = messages.join(", ");
        field.insertAdjacentElement('afterend', errorDiv);
    }
};

// category validation
const validateDroplist = () => {
    const errors = [];
    if (selectedDiv.textContent.trim() === "" || selectedDiv.textContent.toLowerCase() === "select a category") {
        errors.push("Please select a category.");
    }
    return errors;
};

submitBtn.addEventListener("click", e => {
    e.preventDefault();

    showErrorsDynamic(courseName, validateCourseName(courseName.value));
    showErrorsDynamic(price, validatePrice(price.value));
    showErrorsDynamic(timetocomplete, validateTimeToComplete(timetocomplete.value));
    showErrorsDynamic(teacher, validateTeacherName(teacher.value));
    showErrorsDynamic(description, validateDescription(description.value));
    showErrorsDynamic(selectedDiv, validateDroplist());

    // stop submission if any errors
    if (document.querySelectorAll(".error-msg").length > 0) return;
});
