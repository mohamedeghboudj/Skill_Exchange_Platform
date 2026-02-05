document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.star');
    const starBorders = document.querySelectorAll('.star-border');
    const courseTitle = document.getElementById('course-title');
    
    let currentRating = 0;
    let courseId = null;

    // Get course_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    courseId = urlParams.get('course_id');

    // Load course information
    loadCourseInfo();

    // Star click events
    stars.forEach((star) => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            currentRating = rating;
            highlightStars(rating);
            
            // Submit immediately after selection
            submitRating();
        });

        // Hover effects
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });

    // Reset to current rating when mouse leaves
    document.querySelector('.container').addEventListener('mouseleave', function() {
        highlightStars(currentRating);
    });

    // Highlight stars function
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            const border = starBorders[index];
            
            if (starRating <= rating) {
                // Filled star
                star.style.color = 'white';
                star.style.stroke = 'white';
                star.style.fill = 'white';
                border.style.backgroundColor = '#0a4e9c';
                border.style.borderColor = '#0a4e9c';
            } else {
                // Empty star
                star.style.color = 'transparent';
                star.style.stroke = 'white';
                star.style.fill = 'transparent';
                border.style.backgroundColor = '#0a4e9c';
                border.style.borderColor = 'transparent';
            }
        });
    }

    // Load course information and existing rating
    async function loadCourseInfo() {
        if (!courseId) {
            courseTitle.textContent = 'Course not found';
            return;
        }

        try {
            // Get course info
            const response = await fetch(`../api/student.php?action=course-progress&course_id=${courseId}`);
            const data = await response.json();

            if (data.success && data.course_title) {
                courseTitle.textContent = `Rate: ${data.course_title}`;
            }

            // Check if user already rated this course
            const ratingResponse = await fetch(`../api/student.php?action=get-rating&course_id=${courseId}`);
            const ratingData = await ratingResponse.json();
            
            if (ratingData.success && ratingData.rating) {
                // Pre-fill existing rating
                const existingRating = Math.round(ratingData.rating.rating);
                currentRating = existingRating;
                highlightStars(currentRating);
            }
        } catch (error) {
            console.error('Error loading course info:', error);
            courseTitle.textContent = 'Error loading course';
        }
    }

    // Submit rating to backend
    async function submitRating() {
        if (currentRating === 0) {
            return;
        }

        if (!courseId) {
            alert('Course ID not found. Please try again.');
            return;
        }

        const ratingData = {
            action: 'submit-rating',
            course_id: parseInt(courseId),
            rating: currentRating
        };

        try {
            const response = await fetch('../api/student.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ratingData)
            });

            const data = await response.json();

            if (data.success) {
                // Show success message briefly
                courseTitle.textContent = 'Thank you for rating!';
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = `studentProgress.html?course_id=${courseId}`;
                }, 1500);
            } else {
                alert(data.message || 'Failed to submit rating. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('An error occurred. Please try again.');
        }
    }
});