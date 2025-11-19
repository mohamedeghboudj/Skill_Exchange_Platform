// UPDATED: Real videos data extracted from the HTML static content

const videos = [
    // Web Development Course videos (courseId: 1)
    {
        id: 1,
        courseId: 1,
        title: "01.Introduction to the course",
        duration: "15:00",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 1
    },
    {
        id: 2,
        courseId: 1,
        title: "02.HTML & CSS Basics",
        duration: "38:36",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 2
    },
    {
        id: 3,
        courseId: 1,
        title: "03.JavaScript Essentials",
        duration: "01:24:05",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 3
    },
    {
        id: 4,
        courseId: 1,
        title: "04.Async Javascript",
        duration: "02:00:01",
        thumbnail: "../assets/images/webdev.jpg",
        videoUrl: "",
        order: 4
    },
    // UI/UX Course videos (courseId: 2)
    {
        id: 5,
        courseId: 2,
        title: "01.Introduction to the course",
        duration: "00:15:01",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 1
    },
    {
        id: 6,
        courseId: 2,
        title: "02.UI & UX Fundamentals",
        duration: "40:02:00",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 2
    },
    {
        id: 7,
        courseId: 2,
        title: "03.UI Essentials",
        duration: "01:15:00",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 3
    },
    {
        id: 8,
        courseId: 2,
        title: "04.UX Essentials",
        duration: "01:00:01",
        thumbnail: "../assets/images/uiux.png",
        videoUrl: "",
        order: 4
    }
];

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
        courseId: 2,
        title: "Assignment 1",
        fileUrl: "",
        fileName: "uiux-assignment-1.pdf"
    }
];

// Initialize localStorage for teach_videos and teach_assignments if empty
if (!localStorage.getItem("teach_videos")) {
    localStorage.setItem("teach_videos", JSON.stringify(videos));
}

if (!localStorage.getItem("teach_assignments")) {
    localStorage.setItem("teach_assignments", JSON.stringify(assignments));
}

// Video management functions

export function getVideosByCourse(courseId) {
    const data = localStorage.getItem("teach_videos");
    const allVideos = data ? JSON.parse(data) : [];
    return allVideos.filter(video => video.courseId === courseId).sort((a, b) => a.order - b.order);
}


export function getAllVideos() {
    const data = localStorage.getItem("teach_videos");
    return data ? JSON.parse(data) : [];
}


export function addVideo(newVideo) {
    const videos = getAllVideos();
    newVideo.id = Date.now();
    videos.push(newVideo);
    localStorage.setItem("teach_videos", JSON.stringify(videos));
    return newVideo;
}


export function deleteVideo(videoId) {
    let videos = getAllVideos();
    videos = videos.filter(video => video.id !== videoId);
    localStorage.setItem("teach_videos", JSON.stringify(videos));
}


export function deleteMultipleVideos(videoIds) {
    let videos = getAllVideos();
    videos = videos.filter(video => !videoIds.includes(video.id));
    localStorage.setItem("teach_videos", JSON.stringify(videos));
}


export function updateVideo(updatedVideo) {
    const videos = getAllVideos().map(video =>
        video.id === updatedVideo.id ? updatedVideo : video
    );
    localStorage.setItem("teach_videos", JSON.stringify(videos));
}

// Assignment management functions

export function getAssignmentsByCourse(courseId) {
    const data = localStorage.getItem("teach_assignments");
    const allAssignments = data ? JSON.parse(data) : [];
    return allAssignments.filter(assignment => assignment.courseId === courseId);
}


export function getAllAssignments() {
    const data = localStorage.getItem("teach_assignments");
    return data ? JSON.parse(data) : [];
}


export function addAssignment(newAssignment) {
    const assignments = getAllAssignments();
    newAssignment.id = Date.now();
    assignments.push(newAssignment);
    localStorage.setItem("teach_assignments", JSON.stringify(assignments));
    return newAssignment;
}


export function deleteAssignment(assignmentId) {
    let assignments = getAllAssignments();
    assignments = assignments.filter(assignment => assignment.id !== assignmentId);
    localStorage.setItem("teach_assignments", JSON.stringify(assignments));
}


export function updateAssignment(updatedAssignment) {
    const assignments = getAllAssignments().map(assignment =>
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    );
    localStorage.setItem("teach_assignments", JSON.stringify(assignments));
}