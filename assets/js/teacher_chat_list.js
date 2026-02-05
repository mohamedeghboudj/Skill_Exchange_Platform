// ========== DYNAMIC CHAT LIST FOR TEACHERS (Session-Based) ==========

// Show "no students" message
function showNoStudentsMessage(chatlistSection) {
    const message = document.createElement('div');
    message.className = 'no-students-message';
    message.style.padding = '12px';
    message.style.color = '#888';
    message.style.fontSize = '14px';
    message.style.textAlign = 'center';
    message.textContent = 'You have no students yet';
    chatlistSection.appendChild(message);
}

// Create a chat student element
function createChatStudentElement(student, courseId, courseTitle) {
    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat';
    chatDiv.setAttribute('data-student-id', student.student_id);
    chatDiv.setAttribute('data-course-id', courseId);

    const imgSrc = student.profile_picture
        ? `/${student.profile_picture}`
        : '/assets/images/profilePic.png';

    chatDiv.innerHTML = `
        <div class="chatImg">
            <img 
                src="${imgSrc}"
                alt="Student Profile"
                onerror="this.src='/assets/images/profilePic.png'"
            >
        </div>
        <div class="chatInfo">
            <div class="name">${student.student_name}</div>
            <div class="lastchat">${student.last_message || 'Start conversation'}</div>
        </div>
    `;

    return chatDiv;
}

// Create a course group element
function createCourseGroupElement(course) {
    const courseGroupDiv = document.createElement('div');
    courseGroupDiv.className = 'chat-course';

    const courseTitle = document.createElement('p');
    courseTitle.textContent = course.course_title;
    courseGroupDiv.appendChild(courseTitle);

    // Add all students for this course
    course.students.forEach(student => {
        const chatElement = createChatStudentElement(
            student,
            course.course_id,
            course.course_title
        );
        courseGroupDiv.appendChild(chatElement);
    });

    return courseGroupDiv;
}

// Function to set active student chat and navigate
async function setActiveStudentChat(courseId, studentId) {
    try {
        const response = await fetch('/api/set_active_chat_teach.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                course_id: parseInt(courseId),
                student_id: parseInt(studentId)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('Active student chat set:', data.data);
            return true;
        } else {
            console.error('API error:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error setting active student chat:', error);
        return false;
    }
}

// Attach click listeners to chat elements
function attachTeacherChatClickListeners() {
    const chatElements = document.querySelectorAll('.chat');

    chatElements.forEach(chatElement => {
        chatElement.addEventListener('click', async function () {
            const studentId = this.dataset.studentId;
            const courseId = this.dataset.courseId;

            if (!studentId || !courseId) {
                console.error('Missing student or course ID');
                return;
            }

            // Call backend to set active chat in session
            const success = await setActiveStudentChat(courseId, studentId);

            if (success) {
                // Navigate to teacher progress page
                window.location.href = "/html/teacherProgress.html";
            } else {
                console.error('Failed to set active student chat');
                alert('Unable to open chat. Please try again.');
            }
        });
    });
}

// Load and render teacher's chat list (using session - no teacher_id needed)
async function loadTeacherChatList() {
    try {
        // Call API without teacher_id - it will use session
        const response = await fetch('/api/teacher_chat.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('Raw response:', text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response text:', text);
            throw new Error('Invalid JSON response from server');
        }

        if (result.success && result.chats) {
            const chatlistSection = document.querySelector('.chatlist');

            if (!chatlistSection) {
                console.error('Chatlist section not found');
                return;
            }

            // Remove existing static chat courses
            const existingChatCourses = chatlistSection.querySelectorAll('.chat-course');
            existingChatCourses.forEach(courseDiv => courseDiv.remove());

            // Remove "no students" message if it exists
            const noStudentsMsg = chatlistSection.querySelector('.no-students-message');
            if (noStudentsMsg) noStudentsMsg.remove();

            if (result.chats.length === 0) {
                showNoStudentsMessage(chatlistSection);
                return;
            }

            // Group students by course
            const groupedChats = {};
            result.chats.forEach(chat => {
                if (!groupedChats[chat.course_title]) {
                    groupedChats[chat.course_title] = {
                        course_id: chat.course_id,
                        course_title: chat.course_title,
                        students: []
                    };
                }
                groupedChats[chat.course_title].students.push({
                    student_id: chat.student_id,
                    student_name: chat.student_name,
                    profile_picture: chat.student_picture,
                    last_message: 'Start conversation'
                });
            });

            // Add dynamic courses
            Object.values(groupedChats).forEach(course => {
                const courseGroupElement = createCourseGroupElement(course);
                chatlistSection.appendChild(courseGroupElement);
            });

            // Attach click listeners to all chat elements
            attachTeacherChatClickListeners();

            console.log(`Teacher chat list loaded successfully (${result.chats.length} students)`);
        } else {
            console.error('Failed to load chat list:', result.message);

            // Show error or no students message
            const chatlistSection = document.querySelector('.chatlist');
            if (chatlistSection) {
                const existingChatCourses = chatlistSection.querySelectorAll('.chat-course');
                existingChatCourses.forEach(courseDiv => courseDiv.remove());
                showNoStudentsMessage(chatlistSection);
            }
        }
    } catch (error) {
        console.error('Error fetching teacher chat list:', error);
    }
}

// Load chat list when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTeacherChatList();
});