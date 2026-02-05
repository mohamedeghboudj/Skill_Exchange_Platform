// Load top instructors dynamically from backend
async function loadTopInstructors() {
    try {
        console.log('Fetching top instructors from /assets/php/top_instructors.php...');
        const response = await fetch('/assets/php/top_instructors.php');

        console.log('Response status:', response.status);

        if (!response.ok) {
            console.error(`Failed to fetch instructors: ${response.status}`);
            return;
        }

        const text = await response.text();
        console.log('Raw response:', text.substring(0, 500));

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return;
        }

        console.log('Parsed data:', data);

        if (data.success && data.data && data.data.length > 0) {
            console.log('Found', data.data.length, 'instructors');
            populateInstructors(data.data);
        } else {
            console.warn('No instructors or data.success is false:', data);
        }
    } catch (error) {
        console.error('Error loading instructors:', error);
    }
}

function populateInstructors(instructors) {
    const profContainer = document.querySelector('.prof-container');

    if (!profContainer) {
        console.error('Prof container not found');
        return;
    }

    // Clear existing content
    profContainer.innerHTML = '';

    // Populate with top 3 instructors
    instructors.slice(0, 3).forEach(instructor => {
        const collectorDiv = createInstructorCard(instructor);
        profContainer.appendChild(collectorDiv);
    });
}

function createInstructorCard(instructor) {
    const collector = document.createElement('div');
    collector.className = 'collector';

    const name = instructor.username || 'Unknown';
    const avgRating = parseFloat(instructor.avg_rating || 0).toFixed(1);
    const courseCount = instructor.course_count || 0;
    const studentCount = instructor.student_count || 0;

    collector.innerHTML = `
        <div class="pic">
            <div class="image">
                <img src="assets/default-instructor.png" alt="prof-img">
            </div>
        </div>
        <div class="prof">
            <h4>${name}</h4>
            <p>
                Rating: ${avgRating} ★<br>
                Courses: ${courseCount} | Students: ${studentCount}
            </p>
            <div class="contact">
                <a href="#" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-linkedin-icon lucide-linkedin">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                    </svg>
                </a>
                <a href="#" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-twitter-icon lucide-twitter">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                </a>
                <a href="#" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                </a>
            </div>
        </div>
    `;

    return collector;
}

// Load instructors when DOM is ready
document.addEventListener('DOMContentLoaded', loadTopInstructors);
