// File: /assets/js/requestDetails.js (UPDATED)
let payBtn = document.querySelector(".pay");
let cancelBtn = document.querySelector(".cancel");
let parentDialog = window.parent.document.getElementById("popup2");
let requestDetails = null;

// Listen for request data from parent
window.addEventListener('message', function(event) {
    if (event.data.type === 'LOAD_REQUEST') {
        requestDetails = event.data.request;
        displayRequestDetails(requestDetails);
        
        // Show/hide pay button based on status
        const status = requestDetails.request_status || requestDetails.status;
        if (status === 'accepted') {
            payBtn.style.display = 'flex';
        } else {
            payBtn.style.display = 'none';
        }
    }
});

function displayRequestDetails(request) {
    // Update all available elements
    const elements = {
        '.teacher-name': request.teacher_name || 'Unknown Teacher',
        '.course-title': request.course_title || 'Unknown Course',
        '.course-price': request.price ? `$${parseFloat(request.price).toFixed(2)}` : 'Free',
        '.request-date': request.formatted_date || formatDate(request.request_date),
        '.request-status': formatStatus(request.request_status || request.status)
    };
    
    // Update each element
    Object.keys(elements).forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = elements[selector];
            
            // Add status class for styling
            if (selector === '.request-status') {
                const status = request.request_status || request.status || 'pending';
                element.className = 'request-status ' + status;
            }
        }
    });
    
    // Update message paragraph based on status
    const messagePara = document.querySelector('.inputs p');
    if (messagePara) {
        const status = request.request_status || request.status;
        if (status === 'accepted') {
            messagePara.textContent = 'Your request has been accepted! Click "Pay" to complete enrollment and access the course.';
        } else if (status === 'pending') {
            messagePara.textContent = 'You will be notified when the teacher accepts your request. You can cancel any time before approval.';
        } else if (status === 'completed') {
            messagePara.textContent = 'You are already enrolled in this course.';
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function formatStatus(status) {
    if (!status) return 'Pending';
    
    return status.charAt(0).toUpperCase() + status.slice(1);
}

payBtn.addEventListener("click", async () => {
    if (!requestDetails) {
        alert("No request data available");
        return;
    }
    
    const status = requestDetails.request_status || requestDetails.status;
    if (status !== 'accepted') {
        alert("This request cannot be paid for yet. Please wait for teacher approval.");
        return;
    }
    
    // Confirm payment
    if (!confirm(`Confirm payment of $${requestDetails.price} for "${requestDetails.course_title}"?`)) {
        return;
    }
    
    try {
        // Use the new process_payment.php API
        const response = await fetch('/api/process_payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_id: requestDetails.course_id,
                request_id: requestDetails.request_id,
                amount: requestDetails.price
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message || "Payment successful! You are now enrolled in the course.");
            
            // Close popups
            if (window.parent.closePop) {
                window.parent.closePop();
            }
            
            // Refresh the page to show new enrollment
            setTimeout(() => {
                window.parent.location.reload();
            }, 1500);
        } else {
            alert("Error: " + (result.error || "Payment failed. Please try again."));
        }
        
    } catch (error) {
        console.error("Payment error:", error);
        alert("An error occurred. Please check your connection and try again.");
    }
});

cancelBtn.addEventListener("click", () => {
    if (window.parent.closePop) {
        window.parent.closePop();
    }
});

// Auto-load request data if passed via URL parameters (fallback)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestData = urlParams.get('request');
    
    if (requestData) {
        try {
            const request = JSON.parse(decodeURIComponent(requestData));
            requestDetails = request;
            displayRequestDetails(request);
            
            const status = request.request_status || request.status;
            if (status === 'accepted') {
                payBtn.style.display = 'flex';
            } else {
                payBtn.style.display = 'none';
            }
        } catch (e) {
            console.error("Error parsing request data:", e);
        }
    }
});