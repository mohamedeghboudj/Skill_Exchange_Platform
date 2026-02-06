// File: /assets/js/learn.js (UPDATED)
let mydialog = document.getElementById("popup");
let mydialog2 = document.getElementById("popup2");
let requestsContainer = document.querySelector(".requests");
let currentUser = null;

console.log("js is working");

// Load current user and requests on page load
document.addEventListener("DOMContentLoaded", async () => {
    await loadCurrentUser();
    await loadEnrollmentRequests();
    
    // Existing navigation code...
    document.querySelector(".teachnav")?.addEventListener("click", (e) => {
        e.preventDefault();
        handleBecomeTeacherClick();
    });
});

async function loadCurrentUser() {
    try {
        // Use your existing getCurrentUser API
        const response = await fetch('/assets/php/getCurrentUser.php');
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUser = data.user;
            // Store in localStorage for compatibility
            localStorage.setItem("currentUser", JSON.stringify(data.user));
        } else {
            console.warn("User not logged in:", data.error);
            // Redirect to login if not authenticated
            if (data.redirect || data.error === 'Not authenticated') {
                window.location.href = "/auth.html";
            }
        }
    } catch (error) {
        console.error("Error loading user:", error);
    }
}

async function loadEnrollmentRequests() {
    try {
        // Use the new get_my_requests.php API
        const response = await fetch('/api/get_my_requests.php');
        const data = await response.json();
        
        if (data.success) {
            // Clear existing hardcoded requests
            requestsContainer.innerHTML = '<p>Your requests</p>';
            
            if (!data.data || data.data.length === 0) {
                requestsContainer.innerHTML += '<p class="no-requests">No pending requests</p>';
                return;
            }
            
            // Populate with dynamic data
            data.data.forEach(request => {
                createRequestElement(request);
            });
            
            // Re-attach click event listeners
            attachRequestClickListeners();
        } else {
            console.error("Error loading requests:", data.error);
            showErrorMessage(data.error || "Failed to load requests");
        }
        
    } catch (error) {
        console.error("Error loading enrollment requests:", error);
        showErrorMessage("Network error. Please check your connection.");
    }
}

function showErrorMessage(message) {
    requestsContainer.innerHTML = `
        <p>Your requests</p>
        <div class="error-message">
            <p>${message}</p>
            <button onclick="loadEnrollmentRequests()">Retry</button>
        </div>
    `;
}

function createRequestElement(request) {
    const requestDiv = document.createElement('div');
    requestDiv.className = 'request';
    requestDiv.dataset.requestId = request.request_id;
    requestDiv.dataset.courseId = request.course_id;
    requestDiv.dataset.status = request.request_status;
    
    // Store request data for popup
    requestDiv.dataset.requestData = JSON.stringify(request);
    
    // Status badge styling
    const status = request.request_status || 'pending';
    const statusClass = status === 'accepted' ? 'accepted' : 
                       status === 'pending' ? 'pending' : 
                       status === 'completed' ? 'completed' : 'other';
    
    // Format price
    const price = request.price ? `$${parseFloat(request.price).toFixed(2)}` : 'Free';
    
    requestDiv.innerHTML = `
        <div class="chatImg">
            <img src="${request.teacher_profile_picture || '../assets/images/pf4.jpg'}" 
                 alt="${request.teacher_name || 'Teacher'}" 
                 onerror="this.src='../assets/images/pf4.jpg'">
        </div>
        <div class="chatInfo">
            <div class="name">${request.teacher_name || 'Unknown Teacher'}</div>
            <div class="Rcourse">${request.course_title || 'Unknown Course'}</div>
          
        </div>
    `;
    
    requestsContainer.appendChild(requestDiv);
}

function attachRequestClickListeners() {
    const requestElements = document.querySelectorAll('.request');
    requestElements.forEach(requestEl => {
        requestEl.addEventListener('click', () => {
            const requestData = JSON.parse(requestEl.dataset.requestData);
            openRequestDetails(requestData);
        });
    });
}

function openRequestDetails(request) {
    // Store current request data
    window.currentRequest = request;
    
    // Open the popup
    mydialog.showModal();
    
    // Pass request data to iframe
    const iframe = mydialog.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'LOAD_REQUEST',
            request: request
        }, '*');
    }
}

// Existing popup functions (keep these)
const requestElements = document.querySelectorAll('.request');
requestElements.forEach(request => {
    request.addEventListener('click', () => {
        mydialog.showModal();
    });
});

function closePop() {
    mydialog.close();
}

function closePop2() {
    mydialog2.close();
}

mydialog.addEventListener('click', () => {
    mydialog.close();
});

mydialog2.addEventListener('click', () => {
    mydialog2.close();
});