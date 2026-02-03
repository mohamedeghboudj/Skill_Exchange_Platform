// /assets/js/video_watcher.js
// This file should be included in videoPlayer.html

class VideoWatcher {
    constructor() {
        this.videoId = this.getUrlParameter('video_id');
        this.courseId = this.getUrlParameter('course_id');
        this.videoUrl = decodeURIComponent(this.getUrlParameter('video_url') || '');
        this.videoTitle = decodeURIComponent(this.getUrlParameter('title') || '');
        
        this.init();
    }
    
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    async init() {
        if (!this.videoId || !this.courseId) {
            console.error('Missing video or course ID');
            return;
        }
        
        this.setupVideoPlayer();
        await this.loadVideoData();
        this.setupProgressTracking();
    }
    
    setupVideoPlayer() {
        const videoElement = document.querySelector('video');
        if (videoElement && this.videoUrl) {
            videoElement.src = this.videoUrl;
            document.title = this.videoTitle || 'Video Player';
            
            // Update title display if element exists
            const titleElement = document.querySelector('.video-title');
            if (titleElement) {
                titleElement.textContent = this.videoTitle;
            }
        }
    }
    
    async loadVideoData() {
        try {
            const response = await fetch(`/api/get_video_details.php?video_id=${this.videoId}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                this.displayVideoDetails(data.data);
            }
        } catch (error) {
            console.error('Error loading video details:', error);
        }
    }
    
    displayVideoDetails(videoData) {
        // Update video description, duration, etc.
        const descElement = document.querySelector('.video-description');
        if (descElement && videoData.description) {
            descElement.textContent = videoData.description;
        }
        
        const durationElement = document.querySelector('.video-duration');
        if (durationElement && videoData.duration) {
            durationElement.textContent = this.formatDuration(videoData.duration);
        }
    }
    
    setupProgressTracking() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;
        
        let progressInterval;
        let lastProgressUpdate = 0;
        
        videoElement.addEventListener('play', () => {
            progressInterval = setInterval(() => {
                this.updateVideoProgress(videoElement.currentTime, videoElement.duration);
            }, 5000); // Update every 5 seconds
        });
        
        videoElement.addEventListener('pause', () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        });
        
        videoElement.addEventListener('ended', () => {
            this.markVideoAsCompleted();
        });
    }
    
    async updateVideoProgress(currentTime, totalDuration) {
        if (!this.videoId || !this.courseId) return;
        
        const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
        
        // Only update if significant progress made (more than 5% change)
        if (Math.abs(progressPercent - lastProgressUpdate) > 5) {
            try {
                await fetch('/api/update_video_progress.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        video_id: this.videoId,
                        course_id: this.courseId,
                        progress_percent: Math.round(progressPercent),
                        current_time: Math.round(currentTime)
                    })
                });
                
                lastProgressUpdate = progressPercent;
            } catch (error) {
                console.error('Error updating video progress:', error);
            }
        }
    }
    
    async markVideoAsCompleted() {
        try {
            await fetch('/api/mark_video_completed.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: this.videoId,
                    course_id: this.courseId
                })
            });
            
            // Show completion message
            this.showCompletionMessage();
            
        } catch (error) {
            console.error('Error marking video as completed:', error);
        }
    }
    
    showCompletionMessage() {
        // Create or show completion message
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="message-content">
                <h3>🎉 Video Completed!</h3>
                <p>You've completed "${this.videoTitle}"</p>
                <button onclick="window.close()">Close Player</button>
                <button onclick="location.reload()">Watch Again</button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }
    
    formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize when videoPlayer.html loads
if (window.location.pathname.includes('videoPlayer.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new VideoWatcher();
    });
}