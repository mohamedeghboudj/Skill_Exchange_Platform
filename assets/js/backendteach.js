// backendteach.js
// Fully self-contained module — replaces teach.js entirely.
// Fetches all data from PHP API. No dependency on teach.js / teach_courses.js / teach_videos.js.

const API = '/api'; // ← adjust this if your api/ folder is at a different path

let deleteMode = {};

// ─── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    setupPreExistingCourses();
    await renderAllCourses();
    setupAddCourseButton();
    // setupChatClickHandlers();
});

// ─── 1. Remove any static/hardcoded course HTML from the page ───────────────
function setupPreExistingCourses() {
    document.querySelectorAll('.content .course').forEach(el => el.remove());
}

// ─── 2. Fetch helpers ────────────────────────────────────────────────────────
async function fetchJSON(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
    return res.json();
}

async function getCourses() {
    try {
        return await fetchJSON(API + '/get_courses.php');
    } catch (e) {
        console.warn('get_courses.php failed — empty list shown.', e);
        return [];
    }
}

async function getVideosByCourse(courseId) {
    try {
        return await fetchJSON(API + '/get_videos.php?course_id=' + courseId);
    } catch { return []; }
}

async function getAssignmentsByCourse(courseId) {
    try {
        return await fetchJSON(API + '/get_assignments.php?course_id=' + courseId);
    } catch { return []; }
}

// ─── 3. Render all courses into .content ─────────────────────────────────────
async function renderAllCourses() {
    const contentDiv = document.querySelector('.content');
    if (!contentDiv) return;

    try {
        const courses = await getCourses();
        for (const course of courses) {
            contentDiv.appendChild(await createCourseElement(course));
        }
    } catch (err) {
        console.error('Failed to load courses:', err);
        contentDiv.innerHTML = '<p style="color:red;text-align:center;margin-top:40px;">Failed to load courses. Please refresh.</p>';
    }

    // "Add New Course" button always at the end
    if (!document.querySelector('.add-course-container')) {
        contentDiv.appendChild(createAddCourseButton());
    }
}

// ─── 4. Build one course card ────────────────────────────────────────────────
async function createCourseElement(course) {
    const courseId = course.course_id || course.id;
    const title = course.course_title || course.title;

    const videos = await getVideosByCourse(courseId);
    const assignments = await getAssignmentsByCourse(courseId);

    const div = document.createElement('div');
    div.className = 'course';
    div.setAttribute('data-course-id', courseId);
    div.style.animation = 'fadeIn 0.5s ease';

    div.innerHTML = `
        <div class="coursename">
            <h3>${title}</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="#b7b4b4"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-trash2-icon lucide-trash-2 delete-course-btn">
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M3 6h18"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
        </div>

        <div class="videos">
            <div class="vdHead">
                <p>Course videos</p>
                <div class="edit-buttons">
                    <button class="deletebtn delete-videos-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-circle-x-icon lucide-circle-x">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                        </svg>
                        delete
                    </button>
                    <button class="addVd add-video-btn">+ Add</button>
                </div>
            </div>
            <div class="vdcards" data-course-id="${courseId}">
                ${videos.length
            ? videos.map(v => videoCardHTML(v, courseId)).join('')
            : '<p style="color:#999;font-style:italic;">No videos yet</p>'}
            </div>
        </div>

        <div class="assignments">
            <p>Assignments</p>
            ${assignments.length
            ? assignments.map(a => assignmentCardHTML(a)).join('')
            : '<p style="color:#999;font-style:italic;">No assignments yet</p>'}
            <div class="add-assignment-container" style="margin-top:10px;">
                <button class="addAss add-assignment-btn" data-course-id="${courseId}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Assignment
                </button>
            </div>
        </div>
    `;

    setupCourseEventListeners(div, courseId);
    return div;
}

// ─── 5. HTML card templates ──────────────────────────────────────────────────
function videoCardHTML(video, courseId) {
    const id = video.video_id || video.id;
    const title = video.video_title || video.title;
    const thumb = video.thumbnail || video.video_url || '../assets/images/webdev.jpg';
    const show = deleteMode[courseId] ? 'block' : 'none';

    return `
        <div class="video" data-video-id="${id}" style="animation:slideIn 0.3s ease;">
            <div class="one">
                <div class="vd-background"><img src="${thumb}" alt="${title}"></div>
                <div class="vd-info"><div class="title">${title}</div></div>
            </div>
            <div class="two">
                <input type="checkbox" class="video-checkbox" style="display:${show};" data-video-id="${id}"/>
            </div>
        </div>`;
}

function assignmentCardHTML(a) {
    const id = a.assignment_id || a.id;
    const title = a.assignment_title || a.title || 'Assignment';
    const url = a.assignment_url || a.fileUrl || '';

    return `
        <div class="assignment" data-assignment-id="${id}" style="animation:slideIn 0.3s ease;">
            <div class="pdf assignment-file" data-file-url="${url}" style="cursor:pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-file-icon lucide-file">
                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
                    <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                </svg>
                ${title}
            </div>
            <div class="edit-buttons">
                <button class="deletebtn delete-assignment-btn" data-assignment-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-circle-x-icon lucide-circle-x">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                    </svg>
                    delete
                </button>
            </div>
        </div>`;
}

// ─── 6. Wire up events on one course card ───────────────────────────────────
function setupCourseEventListeners(courseDiv, courseId) {
    courseDiv.querySelector('.delete-course-btn')
        .addEventListener('click', e => { e.stopPropagation(); handleDeleteCourse(courseId, courseDiv); });

    courseDiv.querySelector('.delete-videos-btn')
        .addEventListener('click', e => { e.stopPropagation(); handleDeleteVideos(courseId, courseDiv); });

    courseDiv.querySelector('.add-video-btn')
        .addEventListener('click', () => handleAddVideo(courseId, courseDiv));

    courseDiv.querySelector('.add-assignment-btn')
        .addEventListener('click', () => handleAddAssignment(courseId, courseDiv));

    // view assignment file on click
    courseDiv.querySelectorAll('.assignment-file').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation();
            const url = el.dataset.fileUrl;
            url ? window.open(url, '_blank') : alert('No file available');
        });
    });

    // delete single assignment buttons
    courseDiv.querySelectorAll('.delete-assignment-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            handleDeleteSingleAssignment(parseInt(btn.dataset.assignmentId), courseDiv);
        });
    });
}

// ─── 7. DELETE course ────────────────────────────────────────────────────────
function handleDeleteCourse(courseId, courseDiv) {
    if (!confirm('Delete this course and all its videos / assignments?')) return;
    courseDiv.style.animation = 'fadeOut 0.3s ease';
    setTimeout(async () => {
        try {
            await fetch(API + '/delete_course.php', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: courseId })
            });
        } catch (e) { console.error(e); }
        courseDiv.remove();
    }, 300);
}

// ─── 8. DELETE videos (checkbox select mode) ─────────────────────────────────
function handleDeleteVideos(courseId, courseDiv) {
    const vdcards = courseDiv.querySelector('.vdcards');
    const checkboxes = vdcards.querySelectorAll('.video-checkbox');
    const btn = courseDiv.querySelector('.delete-videos-btn');

    const exitDeleteMode = () => {
        deleteMode[courseId] = false;
        vdcards.querySelectorAll('.video-checkbox').forEach(cb => cb.style.display = 'none');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-circle-x-icon lucide-circle-x">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg> delete`;
        if (!vdcards.querySelector('.video')) {
            const p = document.createElement('p');
            p.style.cssText = 'color:#999;font-style:italic;';
            p.textContent = 'No videos yet';
            vdcards.appendChild(p);
        }
    };

    if (!deleteMode[courseId]) {
        // ENTER delete mode
        deleteMode[courseId] = true;
        checkboxes.forEach(cb => cb.style.display = 'block');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-circle-x-icon lucide-circle-x">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg> Remove Selected`;
    } else {
        // Already in delete mode → act
        const selectedIds = [...checkboxes].filter(cb => cb.checked).map(cb => parseInt(cb.dataset.videoId));

        if (selectedIds.length > 0) {
            fetch(API + '/delete_videos.php', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_ids: selectedIds })
            }).catch(e => console.error(e));

            selectedIds.forEach(id => {
                const card = vdcards.querySelector(`[data-video-id="${id}"]`);
                if (card) { card.style.animation = 'slideOut 0.3s ease'; setTimeout(() => card.remove(), 300); }
            });
        }
        setTimeout(exitDeleteMode, 350);
    }
}

// ─── 9. ADD video ────────────────────────────────────────────────────────────
function handleAddVideo(courseId, courseDiv) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/mov';

    input.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('course_id', courseId);
        fd.append('video', file);

        try {
            const res = await fetch(API + '/add_video.php', { method: 'POST', credentials: 'include', body: fd });
            const data = await res.json();

            const vdcards = courseDiv.querySelector('.vdcards');
            const ph = [...vdcards.querySelectorAll('p')].find(p => /no videos yet/i.test(p.textContent));
            if (ph) ph.remove();

            const newVideo = data.video || {
                video_id: data.video_id,
                video_title: file.name.replace(/\.[^/.]+$/, ''),
                video_url: '../assets/images/webdev.jpg'
            };

            const wrapper = document.createElement('div');
            wrapper.innerHTML = videoCardHTML(newVideo, courseId);
            vdcards.appendChild(wrapper.firstElementChild);
        } catch (err) { console.error('Add video failed:', err); }
    });

    input.click();
}

// ─── 10. ADD assignment ──────────────────────────────────────────────────────
function handleAddAssignment(courseId, courseDiv) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('course_id', courseId);
        fd.append('assignment', file);

        try {
            const res = await fetch(API + '/add_assignment.php', { method: 'POST', credentials: 'include', body: fd });
            const data = await res.json();

            const assignmentsDiv = courseDiv.querySelector('.assignments');
            const addBtnContainer = assignmentsDiv.querySelector('.add-assignment-container');

            const ph = [...assignmentsDiv.querySelectorAll('p')].find(p => /no assignments yet/i.test(p.textContent));
            if (ph) ph.remove();

            const newAssignment = data.assignment || {
                assignment_id: data.assignment_id,
                assignment_title: file.name.replace(/\.[^/.]+$/, ''),
                assignment_url: ''
            };

            const wrapper = document.createElement('div');
            wrapper.innerHTML = assignmentCardHTML(newAssignment);
            const newEl = wrapper.firstElementChild;
            assignmentsDiv.insertBefore(newEl, addBtnContainer);

            // wire new card
            newEl.querySelector('.assignment-file').addEventListener('click', ev => {
                ev.stopPropagation();
                const url = newEl.querySelector('.assignment-file').dataset.fileUrl;
                url && window.open(url, '_blank');
            });
            newEl.querySelector('.delete-assignment-btn').addEventListener('click', ev => {
                ev.stopPropagation();
                handleDeleteSingleAssignment(parseInt(newEl.dataset.assignmentId), courseDiv);
            });
        } catch (err) { console.error('Add assignment failed:', err); }
    });

    input.click();
}

// ─── 11. DELETE single assignment ─────────────────────────────────────────────
function handleDeleteSingleAssignment(assignmentId, courseDiv) {
    const card = courseDiv.querySelector(`[data-assignment-id="${assignmentId}"]`);
    if (!card) return;

    card.style.animation = 'slideOut 0.3s ease';
    setTimeout(async () => {
        try {
            await fetch(API + '/delete_assignment.php', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignment_id: assignmentId })
            });
        } catch (e) { console.error(e); }

        card.remove();

        const assignmentsDiv = courseDiv.querySelector('.assignments');
        if (!assignmentsDiv.querySelector('.assignment')) {
            const p = document.createElement('p');
            p.style.cssText = 'color:#999;font-style:italic;';
            p.textContent = 'No assignments yet';
            assignmentsDiv.insertBefore(p, assignmentsDiv.querySelector('.add-assignment-container'));
        }
    }, 300);
}

// ─── 12. "Add New Course" button ─────────────────────────────────────────────
function createAddCourseButton() {
    const div = document.createElement('div');
    div.className = 'add-course-container';
    div.style.cssText = 'display:flex;justify-content:center;align-items:center;margin:20px 0;animation:fadeIn 0.5s ease;';
    div.innerHTML = `
        <button class="add-new-course-btn" style="
            background:linear-gradient(-120deg, rgba(143,201,251,0.301) 20%, #1976d2);
            color:#fff;border:none;border-radius:12px;padding:15px 30px;
            font-size:14px;font-weight:700;cursor:pointer;width:97%;
            display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s ease;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Add New Course
        </button>`;
    return div;
}

function setupAddCourseButton() {
    document.addEventListener('click', e => {
        if (e.target.closest('.add-new-course-btn')) {
            window.location.href = 'addcourse.html';
        }
    });
}

// ─── 13. Chat labels → teacherProgress  hadil touched this ──────────────────────────────────────
//function setupChatClickHandlers() {
//   document.querySelectorAll('.chat').forEach(el => {
//     el.addEventListener('click', () => {
//       window.location.href = '/html/teacherProgress.html';
//  });
// });
//}