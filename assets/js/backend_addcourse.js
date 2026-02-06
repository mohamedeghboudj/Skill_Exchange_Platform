


function handleCourseSubmission() {
 
    const courseName = document.querySelector("#courseName").value.trim();
    const timeToComplete = document.querySelector("#timeToComplete").value.trim();
    const price = document.querySelector("#price").value.trim().replace('$','');
    const description = document.querySelector("#description").value.trim();
    const categoryText = document.querySelector('.select-txt').textContent.trim();

    const videosList = document.querySelector("#vdFiles").files;
    const assignmentFiles = document.querySelector("#assignment").files;

    
    if (!courseName || !timeToComplete || !price || !description || categoryText === "select a category") {
        alert("Please fill all required fields and select a category.");
        return;
    }

    if (isNaN(timeToComplete) || timeToComplete <= 0) {
        alert("Duration must be a positive number.");
        return;
    }

    if (isNaN(price) || price < 0) {
        alert("Price must be a valid number.");
        return;
    }

  
    const submitBtn = document.querySelector("#submit");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating course...";

 
    const formData = new FormData();
    formData.append('course_title', courseName);
    formData.append('duration', timeToComplete);
    formData.append('price', price);
    formData.append('course_description', description);
    formData.append('category', categoryText);

   
    for (let i = 0; i < videosList.length; i++) {
        formData.append('videos[]', videosList[i]);
    }

   
    for (let i = 0; i < assignmentFiles.length; i++) {
        formData.append('assignments[]', assignmentFiles[i]);
    }

  
    fetch('/api/create_course.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('new_course', JSON.stringify({
                id: data.course_id,
                title: courseName,
                category: categoryText,
                created_at: new Date().toLocaleString()
            }));
            window.location.href = "teach.html";
        } else {
            alert(`Error: ${data.error || 'Unknown error'}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    })
    .catch(err => {
        alert(`Network error: ${err.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.getElementById('submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleCourseSubmission);
    }
});
