
export function handleCourseSubmission() {
    // Get all form values
    const courseName = document.querySelector("#courseName").value;
    const timeToComplete = document.querySelector("#timeToComplete").value;
    const price = document.querySelector("#price").value;
    const description = document.querySelector("#description").value;
    const selectTxt = document.querySelector('.select-txt').textContent;
    const videosList = document.querySelector("#vdFiles").files;
    const assignmentFile = document.querySelector("#assignment").files[0];
    const submitBtn =document.querySelector('#submit');
    const originalText=submitBtn.textContent;
     submitBtn.disabled = true;
    submitBtn.textContent = 'Creating course...';
    ///////////////////////////////////////////
     const formData = new FormData();
    
    // 2. Add text data
    formData.append('course_title', courseName);
    formData.append('duration', timeToComplete);
    formData.append('price', price);
    formData.append('teacher_id', teacher);
    formData.append('course_description', description);
    formData.append('category', category);
    
    // 3. Add video files
    for (let i = 0; i < videosList.length; i++) {
        formData.append('videos[]', videosList[i]);
    }
    
    // 4. Add assignment file (if exists)
    if (assignmentFile) {
        formData.append('assignments[]', assignmentFile);
    }
    
    // 5. Send to backend API
    fetch('../api/create_course.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Course created successfully! ID: ${data.course_id}`);
            // Redirect after success
            window.location.href = "teach.html";
        } else {
            alert(`❌ Error: ${data.error || 'Unknown error'}`);
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    })
    .catch(error => {
        alert(`❌ Network error: ${error.message}`);
        console.error('Fetch error:', error);
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}