// teach_videos.js - COMPLETE UPDATED VERSION WITH REAL API CALLS
const API_BASE = '/api';

// Get videos for a specific course FROM DATABASE
export async function getVideosByCourse(courseId) {
    try {
        // Note: Videos are already included in get_teacher_courses.php response
        // This function might not be needed if you use course.videos directly
        const response = await fetch(`${API_BASE}/get_course_videos.php?course_id=${courseId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.videos;
        } else {
            console.error('API Error:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return [];
    }
}

// Get all videos (optional - you might not need this anymore)
export async function getAllVideos() {
    console.warn('getAllVideos() is deprecated - use getVideosByCourse() instead');
    return [];
}

// Add a video TO DATABASE
export async function addVideo(newVideo) {
    try {
        const formData = new FormData();
        formData.append('course_id', newVideo.courseId);
        formData.append('title', newVideo.title);
        
        if (newVideo.videoFile) {
            formData.append('video_file', newVideo.videoFile);
        }
        
        const response = await fetch(`${API_BASE}/add_video.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.video;
        } else {
            throw new Error(data.message || 'Failed to add video');
        }
    } catch (error) {
        console.error('Failed to add video:', error);
        throw error;
    }
}

// Delete a single video FROM DATABASE
export async function deleteVideo(videoId) {
    try {
        const response = await fetch(`${API_BASE}/delete_video.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ video_id: videoId }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete video');
        }
        
        return true;
    } catch (error) {
        console.error('Failed to delete video:', error);
        throw error;
    }
}

// Delete multiple videos FROM DATABASE
export async function deleteMultipleVideos(videoIds) {
    try {
        const response = await fetch(`${API_BASE}/delete_videos.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ video_ids: videoIds }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete videos');
        }
        
        return true;
    } catch (error) {
        console.error('Failed to delete videos:', error);
        throw error;
    }
}

// Assignment functions - TO DATABASE

// Get assignments for a specific course FROM DATABASE
export async function getAssignmentsByCourse(courseId) {
    try {
        // Note: Assignments are already included in get_teacher_courses.php response
        // This function might not be needed if you use course.assignments directly
        const response = await fetch(`${API_BASE}/get_course_assignments.php?course_id=${courseId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.assignments;
        } else {
            console.error('API Error:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch assignments:', error);
        return [];
    }
}

// Add an assignment TO DATABASE
export async function addAssignment(newAssignment) {
    try {
        const formData = new FormData();
        formData.append('course_id', newAssignment.courseId);
        formData.append('title', newAssignment.title);
        
        if (newAssignment.file) {
            formData.append('assignment_file', newAssignment.file);
        }
        
        const response = await fetch(`${API_BASE}/add_assignment.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.assignment;
        } else {
            throw new Error(data.message || 'Failed to add assignment');
        }
    } catch (error) {
        console.error('Failed to add assignment:', error);
        throw error;
    }
}

// Delete an assignment FROM DATABASE
export async function deleteAssignment(assignmentId) {
    try {
        const response = await fetch(`${API_BASE}/delete_assignment.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ assignment_id: assignmentId }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete assignment');
        }
        
        return true;
    } catch (error) {
        console.error('Failed to delete assignment:', error);
        throw error;
    }
}

// Update assignment (optional)
export async function updateAssignment(updatedAssignment) {
    try {
        const response = await fetch(`${API_BASE}/update_assignment.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedAssignment),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.assignment;
        } else {
            throw new Error(data.message || 'Failed to update assignment');
        }
    } catch (error) {
        console.error('Failed to update assignment:', error);
        throw error;
    }
}