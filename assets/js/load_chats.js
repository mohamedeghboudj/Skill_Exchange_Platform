// Load chats for students (Learn page)
async function loadStudentChats() {
    try {
        const response = await fetch('/api/student_chat.php', {
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

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response text:', text);
            throw new Error('Invalid JSON response from server');
        }

        if (data.success) {
            const chatList = document.querySelector('.chatlist');

            if (!chatList) {
                console.error('Chat list element not found');
                return;
            }

            const existingChats = chatList.querySelectorAll('.chat');
            existingChats.forEach(chat => chat.remove());

            if (data.chats.length === 0) {
                console.log('No chats found for this student');
                return;
            }

            data.chats.forEach(chat => {
                const chatDiv = document.createElement('div');
                chatDiv.className = 'chat';
                chatDiv.dataset.courseId = chat.course_id;
                chatDiv.dataset.teacherId = chat.teacher_id;

                // Create image element with error handling
                const imgSrc = chat.teacher_picture || '/assets/images/profilePic.png';

                chatDiv.innerHTML = `
                    <div class="chatImg">
                        <img src="${imgSrc}" 
                             alt="Profile" 
                             onerror="this.src='/assets/images/profilePic.png'">
                    </div>
                    <div class="chatInfo">
                        <div class="name">${chat.course_title} | ${chat.teacher_name}</div>
                        <div class="lastchat">Start conversation</div>
                    </div>
                `;

                chatList.appendChild(chatDiv);
            });

            attachChatClickListeners();
            console.log(`Loaded ${data.chats.length} chats successfully`);
        } else {
            console.error('API returned error:', data.message, data);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        console.error('Full error details:', error.message);
    }
}

// Load chats for teachers (Teach page)
async function loadTeacherChats() {
    try {
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

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response text:', text);
            throw new Error('Invalid JSON response from server');
        }

        if (data.success) {
            const chatList = document.querySelector('.chatlist');

            if (!chatList) {
                console.error('Chat list element not found');
                return;
            }

            const existingChats = chatList.querySelectorAll('.chat');
            existingChats.forEach(chat => chat.remove());

            if (data.chats.length === 0) {
                console.log('No students enrolled in your courses');
                return;
            }

            // Group students by course
            const groupedChats = {};
            data.chats.forEach(chat => {
                if (!groupedChats[chat.course_title]) {
                    groupedChats[chat.course_title] = [];
                }
                groupedChats[chat.course_title].push(chat);
            });

            Object.keys(groupedChats).forEach(courseTitle => {
                const courseHeader = document.createElement('p');
                courseHeader.textContent = courseTitle;
                courseHeader.style.fontWeight = 'bold';
                courseHeader.style.marginTop = '15px';
                courseHeader.style.color = '#333';
                chatList.appendChild(courseHeader);

                groupedChats[courseTitle].forEach(chat => {
                    const chatDiv = document.createElement('div');
                    chatDiv.className = 'chat';
                    chatDiv.dataset.courseId = chat.course_id;
                    chatDiv.dataset.studentId = chat.student_id;

                    const imgSrc = chat.student_picture || '/assets/images/profilePic.png';

                    chatDiv.innerHTML = `
                        <div class="chatImg">
                            <img src="${imgSrc}" 
                                 alt="Profile" 
                                 onerror="this.src='/assets/images/profilePic.png'">
                        </div>
                        <div class="chatInfo">
                            <div class="name">${chat.student_name}</div>
                            <div class="lastchat">Start conversation</div>
                        </div>
                    `;

                    chatList.appendChild(chatDiv);
                });
            });

            attachChatClickListeners();
            console.log(`Loaded ${data.chats.length} chats successfully`);
        } else {
            console.error('API returned error:', data.message, data);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        console.error('Full error details:', error.message);
    }
}

// Attach click listeners to chat items
// Attach click listeners to chat items
function attachChatClickListeners() {
    let chatLabels = document.getElementsByClassName("chat");

    for (let chatLabel of chatLabels) {
        chatLabel.addEventListener('click', async function () {
            const courseId = this.dataset.courseId;
            const teacherId = this.dataset.teacherId;

            if (!courseId || !teacherId) {
                console.error('Missing course or teacher ID');
                return;
            }

            // Call backend to set active chat in session
            const success = await setActiveChat(courseId, teacherId);

            if (success) {
                // Navigate to progress page
                window.location.href = "/html/studentProgress.html";
            } else {
                console.error('Failed to set active chat');
                alert('Unable to open chat. Please try again.');
            }
        });
    }
}

// New function to set active chat in backend session
async function setActiveChat(courseId, teacherId) {
    try {
        const response = await fetch('/api/set_active_chat_learn.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                course_id: parseInt(courseId),
                teacher_id: parseInt(teacherId)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('Active chat set:', data.data);
            return true;
        } else {
            console.error('API error:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error setting active chat:', error);
        return false;
    }
}

// Determine which page and load appropriate chats
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes('learn.html')) {
        console.log('Loading student chats...');
        loadStudentChats();
    } else if (currentPage.includes('teach.html')) {
        console.log('Loading teacher chats...');
        loadTeacherChats();
    }
});

