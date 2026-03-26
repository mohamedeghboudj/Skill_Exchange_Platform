document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/assets/php/getCurrentUser.php', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            throw new Error('No authenticated user');
        }

        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('currentUserEmail', data.user.email || '');
        localStorage.setItem('currentUserName', data.user.name || '');
        localStorage.setItem('currentUserRole', data.user.role || '');
    } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('currentUserName');
        localStorage.removeItem('currentUserRole');
    }
});
