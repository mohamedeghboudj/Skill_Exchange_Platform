// backend_studentrequest.js - FINAL VERSION (IFRAME ONLY)
// ONLY sends: course_id and student_message (as per PHP API requirements)
console.log("=== Enrollment Script Loading ===");
console.log("📍 Running in:", window.location.pathname);

// ============================================================
// 1. EXIT IF NOT IN IFRAME
// ============================================================
if (window === window.parent) {
    console.log("⚠️ Script loaded in parent window - exiting (should only run in iframe)");
    return;
}

console.log("✅ Running inside iframe");

// ============================================================
// 2. MAIN INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 Iframe DOM loaded");
    setTimeout(() => {
        initializeEnrollmentForm();
    }, 300);
});

// ============================================================
// 3. FORM SETUP - MINIMAL
// ============================================================
function initializeEnrollmentForm() {
    console.log("🔧 Initializing enrollment form...");

    const elements = {
        submitBtn: document.getElementById("SubmitButton"),
        form: document.querySelector("form"),
        message: document.getElementById("message"), // ONLY field we need
        resultDiv: document.getElementById("submissionResult")
    };

    // Log what we found
    console.log("🔍 Form elements check:");
    console.log(`  submitBtn:`, elements.submitBtn ? "✅ FOUND" : "❌ MISSING");
    console.log(`  form:`, elements.form ? "✅ FOUND" : "❌ MISSING");
    console.log(`  message:`, elements.message ? "✅ FOUND" : "❌ MISSING");
    console.log(`  resultDiv:`, elements.resultDiv ? "✅ FOUND" : "❌ MISSING");

    if (!elements.submitBtn || !elements.form || !elements.message) {
        console.error("❌ Essential form elements missing!");
        return;
    }

    elements.form.addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("📝 Form submission intercepted");
        await handleEnrollmentSubmit(elements);
    });

    console.log("🎉 Enrollment form setup complete!");
}

// ============================================================
// 4. FORM SUBMISSION - ONLY WHAT PHP EXPECTS
// ============================================================
async function handleEnrollmentSubmit(elements) {
    console.log("🚀 Starting enrollment submission...");

    const courseId = getCourseId();
    console.log("📌 Course ID:", courseId);

    // ONLY get the message (the only field PHP uses from form)
    const studentMessage = elements.message.value.trim();
    console.log("📝 Student message length:", studentMessage.length);

    // Validation (matches PHP validation)
    if (studentMessage.length < 50) {
        showResult(elements.resultDiv, "error", "Message must be at least 50 characters long");
        return;
    }

    // Disable button and show loading
    elements.submitBtn.disabled = true;
    const originalText = elements.submitBtn.textContent;

    elements.submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Sending...
    `;

    try {
        // Create FormData with EXACTLY the 2 fields PHP expects
        const apiFormData = new FormData();
        apiFormData.append('course_id', courseId);          // Field 1: course_id (int)
        apiFormData.append('student_message', studentMessage); // Field 2: student_message (string)

        console.log("📤 Sending to API:", {
            course_id: courseId,
            student_message_length: studentMessage.length
        });

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

            // Clear only the message field (the only one we use)
            elements.message.value = '';

            setTimeout(() => {
                notifyParentToClose();
            }, 5000);

        } else {
            showResult(elements.resultDiv, "error", 
                `✗ ${data.message}<br>
                 <small style="color: #666; font-size: 14px;">Please try again.</small>`);
            elements.submitBtn.disabled = false;
            elements.submitBtn.textContent = originalText;
        }

    } catch (error) {
        console.error("❌ Submission error:", error);
        showResult(elements.resultDiv, "error", 
            `Network error: ${error.message}<br>
             <small style="color: #666; font-size: 14px;">Please check your connection.</small>`);
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = originalText;
    }
}

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================
function getCourseId() {
    // Try URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('course_id');
    
    if (courseIdFromUrl) {
        return parseInt(courseIdFromUrl);
    }

    // Default fallback
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
        <div class="result-message" 
             style="padding: 20px; margin: 15px 0; border-radius: 10px; 
                    background: ${bgColor}; color: ${textColor}; 
                    border: 2px solid ${borderColor};
                    font-size: 16px; line-height: 1.6;">
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
        }, 5000);
    }
}

function notifyParentToClose() {
    try {
        if (window.parent) {
            window.parent.postMessage({
                type: 'close_enrollment_modal',
                action: 'close'
            }, '*');
        }
    } catch (error) {
        console.log("Could not notify parent:", error);
    }
}

console.log("✅ Enrollment script initialized successfully");