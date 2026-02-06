

console.log("About page script loaded");

// Check authentication status on page load
document.addEventListener("DOMContentLoaded", function () {
    checkAuthStatus(); 
    setupQuestionForm();
});

//  check if user is logged in and toggle navbar/button
async function checkAuthStatus() {
    try {
        const response = await fetch('/assets/php/check_session.php', {
            credentials: 'include' 
        });
        const data = await response.json();
        
        const joinUsBtn = document.getElementById('join-us-btn');
        const userNavbar = document.getElementById('user-navbar');
        
        if (data.isLoggedIn) {
            // User is logged in 
            if (joinUsBtn) joinUsBtn.style.display = 'none';
            if (userNavbar) userNavbar.style.display = 'flex';
            
            // Setup logout button
            setupLogout();
        } else {
            // User is not logged in
            if (joinUsBtn) joinUsBtn.style.display = 'block';
            if (userNavbar) userNavbar.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Default to showing join button if error
        const joinUsBtn = document.getElementById('join-us-btn');
        const userNavbar = document.getElementById('user-navbar');
        if (joinUsBtn) joinUsBtn.style.display = 'block';
        if (userNavbar) userNavbar.style.display = 'none';
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.querySelector('#user-navbar button a');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/assets/php/logout.php', {
                    method: 'POST',
                    credentials: 'include' 
                });
                
                if (response.ok) {
                    // Redirect to about page after logout
                    window.location.href = '/index.html';
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        });
    }
}

// Setup question form 
function setupQuestionForm() {
    const button = document.getElementById('oumayma');
    const textarea = document.getElementById('question');
    const errorMsg = document.getElementById('error-msg');

    if (!button || !textarea || !errorMsg) {
        return; // Elements not on this page
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();

        const message = textarea.value.trim();

        if (message === '') {
            errorMsg.textContent = "You cannot send an empty message!";
            errorMsg.style.color = 'red';
            errorMsg.style.display = 'block';
        } else {
            // email sending
            console.log("Sending message:", message);
            errorMsg.textContent = "Message sent successfully!";
            errorMsg.style.color = 'green';
            errorMsg.style.display = 'block';
            textarea.value = '';
            
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 5000);
        }
    });
}