console.log("Video Player Script Loading...");

document.addEventListener('DOMContentLoaded', () => {

    // ===================== GET URL PARAMETERS =====================
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video_id');
    const courseId = params.get('course_id');

    console.log("Video ID:", videoId);
    console.log("Course ID:", courseId);

    // ===================== GET DOM ELEMENTS =====================
    const videoPlayer = document.getElementById('videoPlayer');
    const closeButton = document.querySelector('.close-btn');

    if (!videoId) {
        console.error("❌ No video ID in URL");
        alert("No video selected. Redirecting back...");
        goBackToCourse();
        return;
    }

    // ===================== LOAD VIDEO FROM DATABASE =====================
    loadVideo(videoId);

    // ===================== FUNCTIONS =====================

    async function loadVideo(id) {
        try {
            const response = await fetch(`/api/get_video_details.php?video_id=${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Video Details Result:", result);

            if (result.success && result.data) {
                const video = result.data;

                // Set video source
                if (videoPlayer) {
                    videoPlayer.src = video.video_url;
                    console.log("✅ Video loaded:", video.video_url);

                    // Optional: Update page title
                    document.title = video.video_title + " - LearnLand";
                }

                // Handle video errors
                videoPlayer.addEventListener('error', (e) => {
                    console.error("Video loading error:", e);
                    alert("Failed to load video. The video file may not be available.");
                });

            } else {
                console.error("Video not found:", result.error);
                alert("Video not found. Redirecting back...");
                goBackToCourse();
            }
        } catch (error) {
            console.error('Error loading video:', error);
            alert("Error loading video. Please try again.");
            goBackToCourse();
        }
    }

    // ===================== CLOSE BUTTON HANDLER =====================
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            console.log("Closing video player...");

            // Pause the video before closing
            if (videoPlayer && !videoPlayer.paused) {
                videoPlayer.pause();
            }

            goBackToCourse();
        });

        console.log("✅ Close button initialized");
    } else {
        console.error("❌ Close button not found");
    }

    // ===================== ESC KEY TO CLOSE =====================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            console.log("Escape pressed, closing video player...");
            if (videoPlayer && !videoPlayer.paused) {
                videoPlayer.pause();
            }
            goBackToCourse();
        }
    });

    // ===================== HELPER FUNCTION =====================
    function goBackToCourse() {
        if (courseId) {
            window.location.href = `/pages/courseInfo.html?id=${courseId}`;
        } else {
            window.location.href = '/pages/courseInfo.html';
        }
    }

});