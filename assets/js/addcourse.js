const CONFIG = {
    COURSE_NAME_MAX: 100,
    DESCRIPTION_MIN: 20,
    DESCRIPTION_MAX: 2000,
    DURATION_MIN: 1,
    PRICE_MIN: 0,
    FILE_MAX_BYTES: 2 * 1024 * 1024 * 1024, // 2 GB
    ALLOWED_VIDEO_MIMES: ['video/mp4', 'video/webm', 'video/mov'],
    ALLOWED_FILE_MIMES: null,
};

// Get elements
const courseName = document.querySelector("#courseName");
const timeToComplete = document.querySelector("#timeToComplete");
const price = document.querySelector("#price");
const teacher = document.querySelector("#teacher");
const description = document.querySelector("#description");
const droplistUl = document.querySelector("#droplist-ul");
const videos = document.querySelector("#vdFiles");
const assignment = document.querySelector("#assignment");
const submitBtn = document.querySelector("#submit");
const selectTxt = document.querySelector('.select-txt');
const categoryBtn = document.getElementById('category-btn');
const categoryDroplist = document.getElementById('categoryDroplist');
const videosList = document.getElementById('videosList');
const assignmentFile = document.getElementById('assignmentFile');

// check empty fields
const isEmptyStr = s => typeof s === 'string' && s.trim().length === 0;

// format file size
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// Display uploaded videos
const displayVideos = (files) => {
    videosList.innerHTML = '';
    Array.from(files).forEach((file, index) => {
        let fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="remove-file" data-index="${index}">Remove</button>
        `;
        videosList.appendChild(fileItem);
    });

    // Add remove functionality
    videosList.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const dt = new DataTransfer();
            Array.from(videos.files).forEach((file, i) => {
                if (i !== index) dt.items.add(file);
            });
            videos.files = dt.files;
            displayVideos(videos.files);
        });
    });
};

// Display uploaded assignment
const displayAssignment = (file) => {
    if (!file) {
        assignmentFile.innerHTML = '';
        return;
    }

    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <button type="button" class="remove-file">Remove</button>
    `;
    assignmentFile.innerHTML = '';
    assignmentFile.appendChild(fileItem);

    // Add remove functionality
    fileItem.querySelector('.remove-file').addEventListener('click', () => {
        assignment.value = '';
        displayAssignment(null);
    });
};

// File input event listeners
videos.addEventListener('change', () => {
    displayVideos(videos.files);
});

assignment.addEventListener('change', () => {
    displayAssignment(assignment.files[0]);
});

// Validate course name
const validateCourseName = name => {
    const errors = [];
    if (isEmptyStr(name)) errors.push('Course name is required.');
    if (typeof name === 'string' && name.length > CONFIG.COURSE_NAME_MAX)
        errors.push(`Course name cannot exceed ${CONFIG.COURSE_NAME_MAX} characters.`);
    return errors;
};

// Validate price
const validatePrice = priceVal => {
    const errors = [];
    if (isEmptyStr(priceVal)) {
        errors.push('Enter the price.');
        return errors;
    }
    const n = Number(priceVal);
    if (!Number.isInteger(n)) {
        errors.push('The price must be a whole number (ex: 50).');
    }
    if (n < CONFIG.PRICE_MIN) errors.push(`Price must be at least ${CONFIG.PRICE_MIN}.`);
    return errors;
};

// Validate time to complete
const validateTimeToComplete = time => {
    const errors = [];
    if (isEmptyStr(time)) {
        errors.push('Time to complete is required');
        return errors;
    }
    const n = Number(time);
    if (isNaN(n) || n < CONFIG.DURATION_MIN) {
        errors.push('Please enter a valid time duration');
    }
    return errors;
};

// Validate teacher name
const validateTeacherName = tname => {
    const errors = [];
    if (isEmptyStr(tname)) {
        errors.push('Enter your name.');
    }
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u;
    if (!isEmptyStr(tname) && !nameRegex.test(tname)) {
        errors.push('Please enter a valid name.');
    }
    return errors;
};

// Validate description
const validateDescription = desc => {
    const errors = [];
    if (isEmptyStr(desc)) errors.push('The description is required.');
    if (!isEmptyStr(desc) && desc.trim().length < CONFIG.DESCRIPTION_MIN)
        errors.push(`The description must be at least ${CONFIG.DESCRIPTION_MIN} characters.`);
    if (!isEmptyStr(desc) && desc.length > CONFIG.DESCRIPTION_MAX)
        errors.push(`The description cannot exceed ${CONFIG.DESCRIPTION_MAX} characters.`);
    return errors;
};

// Validate videos
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
            errors.push(`Video ${file.name} exceeds max size of ${CONFIG.FILE_MAX_BYTES / (1024 * 1024)} MB.`);
        }
    }
    return errors;
};

// Validate assignment
const validateAssignment = file => {
    const errors = [];
    if (file && file.size > CONFIG.FILE_MAX_BYTES) {
        errors.push(`Assignment file exceeds max size of ${CONFIG.FILE_MAX_BYTES / (1024 * 1024)} MB.`);
    }
    return errors;
};

// Validate category
const validateDroplist = () => {
    const errors = [];
    if (selectTxt.textContent.trim() === "" || selectTxt.textContent === "select a category") {
        errors.push("Please select a category.");
    }
    return errors;
};

// Show errors dynamically
const showErrorsDynamic = (field, messages) => {
    const wrapper = field.closest('.field-wrapper');
    if (!wrapper) return;

    const existingError = wrapper.querySelector(".error-msg");
    if (existingError) existingError.remove();

    field.classList.remove("error");

    if (messages.length > 0) {
        field.classList.add("error");
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-msg";
        errorDiv.textContent = messages.join(", ");
        wrapper.appendChild(errorDiv);
    }
};

// Submit handler
submitBtn.addEventListener("click", e => {
    e.preventDefault();

    showErrorsDynamic(courseName, validateCourseName(courseName.value));
    showErrorsDynamic(price, validatePrice(price.value));
    showErrorsDynamic(timeToComplete, validateTimeToComplete(timeToComplete.value));
    showErrorsDynamic(teacher, validateTeacherName(teacher.value));
    showErrorsDynamic(description, validateDescription(description.value));
    showErrorsDynamic(categoryDroplist, validateDroplist());
    showErrorsDynamic(videos.parentElement, validateVideos(videos.files));
    showErrorsDynamic(assignment.parentElement, assignment.files[0] ? validateAssignment(assignment.files[0]) : []);

    // Stop submission if any errors
    if (document.querySelectorAll(".error-msg").length > 0) {
        console.log("Form has errors. Please fix them.");
        return;
    }
    window.location.href = ""
    

});

// Dropdown functionality
categoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    droplistUl.classList.toggle('show');
});

selectTxt.addEventListener("click", (e) => {
    e.stopPropagation();
    droplistUl.classList.toggle('show');
});

droplistUl.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
        selectTxt.textContent = li.textContent;
        droplistUl.classList.remove("show");
    });
});

document.addEventListener("click", (e) => {
    if (!categoryDroplist.contains(e.target)) {
        droplistUl.classList.remove("show");
    }
});