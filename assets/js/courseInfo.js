/*
document.addEventListener('DOMContentLoaded', () => {
    // Safely grab elements
    const play = document.querySelector("#play");
    const sendRequest = document.querySelector("#send");
    const mydialog = document.getElementById("popup");

    if (play) {
        play.addEventListener("click", () => {
            window.location.href = "videoPlayer.html";
        });
    }

    if (sendRequest && mydialog) {
        sendRequest.addEventListener('click', () => {
            mydialog.showModal();
        });

        mydialog.addEventListener('click', () => {
            mydialog.close();
        });
    }

    // ===================== COURSE INFO DISPLAY =====================
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    if (!id) {
        console.error("No course ID in URL");
        return;
    }

    // Fetch course data from DB
    fetchCourseInfo(id);

    // ===================== FUNCTIONS =====================
    async function fetchCourseInfo(courseId) {
        try {
            const response = await fetch(`/api/get_course_details.php?course_id=${courseId}`);
            const result = await response.json();

            console.log(result);
            console.log(courseId);

            if (result.success && result.data) {
                const course = result.data;

                const nameEl = document.querySelector("#course-name");
                const descEl = document.querySelector("#description");
                const priceEl = document.querySelector("#price");
                const durationEl = document.querySelector("#duration");
                const teacherNameEl = document.querySelector(".teacher-name");
                const teacherNameSpan = document.querySelector("#teacher-name");

                if (nameEl) nameEl.textContent = course.course_title;
                if (descEl) descEl.textContent = course.course_description;
                if (priceEl) priceEl.textContent = course.price;
                if (durationEl) durationEl.textContent = course.duration;
                if (teacherNameEl) teacherNameEl.textContent = course.teacher_id; // optional: fetch name later
                if (teacherNameSpan) teacherNameSpan.textContent = course.teacher_id;

                // Fetch teacher and curriculum from DB
                fetchTeacherInfo(courseId);
                fetchCourseCurriculum(courseId);
            } else {
                console.error("Course not found:", result.error);
            }
        } catch (err) {
            console.error("Error fetching course:", err);
        }
    }

    async function fetchTeacherInfo(courseId) {
        try {
            const response = await fetch(`/api/course_info_get_teacher.php?course_id=${courseId}`);
            const result = await response.json();

            if (result.success && result.data) {
                displayTeacherInfo(result.data);
            } else {
                console.error('Teacher not found:', result.error);
            }
        } catch (error) {
            console.error('Error fetching teacher info:', error);
        }
    }

    function displayTeacherInfo(teacher) {
        const teacherNameElements = document.querySelectorAll('#teacher-name, .teacher-name');
        teacherNameElements.forEach(el => {
            el.textContent = teacher.full_name || el.textContent;
        });

        const profileImg = document.querySelector('.teacher img');
        if (profileImg) {
            profileImg.src = teacher.profile_picture ? '/' + teacher.profile_picture : '/assets/images/profilePic.png';
            profileImg.alt = teacher.full_name || "Teacher";
        }

        const bioElement = document.querySelector('#teachfooter p');
        if (bioElement && teacher.bio) bioElement.textContent = teacher.bio;

        updateSocialLinks(teacher);
    }

    function updateSocialLinks(teacher) {
        const linkContainers = document.querySelectorAll('.teacherlinkslg, .teacherlinks');

        linkContainers.forEach(container => {
            const links = container.querySelectorAll('li a');

            links.forEach(link => {
                const svg = link.querySelector('svg');
                const icon = link.querySelector('i');

                if (svg) {
                    if (svg.classList.contains('lucide-instagram')) {
                        if (teacher.insta_link) { link.href = teacher.insta_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-linkedin')) {
                        if (teacher.linkedIn_link) { link.href = teacher.linkedIn_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-phone')) {
                        if (teacher.whatsapp_link) { link.href = teacher.whatsapp_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-github')) {
                        link.style.display = 'none';
                    }
                }

                if (icon && icon.classList.contains('fa-whatsapp')) {
                    if (teacher.whatsapp_link) { link.href = teacher.whatsapp_link; link.target = '_blank'; link.style.display = 'block'; }
                    else { link.style.display = 'none'; }
                }
            });
        });
    }

    async function fetchCourseCurriculum(courseId) {
        try {
            const response = await fetch(`/api/get_course_curriculum.php?course_id=${courseId}`);
            const result = await response.json();

            if (result.success && result.data) {
                displayCurriculum(result.data);
            } else {
                console.error('Curriculum not found:', result.error);
            }
        } catch (error) {
            console.error('Error fetching curriculum:', error);
        }
    }

    function displayCurriculum(data) {
        displayVideos(data.videos);
        displayAssignments(data.assignments);
    }

    function displayVideos(videos) {
        const videoList = document.getElementById('video-list');
        if (!videoList) return;

        videoList.innerHTML = '';
        if (videos.length === 0) {
            videoList.innerHTML = '<li style="list-style: none; color: #666;">No videos available yet</li>';
            return;
        }

        videos.forEach(video => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" class="lucide lucide-monitor-play-icon lucide-monitor-play">
                    <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                </svg>
                <span>${video.video_title}</span>
            `;
            videoList.appendChild(li);
        });
    }

    function displayAssignments(assignments) {
        const assignmentList = document.getElementById('assignment-list');
        if (!assignmentList) return;

        assignmentList.innerHTML = '';
        if (assignments.length === 0) {
            assignmentList.innerHTML = '<li style="list-style: none; color: #666;">No assignments available yet</li>';
            return;
        }

        assignments.forEach(assignment => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" class="lucide lucide-file-check-icon lucide-file-check">
                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                    <path d="m9 15 2 2 4-4" />
                </svg>
                <span>${assignment.assignment_title}</span>
            `;
            assignmentList.appendChild(li);
        });
    }
});
*/
document.addEventListener('DOMContentLoaded', () => {
    console.log("I will workkkk");

    // ===================== POPUP HANDLING =====================
    const sendRequest = document.querySelector("#send");
    const mydialog = document.getElementById("popup");

    if (sendRequest && mydialog) {
        sendRequest.addEventListener('click', () => mydialog.showModal());
        mydialog.addEventListener('click', () => mydialog.close());
    }

    // ===================== COURSE ID =====================
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    if (!id) {
        console.error("No course ID in URL");
        return;
    }

    // ===================== COURSE INFO =====================
    fetchCourseInfo(id);
    fetchTeacherInfo(id);
    fetchCourseCurriculum(id);
    fetchCourseVideos(id);

    // ===================== FUNCTIONS =====================

    // Fetch course info from DB
    async function fetchCourseInfo(courseId) {
        try {
            const response = await fetch(`/api/get_course_details.php?course_id=${courseId}`);
            const result = await response.json();

            console.log(result, courseId);

            if (result.success && result.data) {
                const course = result.data;

                const nameEl = document.querySelector("#course-name");
                const descEl = document.querySelector("#description");
                const priceEl = document.querySelector("#price");
                const durationEl = document.querySelector("#duration");
                const teacherNameEl = document.querySelector(".teacher-name");
                const teacherNameSpan = document.querySelector("#teacher-name");

                if (nameEl) nameEl.textContent = course.course_title;
                if (descEl) descEl.textContent = course.course_description;
                if (priceEl) priceEl.textContent = course.price;
                if (durationEl) durationEl.textContent = course.duration;
                if (teacherNameEl) teacherNameEl.textContent = course.teacher_id; // will update after fetching teacher
                if (teacherNameSpan) teacherNameSpan.textContent = course.teacher_id;
            } else {
                console.error("Course not found:", result.error);
            }
        } catch (err) {
            console.error("Error fetching course info:", err);
        }
    }

    // Fetch teacher info
    async function fetchTeacherInfo(courseId) {
        try {
            const response = await fetch(`/api/course_info_get_teacher.php?course_id=${courseId}`);
            const result = await response.json();

            if (result.success && result.data) {
                displayTeacherInfo(result.data);
            } else {
                console.error('Teacher not found:', result.error);
            }
        } catch (error) {
            console.error('Error fetching teacher info:', error);
        }
    }

    function displayTeacherInfo(teacher) {
        const teacherNameElements = document.querySelectorAll('#teacher-name, .teacher-name');
        teacherNameElements.forEach(el => el.textContent = teacher.full_name || el.textContent);

        const profileImg = document.querySelector('.teacher img');
        if (profileImg) {
            profileImg.src = teacher.profile_picture ? '/' + teacher.profile_picture : '/assets/images/profilePic.png';
            profileImg.alt = teacher.full_name || "Teacher";
        }

        const bioElement = document.querySelector('#teachfooter p');
        if (bioElement && teacher.bio) bioElement.textContent = teacher.bio;

        updateSocialLinks(teacher);
    }

    function updateSocialLinks(teacher) {
        const linkContainers = document.querySelectorAll('.teacherlinkslg, .teacherlinks');
        linkContainers.forEach(container => {
            const links = container.querySelectorAll('li a');

            links.forEach(link => {
                const svg = link.querySelector('svg');
                const icon = link.querySelector('i');

                if (svg) {
                    if (svg.classList.contains('lucide-instagram')) {
                        if (teacher.insta_link) { link.href = teacher.insta_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-linkedin')) {
                        if (teacher.linkedIn_link) { link.href = teacher.linkedIn_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-phone')) {
                        if (teacher.whatsapp_link) { link.href = teacher.whatsapp_link; link.target = '_blank'; link.style.display = 'block'; }
                        else { link.style.display = 'none'; }
                    } else if (svg.classList.contains('lucide-github')) {
                        link.style.display = 'none';
                    }
                }

                if (icon && icon.classList.contains('fa-whatsapp')) {
                    if (teacher.whatsapp_link) { link.href = teacher.whatsapp_link; link.target = '_blank'; link.style.display = 'block'; }
                    else { link.style.display = 'none'; }
                }
            });
        });
    }

    // Fetch course curriculum
    async function fetchCourseCurriculum(courseId) {
        try {
            const response = await fetch(`/api/get_course_curriculum.php?course_id=${courseId}`);
            const result = await response.json();

            if (result.success && result.data) {
                displayCurriculum(result.data);
            } else {
                console.error('Curriculum not found:', result.error);
            }
        } catch (error) {
            console.error('Error fetching curriculum:', error);
        }
    }

    function displayCurriculum(data) {
        displayVideos(data.videos);
        displayAssignments(data.assignments);
    }

    function displayVideos(videos) {
        const videoList = document.getElementById('video-list');
        if (!videoList) return;

        videoList.innerHTML = '';
        if (videos.length === 0) {
            videoList.innerHTML = '<li style="list-style: none; color: #666;">No videos available yet</li>';
            return;
        }

        videos.forEach(video => {
            const li = document.createElement('li');
            li.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-play-icon lucide-monitor-play">
            <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z" />
            <path d="M12 17v4" />
            <path d="M8 21h8" />
            <rect x="2" y="3" width="20" height="14" rx="2" /></svg>
            <span>${video.video_title}</span>`;
            videoList.appendChild(li);
        });
    }

    function displayAssignments(assignments) {
        const assignmentList = document.getElementById('assignment-list');
        if (!assignmentList) return;

        assignmentList.innerHTML = '';
        if (assignments.length === 0) {
            assignmentList.innerHTML = '<li style="list-style: none; color: #666;">No assignments available yet</li>';
            return;
        }

        assignments.forEach(assignment => {
            const li = document.createElement('li');
            li.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check-icon lucide-file-check">
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
            <path d="m9 15 2 2 4-4" /></svg>
            <span>${assignment.assignment_title}</span>`;
            assignmentList.appendChild(li);
        });
    }

    // Fetch course videos (DB driven)
    async function fetchCourseVideos(courseId) {
        try {
            const response = await fetch(`/api/get_course_vedio.php?course_id=${courseId}`);
            const result = await response.json();

            if (result.success && result.data) {
                displayCourseVideos(result.data);
            } else {
                console.error('Videos not found:', result.error);
            }
        } catch (error) {
            console.error('Error fetching course videos:', error);
        }
    }

    function displayCourseVideos(videos) {
        const container = document.getElementById('course-videos-container');
        if (!container) return;

        container.innerHTML = '';
        if (videos.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">No videos available yet</p>';
            return;
        }

        const unlockedVideos = videos.slice(0, 2); // only first 2
        unlockedVideos.forEach(video => {
            const figure = document.createElement('figure');
            figure.innerHTML = `
            <picture><img src="../assets/images/video.webp" alt="video"></picture>
            <figcaption>
                <h3>${video.video_title}</h3>
                <p>${video.instructor_name}</p>
                <p class="video-time">${video.duration}</p>
                <button class="play-btn" data-video-id="${video.video_id}" data-video-url="${video.video_url}">Play</button>
            </figcaption>`;
            container.appendChild(figure);
        });

        // Add one single locked box if there are more videos
        if (videos.length > 2) {
            const lockedFigure = document.createElement('figure');
            lockedFigure.innerHTML = `
            <img src="../assets/images/lock-iconwebp.webp" alt="locked video">
            <figcaption>
                <h3>${videos[2].video_title}</h3>
                <p>${videos[2].instructor_name}</p>
                <p class="video-time">${videos[2].duration}</p>
                <button class="locked-btn" disabled>Locked</button>
            </figcaption>`;
            container.appendChild(lockedFigure);
        }

        addVideoPlayListeners();
    }


    function addVideoPlayListeners() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const videoId = e.target.getAttribute('data-video-id');
                const videoUrl = e.target.getAttribute('data-video-url');

                localStorage.setItem('currentVideoId', videoId);
                localStorage.setItem('currentVideoUrl', videoUrl);

                window.location.href = '/pages/videoPlayer.html';
            });
        });
    }

});

