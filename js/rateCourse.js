document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const borders = document.querySelectorAll('.star-border');
    const title = document.getElementById('course-title');

    let currentRating = 0;

    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course_id');

    if (!courseId) {
        title.textContent = 'No course selected';
        return;
    }

    loadCourse();

    stars.forEach((star, i) => {
        star.addEventListener('mouseenter', () => highlight(i + 1));
        star.addEventListener('click', () => {
            currentRating = i + 1;
            highlight(currentRating);
            submit();
        });
    });

    document.querySelector('.container')
        .addEventListener('mouseleave', () => highlight(currentRating));

    function highlight(r) {
        stars.forEach((s, i) => {
            s.style.fill = i < r ? 'white' : 'transparent';
            borders[i].style.borderColor = i < r ? '#0a4e9c' : 'transparent';
        });
    }

    async function loadCourse() {
        try {
            const res = await fetch(`assets/php/student_progress.php?action=course-progress&course_id=${courseId}`);
            const data = await res.json();
            if (data.success) title.textContent = `Rate: ${data.course_title}`;

            const r = await fetch(`assets/php/student_progress.php?action=get-rating&course_id=${courseId}`);
            const d = await r.json();
            if (d.has_rated) {
                currentRating = Math.round(d.rating);
                highlight(currentRating);
            }
        } catch (err) {
            console.error('Failed to load course:', err);
            title.textContent = 'Error loading course';
        }
    }

    async function submit() {
        try {
            const res = await fetch('../assets/php/student_progress.php', {
                method: 'POST',
                credentials: 'same-origin',   // ensure cookies/session are sent
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit-rating',
                    course_id: Number(courseId),
                    rating: currentRating
                })
            });

            const data = await res.json();

            if (data.success) {
                title.textContent = 'Thank you for rating!';
                setTimeout(() => {
                    window.location.href = `html/studentProgress.html?course_id=${courseId}`;
                }, 1200);
            } else {
                alert(data.message || 'Rating failed');
            }
        } catch (err) {
            console.error('Failed to submit rating:', err);
            alert('Rating failed due to network error');
        }
    }
});
