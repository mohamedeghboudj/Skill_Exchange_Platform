// backend_studentrequest.js
console.log("=== Enrollment Script Loading ===");
console.log("📍 Running in:", window.location.pathname);

// DECIDE WHERE WE'RE RUNNING

// If we're in the parent window (not in iframe), exit early
if (window === window.parent) {
    console.log("⚠️ Script loaded in parent window - exiting (should only run in iframe)");
    return;
}

console.log("✅ Running inside iframe");

// MAIN INITIALIZATION , ONLY FOR IFRAME
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 Iframe DOM loaded");
    setTimeout(() => {
        initializeEnrollmentForm();
    }, 300);
});

// FORM SETUP FUNCTIONS
function initializeEnrollmentForm() {
    console.log("🔧 Initializing enrollment form...");

    const elements = {
        submitBtn: document.getElementById("SubmitButton"),
        form: document.querySelector("form"),
        message: document.getElementById("message"),
        startTime: document.getElementById("startTime"),
        endTime: document.getElementById("endTime"),
        defaultLevel: document.getElementById("default"),
        defaultDays: document.getElementById("DEFAULT"),
        resultDiv: document.getElementById("submissionResult"),
        levelSelect: document.getElementById("selected"),
        levelList: document.getElementById("level-list"),
        daysSelect: document.getElementById("selected-day"),
        daysList: document.getElementById("days-list")
    };

    // Log what we found
    console.log("🔍 Form elements check:");
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`  ${name}:`, element ? "✅ FOUND" : "❌ MISSING");
    });

    if (!elements.submitBtn || !elements.form) {
        console.error("❌ Essential form elements missing!");
        return;
    }

    console.log("✅ All form elements found");

    setupDropdowns(elements);

    elements.form.addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("📝 Form submission intercepted");
        await handleEnrollmentSubmit(elements);
    });

    console.log("🎉 Enrollment form setup complete!");
}

function setupDropdowns(elements) {
    // Level dropdown
    if (elements.levelSelect && elements.levelList && elements.defaultLevel) {
        elements.levelSelect.addEventListener("click", (e) => {
            e.stopPropagation();
            elements.levelList.classList.toggle("show");
        });
        elements.levelList.querySelectorAll("li").forEach(li => {
            li.addEventListener("click", () => {
                elements.defaultLevel.textContent = li.textContent;
                elements.levelList.classList.remove("show");
                console.log("Level selected:", li.textContent);
            });
        });
    }

    // Days dropdown with checkboxes
    if (elements.daysSelect && elements.daysList && elements.defaultDays) {
        elements.daysSelect.addEventListener("click", (e) => {
            e.stopPropagation();
            elements.daysList.classList.toggle("show");
        });

        document.querySelectorAll('.Day').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const selectedDays = Array.from(document.querySelectorAll('.Day:checked'))
                    .map(cb => cb.value);
                elements.defaultDays.textContent = selectedDays.length > 0 ? selectedDays.join(', ') : "Select available days";
                console.log("Days selected:", selectedDays);
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (elements.levelList && !elements.levelSelect.contains(e.target) && !elements.levelList.contains(e.target)) {
            elements.levelList.classList.remove("show");
        }
        if (elements.daysList && !elements.daysSelect.contains(e.target) && !elements.daysList.contains(e.target)) {
            elements.daysList.classList.remove("show");
        }
    });
}


//  FORM SUBMISSION HANDLER


async function handleEnrollmentSubmit(elements) {
    console.log("🚀 Starting enrollment submission...");

    const courseId = getCourseId();
    console.log("📌 Course ID:", courseId);

    const formData = {
        course_id: courseId,
        current_level: elements.defaultLevel?.textContent.toLowerCase() || 'beginner',
        available_days: elements.defaultDays?.textContent || '',
        available_time: `${elements.startTime?.value || '17:00'} to ${elements.endTime?.value || '20:00'}`,
        student_message: elements.message?.value || ''
    };

    console.log("📋 Form data:", formData);

    // Validation
    if (formData.student_message.length < 50) {
        showResult(elements.resultDiv, "error", "Message must be at least 50 characters long");
        return;
    }

    // Disable button and show loading
    elements.submitBtn.disabled = true;
    const originalHtml = elements.submitBtn.innerHTML;
    const originalBgColor = elements.submitBtn.style.backgroundColor;
    const originalColor = elements.submitBtn.style.color;

    elements.submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Sending...
    `;

    try {
        // API submission 
        const apiFormData = new FormData();
        apiFormData.append('course_id', formData.course_id);
        apiFormData.append('student_message', formData.student_message);

        const response = await fetch('/api/submit_enrollment_request.php', {
            method: 'POST',
            body: apiFormData,
            credentials: 'include'
        });

        const data = await response.json();
        console.log("📥 API Response:", data);

        if (data.success) {
            showResult(elements.resultDiv, "success", 
                `✓ ${data.message}<br>
                 <strong>Request ID: #${data.request_id || 'N/A'}</strong><br>
                 <small style="color: #666; font-size: 14px;">This window will close in 5 seconds...</small>`);

            elements.submitBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
                Request Sent!
            `;
            elements.submitBtn.style.backgroundColor = "#28a745";
            elements.submitBtn.style.color = "white";
            elements.submitBtn.style.cursor = "default";

            setTimeout(() => {
                elements.form.reset();
                if (elements.defaultLevel) elements.defaultLevel.textContent = "Select level";
                if (elements.defaultDays) elements.defaultDays.textContent = "Select available days";
                document.querySelectorAll('.Day:checked').forEach(cb => cb.checked = false);
            }, 3000);

            setTimeout(() => {
                notifyParentToClose();
            }, 5000);

        } else {
            showResult(elements.resultDiv, "error", 
                `✗ ${data.message}<br>
                 <small style="color: #666; font-size: 14px;">Please check your information and try again.</small>`);
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerHTML = originalHtml;
            elements.submitBtn.style.backgroundColor = originalBgColor;
            elements.submitBtn.style.color = originalColor;
        }

    } catch (error) {
        console.error("❌ Submission error:", error);
        showResult(elements.resultDiv, "error", 
            `Network error: ${error.message}<br>
             <small style="color: #666; font-size: 14px;">Please check your internet connection.</small>`);
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = originalHtml;
        elements.submitBtn.style.backgroundColor = originalBgColor;
        elements.submitBtn.style.color = originalColor;
    }
}

// HELPER FUNCTIONS

function getCourseId() {
    let courseId = null;
    const urlParams = new URLSearchParams(window.location.search);
    courseId = urlParams.get('course_id');
    if (courseId) return courseId;

    try {
        if (window.parent && window.parent.localStorage) {
            courseId = window.parent.localStorage.getItem('current_course_id');
            if (courseId) return courseId;
        }
    } catch (e) {
        console.log("Cannot access parent localStorage (cross-origin restriction)");
    }

    return 2; 
}

function showResult(element, type, message) {
    if (!element) return;

    const icon = type === 'success' ? '✓' : '✗';
    const title = type === 'success' ? 'Success!' : 'Error';
    const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
    const textColor = type === 'success' ? '#155724' : '#721c24';
    const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';

    element.innerHTML = `
        <div class="result-message ${type}" 
             style="padding: 20px; margin: 15px 0; border-radius: 10px; background: ${bgColor}; color: ${textColor}; border: 2px solid ${borderColor};
                    font-size: 16px; line-height: 1.6; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: ${type === 'success' ? 'fadeIn 0.5s ease' : 'shake 0.5s ease'}">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">
                ${icon} ${title}
            </div>
            <div>${message}</div>
        </div>
    `;
    element.style.display = 'block';

    if (type === 'error') {
        setTimeout(() => {
            element.style.display = 'none';
            element.innerHTML = '';
        }, 8000);
    }
}

function notifyParentToClose() {
    try {
        if (window.parent) {
            window.parent.postMessage({
                type: 'close_enrollment_modal',
                action: 'close',
                timestamp: new Date().toISOString()
            }, '*');
        }
    } catch (error) {
        console.log("Could not notify parent:", error);
    }
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'set_course_id') {
        console.log("Received course ID from parent:", event.data.course_id);
    }
});


//ADD CSS ANIMATIONS 


const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    #submissionResult {
        min-height: 80px;
        margin: 20px 0;
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

console.log("✅ Enrollment script initialized successfully");
