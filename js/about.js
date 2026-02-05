
// this is not working yet (sending the message) , come back later hadil


/*
document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById('oumayma');
    const textarea = document.getElementById('question');
    const errorMsg = document.getElementById('error-msg');

    button.addEventListener('click', function (event) {
        event.preventDefault();

        const message = textarea.value.trim();

        if (message === '') {
            errorMsg.textContent = "You cannot send an empty message!";
            errorMsg.style.color = 'red';
            errorMsg.style.display = 'block';
        } else {
            // Disable button while sending
            button.disabled = true;
            button.textContent = "Sending...";

            const formData = new FormData();
            formData.append('message', message);

            fetch('assets/php/send_email.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    // Log full response to console for debugging
                    console.log("Server Response:", data);

                    if (data.success) {
                        errorMsg.textContent = "Message sent successfully!";
                        errorMsg.style.color = 'green';
                        errorMsg.style.display = 'block';
                        textarea.value = '';
                    } else {
                        // Show clean message to user
                        errorMsg.textContent = data.message || "Failed to send message.";

                        // Log technical details to console
                        if (data.debug_error) {
                            console.warn("Debug Info:", data.debug_error);
                        } else {
                            console.warn("Server Error:", data);
                        }

                        errorMsg.style.color = 'red';
                        errorMsg.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    errorMsg.textContent = "An error occurred. Please try again.";
                    errorMsg.style.color = 'red';
                    errorMsg.style.display = 'block';
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = "Send";
                    setTimeout(() => {
                        errorMsg.style.display = 'none';
                    }, 5000);
                });
        }
    });

});*/ //commented by ikram

console.log("About page script loaded");

// Check authentication status on page load
document.addEventListener("DOMContentLoaded", function () {
    checkAuthStatus(); // ADDED: Check if user is logged in
    setupQuestionForm();
});

// ADDED: Function to check if user is logged in and toggle navbar/button
async function checkAuthStatus() {
    try {
        const response = await fetch('/assets/php/check_session.php', {
            credentials: 'include' // IMPORTANT: Include session cookies
        });
        const data = await response.json();
        
        const joinUsBtn = document.getElementById('join-us-btn');
        const userNavbar = document.getElementById('user-navbar');
        
        if (data.isLoggedIn) {
            // User is logged in - hide join button, show navbar
            if (joinUsBtn) joinUsBtn.style.display = 'none';
            if (userNavbar) userNavbar.style.display = 'flex';
            
            // Setup logout button
            setupLogout();
        } else {
            // User is not logged in - show join button, hide navbar
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

// ADDED: Setup logout functionality
function setupLogout() {
    const logoutBtn = document.querySelector('#user-navbar button a');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/assets/php/logout.php', {
                    method: 'POST',
                    credentials: 'include' // IMPORTANT: Include session cookies
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

// Setup question form (if needed) - UNCHANGED
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
            // Your email sending logic here
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