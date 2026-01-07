

const videos = [
    // Web Development Course videos
    {
        id: 1,
        courseId: 1,
        title: "01.Introduction to the course",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 1
    },
    {
        id: 2,
        courseId: 1,
        title: "02.HTML & CSS Basics",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 2
    },
    {
        id: 3,
        courseId: 1,
        title: "03.JavaScript Essentials",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 3
    },
    {
        id: 4,
        courseId: 1,
        title: "04.Async Javascript",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 4
    },
    // UI/UX Course videos
    {
        id: 5,
        courseId: 8, // UI/UX course ID
        title: "01.Introduction to the course",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 1
    },
    {
        id: 6,
        courseId: 8,
        title: "02.UI & UX Fundamentals",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 2
    },
    {
        id: 7,
        courseId: 8,
        title: "03.UI Essentials",

        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 3
    },
    {
        id: 8,
        courseId: 8,
        title: "04.UX Essentials",

        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 4
    }
];

// Store assignments
const assignments = [
    {
        id: 1,
        courseId: 1,
        title: "Assignment 1",
        fileUrl: "",
        fileName: "web-dev-assignment-1.pdf"
    },
    {
        id: 2,
        courseId: 8,
        title: "Assignment 1",
        fileUrl: "",
        fileName: "uiux-assignment-1.pdf"
    }
];

// Initialize localStorage
if (!localStorage.getItem("videos")) {
    localStorage.setItem("videos", JSON.stringify(videos));
}

if (!localStorage.getItem("assignments")) {
    localStorage.setItem("assignments", JSON.stringify(assignments));
}

// Video management functions
export function getVideosByCourse(courseId) {
    const data = localStorage.getItem("videos");
    const allVideos = data ? JSON.parse(data) : [];
    return allVideos.filter(video => video.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getAllVideos() {
    const data = localStorage.getItem("videos");
    return data ? JSON.parse(data) : [];
}

export function addVideo(newVideo) {
    const videos = getAllVideos();
    newVideo.id = Date.now();
    videos.push(newVideo);
    localStorage.setItem("videos", JSON.stringify(videos));
    return newVideo;
}

export function deleteVideo(videoId) {
    let videos = getAllVideos();
    videos = videos.filter(video => video.id !== videoId);
    localStorage.setItem("videos", JSON.stringify(videos));
}

export function deleteMultipleVideos(videoIds) {
    let videos = getAllVideos();
    videos = videos.filter(video => !videoIds.includes(video.id));
    localStorage.setItem("videos", JSON.stringify(videos));
}

export function updateVideo(updatedVideo) {
    const videos = getAllVideos().map(video =>
        video.id === updatedVideo.id ? updatedVideo : video
    );
    localStorage.setItem("videos", JSON.stringify(videos));
}

// Assignment management functions
export function getAssignmentsByCourse(courseId) {
    const data = localStorage.getItem("assignments");
    const allAssignments = data ? JSON.parse(data) : [];
    return allAssignments.filter(assignment => assignment.courseId === courseId);
}

export function getAllAssignments() {
    const data = localStorage.getItem("assignments");
    return data ? JSON.parse(data) : [];
}

export function addAssignment(newAssignment) {
    const assignments = getAllAssignments();
    newAssignment.id = Date.now();
    assignments.push(newAssignment);
    localStorage.setItem("assignments", JSON.stringify(assignments));
    return newAssignment;
}

export function deleteAssignment(assignmentId) {
    let assignments = getAllAssignments();
    assignments = assignments.filter(assignment => assignment.id !== assignmentId);
    localStorage.setItem("assignments", JSON.stringify(assignments));
}

export function updateAssignment(updatedAssignment) {
    const assignments = getAllAssignments().map(assignment =>
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    );
    localStorage.setItem("assignments", JSON.stringify(assignments));
}