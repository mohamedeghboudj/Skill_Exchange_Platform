document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    stars.forEach((star, index) => {
        // Hover effects
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });

        // Click to set rating
        star.addEventListener('click', function() {
            currentRating = index + 1;
            highlightStars(currentRating);
            console.log('Rating selected:', currentRating);
        });
    });

    // Reset to current rating when mouse leaves the container
    document.querySelector('.container').addEventListener('mouseleave', function() {
        highlightStars(currentRating);
    });

    function highlightStars(count) {
        stars.forEach((star, index) => {
            if (index < count) {
                // Active state - fill the star
                star.style.color = 'gold';
                star.style.stroke = 'gold';
                star.style.fill = 'gold'; // This fills the inside
            } else {
                // Inactive state - outline only
                star.style.color = 'transparent';
                star.style.stroke = 'white';
                star.style.fill = 'transparent';
            }
        });
    }
});