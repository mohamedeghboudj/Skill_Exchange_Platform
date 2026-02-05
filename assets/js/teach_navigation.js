// assets/js/teach_navigation.js
// HADIL ADDED: Backend-based teach mode navigation

document.addEventListener('DOMContentLoaded', () => {
    const teachNavLink = document.querySelector('.teachnav');
    
    if (teachNavLink) {
        teachNavLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch('/assets/php/check_teacher_home.php', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                const data = await response.json();
                
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } catch (error) {
                console.error('Error:', error);
                window.location.href = '/pages/teacherrequest.html';
            }
        });
    }
});