
// this is not working yet (sending the message) , come back later hadil


/*
document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById('oumayma');
    const textarea = document.getElementById('question');
    const errorMsg = document.getElementById('error-msg');

    button.addEventListener('click', function (event) {
        event.preventDefault();

        if (textarea.value.trim() === '') {
            errorMsg.textContent = "You cannot send an empty message!";
            errorMsg.style.color = 'red';
            errorMsg.style.display = 'block';
        } else {
            errorMsg.textContent = "Message sent successfully!";
            errorMsg.style.color = 'green';
            errorMsg.style.display = 'block';
            textarea.value = '';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 3000);
        }


    });

});*/ //commented by ikram

console.log("About page script loaded");

// Check authentication status on page load
document.addEventListener("DOMContentLoaded", function () {
    checkAuthStatus();
    setupQuestionForm();
});

// Function to check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch('/assets/php/check_session.php');
        const data = await response.json();
        
        const joinUsBtn = document.getElementById('join-us-btn');
        const userNavbar = document.getElementById('user-navbar');
        
        if (data.isLoggedIn) {
            // User is logged in - show navbar, hide join button
            joinUsBtn.style.display = 'none';
            userNavbar.style.display = 'flex';
            
            // Update profile picture if available
            const profilePic = document.getElementById('nav-profile-pic');
            if (data.user.profile_picture) {
                profilePic.src = data.user.profile_picture;
            }
            
            // Setup logout button
            setupLogout();
        } else {
            // User is not logged in - show join button, hide navbar
            joinUsBtn.style.display = 'block';
            userNavbar.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Default to showing join button if error
        document.getElementById('join-us-btn').style.display = 'block';
        document.getElementById('user-navbar').style.display = 'none';
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('../assets/php/logout.php', {
                    method: 'POST'
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



