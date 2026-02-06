/**
 * File: /assets/js/backend_requestDetails.js
 * Purpose: Handle displaying request details in popup and processing payments
 * 
 * UPDATED BY: Backend Implementation for Dynamic Student Requests Display
 * 
 * This script loads the selected request details and handles the payment flow
 */

/**
 * Load request details from database
 * Called when popup opens
 */



async function loadRequestDetails() {
    try {
        // Get request info from session storage (set when request is clicked)
        const requestId = sessionStorage.getItem('currentRequestId');
        const courseId = sessionStorage.getItem('currentCourseId');
        const status = sessionStorage.getItem('currentRequestStatus');
        
        if (!requestId || !courseId) {
            console.error('No request selected');
            return;
        }
        
        console.log('Loading details for request:', requestId);
        
        // Fetch full request details
        const response = await fetch(`/api/get_request_details.php?request_id=${requestId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!result.success) {
            console.error('Failed to load request details:', result.error);
            return;
        }
        
        // Display the details in the popup iframe or modal
        displayRequestDetails(result.data);
        
    } catch (error) {
        console.error('Error loading request details:', error);
    }
}

/**
 * Display request details in the UI
 * @param {Object} requestData - Full request details
 */


function displayRequestDetails(requestData) {
    // This function can send data to the iframe if needed
    // Or you can populate modal content directly
    
    console.log('Request details loaded:', requestData);
    
    // Example: Send data to iframe using postMessage
    const iframe = document.querySelector('#popup iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'REQUEST_DETAILS',
            data: requestData
        }, '*');
    }
}

/**
 * Handle payment button click
 * Opens payment popup for accepted requests
 */


function handlePaymentClick(requestId, courseId) {
    // Store payment info
    sessionStorage.setItem('paymentRequestId', requestId);
    sessionStorage.setItem('paymentCourseId', courseId);
    
    // Open payment popup
    const paymentPopup = document.getElementById('popup2');
    if (paymentPopup) {
        paymentPopup.showModal();
    }
}

/**
 * Process payment and create enrollment
 */


async function processPayment() {
    try {
        const requestId = sessionStorage.getItem('paymentRequestId');
        const courseId = sessionStorage.getItem('paymentCourseId');
        
        if (!requestId || !courseId) {
            alert('Payment information missing');
            return;
        }
        
        // Call the payment processing API
        const response = await fetch('/api/process_payment.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                request_id: parseInt(requestId),
                course_id: parseInt(courseId)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Payment successful! You are now enrolled in the course.');
            
            // Close popups
            closePop();
            closePop2();
            
            // Refresh the requests list
            if (typeof loadStudentRequests === 'function') {
                loadStudentRequests();
            }
            
            // Reload enrolled courses
            if (typeof loadEnrolledCourses === 'function') {
                loadEnrolledCourses();
            }
            
            // Clear session storage
            sessionStorage.removeItem('paymentRequestId');
            sessionStorage.removeItem('paymentCourseId');
            
        } else {
            alert('Payment failed: ' + (result.error || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        alert('Payment processing failed. Please try again.');
    }
}

/**
 * Close popup functions (keeping original functionality)
 */


function closePop() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.close();
    }
}

function closePop2() {
    const popup2 = document.getElementById('popup2');
    if (popup2) {
        popup2.close();
    }
}

// Keep the original click handlers from your friend's code
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('popup');
    const popup2 = document.getElementById('popup2');
    
    // ORIGINAL CODE: Close popup on background click
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePop();
            }
        });
    }
    
    if (popup2) {
        popup2.addEventListener('click', (e) => {
            if (e.target === popup2) {
                closePop2();
            }
        });
    }
    
    // ADDED: Load request details when popup opens
    if (popup) {
        popup.addEventListener('open', loadRequestDetails);
    }
});

// Export functions for global access
if (typeof window !== 'undefined') {
    window.closePop = closePop;
    window.closePop2 = closePop2;
    window.handlePaymentClick = handlePaymentClick;
    window.processPayment = processPayment;
}
// hadil changed this 


