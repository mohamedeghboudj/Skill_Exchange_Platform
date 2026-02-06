/**
 * File: /assets/js/load_student_requests.js
 * Purpose: Load and dynamically display enrollment requests for students
 * 
 * FIXED VERSION - Better error handling and debugging
 */

// Function to load student enrollment requests
async function loadStudentRequests() {
    try {
        console.log('Loading student enrollment requests...');

        const response = await fetch('/api/get_student_requests.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get raw text first for debugging
        const rawText = await response.text();
        console.log('Raw response (first 200 chars):', rawText.substring(0, 200));

        // Try to parse JSON
        let result;
        try {
            result = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw response:', rawText);

            // Show user-friendly message
            displayNoRequests('Error: Server returned invalid data. Check console for details.');
            return;
        }

        console.log('Parsed result:', result);

        if (!result.success) {
            console.error('Failed to load requests:', result.error);

            // If not authenticated, redirect to login
            if (result.redirect) {
                console.log('Not authenticated, redirecting to login...');
                window.location.href = '/auth.html';
                return;
            }

            displayNoRequests(result.error || 'Error loading requests');
            return;
        }

        console.log('Requests loaded successfully:', result);
        console.log('Total requests:', result.total_requests);
        console.log('Pending:', result.pending_count, 'Accepted:', result.accepted_count);

        // Display the requests
        if (result.data && result.data.length > 0) {
            displayRequests(result.data);
        } else {
            displayNoRequests('No pending requests');
        }

    } catch (error) {
        console.error('Error loading student requests:', error);
        console.error('Error stack:', error.stack);
        displayNoRequests('Failed to load requests. Check console for details.');
    }
}

/**
 * Display requests grouped by course
 * @param {Array} groupedRequests - Array of courses with their requests
 */
function displayRequests(groupedRequests) {
    const requestsSection = document.querySelector('.requests');

    if (!requestsSection) {
        console.error('Requests section not found in DOM');
        return;
    }

    console.log('Displaying', groupedRequests.length, 'course groups');

    // Clear existing requests (keep the header)
    const existingRequests = requestsSection.querySelectorAll('.request');
    existingRequests.forEach(req => {
        console.log('Removing existing request element');
        req.remove();
    });

    // Build HTML for all requests
    let requestsHTML = '';
    let totalDisplayed = 0;

    groupedRequests.forEach(courseGroup => {
        console.log('Course:', courseGroup.course_title, 'Requests:', courseGroup.requests.length);

        courseGroup.requests.forEach(request => {
            requestsHTML += createRequestHTML(request, courseGroup);
            totalDisplayed++;
        });
    });

    console.log('Total requests to display:', totalDisplayed);

    // Insert the requests after the header
    const header = requestsSection.querySelector('p');
    if (header) {
        header.insertAdjacentHTML('afterend', requestsHTML);
        console.log('Requests inserted after header');
    } else {
        requestsSection.innerHTML += requestsHTML;
        console.log('Requests appended to section (no header found)');
    }

    // Add click handlers
    attachRequestClickHandlers();
}

/**
 * Create HTML for a single request
 * @param {Object} request - Request data
 * @param {Object} courseGroup - Course group data
 * @returns {String} HTML string
 */
function createRequestHTML(request, courseGroup) {
    // Default profile picture if none exists
    const profilePic = courseGroup.teacher_picture || '../assets/images/pf4.jpg';

    return `
        <div class="request" data-request-id="${request.request_id}" 
             data-course-id="${request.course_id}" 
             data-status="${request.status}">
            <div class="chatImg">
                <img src="${profilePic}" alt="${courseGroup.teacher_name}" 
                     onerror="this.src='../assets/images/pf4.jpg'">
            </div>
            <div class="chatInfo">
                <div class="name">${courseGroup.teacher_name}</div>
                <div class="Rcourse">${courseGroup.course_title}</div>
            </div>
        </div>
    `;
}

/**
 * Get CSS class for status badge
 * @param {String} status - Request status
 * @returns {String} CSS class name
 */
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'accepted': 'status-accepted',
        'rejected': 'status-rejected',
        'declined': 'status-declined',
        'completed': 'status-completed'
    };

    return statusClasses[status] || 'status-unknown';
}

/**
 * Display message when no requests are found
 * @param {String} message - Message to display
 */
function displayNoRequests(message) {
    const requestsSection = document.querySelector('.requests');

    if (!requestsSection) {
        console.error('Requests section not found');
        return;
    }

    console.log('Displaying no requests message:', message);

    // Clear existing requests
    const existingRequests = requestsSection.querySelectorAll('.request');
    existingRequests.forEach(req => req.remove());

    // Remove any existing no-requests message
    const existingMessage = requestsSection.querySelector('.no-requests');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Add "no requests" message
    const header = requestsSection.querySelector('p');
    if (header) {
        header.insertAdjacentHTML('afterend', `
            <div class="no-requests" style="padding: 20px; text-align: center; color: #666;">
                <p>${message}</p>
            </div>
        `);
    }
}

/**
 * Attach click handlers to request elements for opening popup
 */
function attachRequestClickHandlers() {
    const requestElements = document.querySelectorAll('.request');
    const popup = document.getElementById('popup');

    console.log('Attaching click handlers to', requestElements.length, 'requests');

    if (!popup) {
        console.warn('Request details popup (#popup) not found in DOM');
        return;
    }

    requestElements.forEach(requestElement => {
        requestElement.addEventListener('click', function () {
            const requestId = this.getAttribute('data-request-id');
            const courseId = this.getAttribute('data-course-id');
            const status = this.getAttribute('data-status');

            console.log('Request clicked:', { requestId, courseId, status });

            // Store request details for the popup
            sessionStorage.setItem('currentRequestId', requestId);
            sessionStorage.setItem('currentCourseId', courseId);
            sessionStorage.setItem('currentRequestStatus', status);

            // Open the popup
            popup.showModal();

            console.log('Popup opened for request:', requestId);
        });
    });

    console.log('Click handlers attached successfully');
}

/**
 * Initialize the requests loading when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Student Requests Loader Initialized ===');
    console.log('Current URL:', window.location.href);

    // Check if requests section exists
    const requestsSection = document.querySelector('.requests');
    if (!requestsSection) {
        console.warn('⚠️ .requests section not found in DOM. Are you on the correct page?');
    } else {
        console.log('✓ Requests section found');
    }

    // Load requests on page load
    loadStudentRequests();

    // Optional: Refresh requests every 30 seconds
    // Uncomment the line below if you want auto-refresh
    // setInterval(loadStudentRequests, 30000);
});

// Export functions for use in other scripts if needed
if (typeof window !== 'undefined') {
    window.loadStudentRequests = loadStudentRequests;
    window.displayNoRequests = displayNoRequests;
}

console.log('✓ load_student_requests.js loaded');