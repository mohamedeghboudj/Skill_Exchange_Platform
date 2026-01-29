// teach_courses.js - COMPLETE UPDATED VERSION WITH REAL API CALLS
const API_BASE = '/api'; // Change this to your API path if different

// Get all courses for the logged-in teacher FROM DATABASE
export async function getCourses() {
    try {
        const response = await fetch(`${API_BASE}/get_teacher_courses.php`, {
            method: 'GET',
            credentials: 'include' // Sends session cookies
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.courses; // Returns array of courses from database
        } else {
            console.error('API Error:', data.message);
            return []; // Return empty array on error
        }
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return []; // Return empty array on network error
    }
}

// Get single course by ID FROM DATABASE
export async function getCourseById(id) {
    const courses = await getCourses();
    return courses.find(course => course.id === id);
}

// Add a new course (calls your existing create_course.php)
export async function addCourse(newCourse) {
    try {
        const response = await fetch(`${API_BASE}/create_course.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCourse),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.course; // Should contain the new course with ID
        } else {
            throw new Error(data.message || 'Failed to add course');
        }
    } catch (error) {
        console.error('Failed to add course:', error);
        throw error;
    }
}

// Delete a course FROM DATABASE - CALLS YOUR NEW API
export async function deleteCourse(id) {
    try {
        const response = await fetch(`${API_BASE}/delete_course.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ course_id: id }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete course');
        }
        
        return true; // Success
    } catch (error) {
        console.error('Failed to delete course:', error);
        throw error;
    }
}

// Update a course (optional - if you need it)
export async function updateCourse(updatedCourse) {
    try {
        const response = await fetch(`${API_BASE}/update_course.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCourse),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.course;
        } else {
            throw new Error(data.message || 'Failed to update course');
        }
    } catch (error) {
        console.error('Failed to update course:', error);
        throw error;
    }
}