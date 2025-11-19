// addcourse_handler.js - Handles saving course to localStorage and redirecting
// This file should be imported as a module in addcourse.html

import { addCourse } from './teach_courses.js';
import { addVideo, addAssignment } from './teach_videos.js';

// Function to handle course submission (called from addcourse.js after validation)
export function handleCourseSubmission() {
    // Get all form values
    const courseName = document.querySelector("#courseName").value;
    const timeToComplete = document.querySelector("#timeToComplete").value;
    const price = document.querySelector("#price").value;
    const teacher = document.querySelector("#teacher").value;
    const description = document.querySelector("#description").value;
    const selectTxt = document.querySelector('.select-txt').textContent;
    const videosList = document.querySelector("#vdFiles").files;
    const assignmentFile = document.querySelector("#assignment").files[0];

    // Create new course object
    const newCourse = {
        title: courseName,
        instructor: teacher,
        category: selectTxt,
        duration: `${timeToComplete} weeks`,
        price: parseInt(price),
        rating: 0,
        description: description
    };

    // Add course to localStorage (this mutates newCourse to add the id)
    addCourse(newCourse);
    const courseId = newCourse.id;

    console.log("Course created with ID:", courseId);

    // Add videos if uploaded
    if (videosList && videosList.length > 0) {
        Array.from(videosList).forEach((file, index) => {
            const videoData = {
                courseId: courseId,
                title: `${String(index + 1).padStart(2, '0')}.${file.name.replace(/\.[^/.]+$/, '')}`,
                duration: "00:00:00",
                thumbnail: "../assets/images/webdev.jpg", // Default thumbnail
                videoUrl: URL.createObjectURL(file),
                order: index + 1
            };
            addVideo(videoData);
            console.log("Video added:", videoData.title);
        });
    }

    // Add assignment if uploaded
    if (assignmentFile) {
        const assignmentData = {
            courseId: courseId,
            title: "Assignment 1",
            fileName: assignmentFile.name,
            fileUrl: URL.createObjectURL(assignmentFile)
        };
        addAssignment(assignmentData);
        console.log("Assignment added:", assignmentData.fileName);
    }

    // Show success message (optional - you can add a toast notification here)
    console.log("Course successfully created!");

    // Redirect to teach page
    window.location.href = "teach.html";
}