// teach.js - JavaScript functionality for the teach page

document.addEventListener('DOMContentLoaded', function() {
    
    // Delete Course Functionality - No confirmation, just delete
    const deleteCourseBtns = document.querySelectorAll('.delete-course-btn');
    deleteCourseBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const course = this.closest('.course');
            course.style.transition = 'opacity 0.3s ease';
            course.style.opacity = '0';
            setTimeout(() => {
                course.remove();
            }, 300);
        });
    });

    // Add Video Functionality - Opens add course window
    const addVideoBtns = document.querySelectorAll('.add-video-btn');
    addVideoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Open the add course window (you'll need to implement this based on your existing code)
            // For now, this is a placeholder that you can replace with your window opening logic
            window.open('addcourse.html', '_blank', 'width=800,height=600');
        });
    });

    // Delete Videos Functionality - Toggle checkboxes on first click, delete on second click
    const deleteVideosBtns = document.querySelectorAll('.delete-videos-btn');
    deleteVideosBtns.forEach(btn => {
        let deleteMode = false;
        
        btn.addEventListener('click', function() {
            const course = this.closest('.course');
            const checkboxes = course.querySelectorAll('.video-checkbox');
            
            if (!deleteMode) {
                // Enter delete mode - show checkboxes
                deleteMode = true;
                checkboxes.forEach(cb => {
                    cb.style.visibility = 'visible';
                    cb.checked = false;
                });
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                    </svg>
                    remove selected
                `;
            } else {
                // Confirm delete - remove checked videos without alert
                const videosToDelete = [];
                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        videosToDelete.push(cb.closest('.video'));
                    }
                });
                
                // Delete selected videos
                videosToDelete.forEach(video => {
                    video.style.transition = 'opacity 0.3s ease';
                    video.style.opacity = '0';
                    setTimeout(() => {
                        video.remove();
                    }, 300);
                });
                
                // Exit delete mode - hide remaining checkboxes
                deleteMode = false;
                checkboxes.forEach(cb => {
                    cb.style.visibility = 'hidden';
                    cb.checked = false;
                });
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                    </svg>
                    delete
                `;
            }
        });
    });

    // Delete Assignment Functionality - No confirmation, just delete
    const deleteAssignmentBtns = document.querySelectorAll('.delete-assignment-btn');
    deleteAssignmentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const assignment = this.closest('.assignment');
            const addBtn = assignment.querySelector('.add-assignment-btn');
            const pdfDiv = assignment.querySelector('.pdf');
            
            pdfDiv.style.transition = 'opacity 0.3s ease';
            pdfDiv.style.opacity = '0';
            setTimeout(() => {
                pdfDiv.remove();
                this.classList.add('hide');
                addBtn.classList.remove('hide');
            }, 300);
        });
    });

    // Add Assignment Functionality
    const addAssignmentBtns = document.querySelectorAll('.add-assignment-btn');
    addAssignmentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const assignment = this.closest('.assignment');
            const deleteBtn = assignment.querySelector('.delete-assignment-btn');
            
            const assignmentName = prompt('Enter assignment name:', 'Assignment 1');
            if (!assignmentName) return;
            
            // Create new assignment PDF element
            const newPdf = document.createElement('div');
            newPdf.className = 'pdf';
            newPdf.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" class="lucide lucide-file-icon lucide-file">
                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                </svg>
                ${assignmentName}
            `;
            
            assignment.insertBefore(newPdf, assignment.querySelector('.edit-buttons'));
            
            // Hide add button, show delete button
            this.classList.add('hide');
            deleteBtn.classList.remove('hide');
        });
    });

    // Hover effect for delete course icon
    deleteCourseBtns.forEach(btn => {
        const coursename = btn.closest('.coursename');
        
        coursename.addEventListener('mouseenter', function() {
            btn.style.stroke = '#dc2626';
            btn.style.transition = 'stroke 0.2s ease';
        });
        
        coursename.addEventListener('mouseleave', function() {
            btn.style.stroke = '#b7b4b4';
        });
    });
});