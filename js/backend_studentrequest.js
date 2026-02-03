// backend_studentrequest.js - FIXED FOR IFRAME
console.log("=== Enrollment Script Loading ===");

// Wait for everything to load
document.addEventListener("DOMContentLoaded", function() {
    console.log("Main document loaded");
    
    // Wait a bit for iframe to be added to DOM
    setTimeout(initializeEnrollmentSystem, 1000);
});

function initializeEnrollmentSystem() {
    console.log("Initializing enrollment system...");
    
    // Find the iframe (it's in the main courseinfo.html page)
    const iframe = document.querySelector('iframe[src*="studentRequest.html"]');
    
    if (!iframe) {
        console.error("❌ Student request iframe not found!");
        console.log("Available iframes:", document.querySelectorAll('iframe').length);
        return;
    }
    
    console.log("✅ Iframe found, waiting for it to load...");
    
    // If iframe already loaded
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        console.log("Iframe already loaded, setting up form...");
        setupFormInIframe(iframe);
    } else {
        // Wait for iframe to load
        iframe.addEventListener('load', function() {
            console.log("✅ Iframe loaded, setting up form...");
            setupFormInIframe(iframe);
        });
    }
}

function setupFormInIframe(iframe) {
    try {
        // Access iframe document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        console.log("🔍 Looking for form elements in iframe...");
        
        // Find all elements IN THE IFRAME
        const elements = {
            submitBtn: iframeDoc.getElementById("SubmitButton"),
            form: iframeDoc.querySelector("form"),
            message: iframeDoc.getElementById("message"),
            startTime: iframeDoc.getElementById("startTime"),
            endTime: iframeDoc.getElementById("endTime"),
            defaultLevel: iframeDoc.getElementById("default"),
            defaultDays: iframeDoc.getElementById("DEFAULT"),
            resultDiv: iframeDoc.getElementById("submissionResult"),
            levelSelect: iframeDoc.getElementById("selected"),
            levelList: iframeDoc.getElementById("level-list"),
            daysSelect: iframeDoc.getElementById("selected-day"),
            daysList: iframeDoc.getElementById("days-list")
        };
        
        // Log what we found
        Object.entries(elements).forEach(([name, element]) => {
            console.log(`${name}:`, element ? "✅ FOUND" : "❌ NOT FOUND");
        });
        
        // Check essential elements
        if (!elements.submitBtn || !elements.form) {
            console.error("❌ Essential form elements missing!");
            return;
        }
        
        console.log("✅ All form elements found, setting up event listeners...");
        
        // Setup dropdown functionality
        setupDropdowns(iframeDoc, elements);
        
        // Handle form submission
        elements.form.addEventListener("submit", async function(event) {
            event.preventDefault();
            console.log("📝 Form submission intercepted");
            await handleEnrollmentSubmit(iframeDoc, elements);
        });
        
        console.log("🎉 Enrollment form setup complete!");
        
    } catch (error) {
        console.error("❌ Error accessing iframe:", error);
    }
}

function setupDropdowns(iframeDoc, elements) {
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
        
        // Handle checkbox changes
        iframeDoc.querySelectorAll('.Day').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const selectedDays = Array.from(iframeDoc.querySelectorAll('.Day:checked'))
                    .map(cb => cb.value);
                
                if (selectedDays.length > 0) {
                    elements.defaultDays.textContent = selectedDays.join(', ');
                } else {
                    elements.defaultDays.textContent = "Select available days";
                }
                console.log("Days selected:", selectedDays);
            });
        });
    }
    
    // Close dropdowns when clicking outside
    iframeDoc.addEventListener('click', (e) => {
        if (elements.levelList && !elements.levelSelect.contains(e.target) && !elements.levelList.contains(e.target)) {
            elements.levelList.classList.remove("show");
        }
        if (elements.daysList && !elements.daysSelect.contains(e.target) && !elements.daysList.contains(e.target)) {
            elements.daysList.classList.remove("show");
        }
    });
}

async function handleEnrollmentSubmit(iframeDoc, elements) {
    console.log("🚀 Starting enrollment submission...");
    
    // Get course ID from localStorage (set by courseinfo.js)
    const courseId = localStorage.getItem('current_course_id') || 2;
    console.log("Course ID:", courseId);
    
    // Get form values
    const formData = {
        course_id: courseId,
        current_level: elements.defaultLevel?.textContent.toLowerCase() || 'beginner',
        available_days: elements.defaultDays?.textContent || '',
        available_time: `${elements.startTime?.value || '17:00'} to ${elements.endTime?.value || '20:00'}`,
        student_message: elements.message?.value || ''
    };
    
    console.log("Form data:", formData);
    
    // Validation
    if (formData.available_days === "Select available days" || !formData.available_days.trim()) {
        showResult(elements.resultDiv, "error", "Please select at least one available day");
        return;
    }
    
    if (formData.student_message.length < 50) {
        showResult(elements.resultDiv, "error", "Message must be at least 50 characters long");
        return;
    }
    
    // Disable button and show loading
    elements.submitBtn.disabled = true;
    const originalHtml = elements.submitBtn.innerHTML;
    elements.submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Sending...
    `;
    
    try {
        // Prepare form data for API
        const apiFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            apiFormData.append(key, value);
        });
        
        console.log("📤 Sending to API...");
        
        // Call enrollment API
        const response = await fetch('/api/submit_enrollment_request.php', {
            method: 'POST',
            body: apiFormData,
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log("📥 API Response:", data);
        
        if (data.success) {
            showResult(elements.resultDiv, "success", 
                `✓ ${data.message}<br>Request ID: #${data.request_id || 'N/A'}`);
            
            // Success actions
            setTimeout(() => {
                // Reset form
                iframeDoc.querySelector('form').reset();
                if (elements.defaultLevel) elements.defaultLevel.textContent = "Select level";
                if (elements.defaultDays) elements.defaultDays.textContent = "Select available days";
                
                // Uncheck all day checkboxes
                iframeDoc.querySelectorAll('.Day:checked').forEach(cb => cb.checked = false);
                
                // Close modal after 3 seconds
                if (window.parent && window.parent.closePop) {
                    setTimeout(() => {
                        window.parent.closePop();
                        console.log("✅ Modal closed");
                    }, 3000);
                }
            }, 1000);
            
        } else {
            showResult(elements.resultDiv, "error", `✗ ${data.message}`);
        }
        
    } catch (error) {
        console.error("❌ Submission error:", error);
        showResult(elements.resultDiv, "error", `Network error: ${error.message}`);
    } finally {
        // Restore button
        elements.submitBtn.disabled = false;
        elements.submitBtn.innerHTML = originalHtml;
        console.log("🔄 Button restored");
    }
}

function showResult(element, type, message) {
    if (!element) {
        console.warn("Result element not found");
        return;
    }
    
    element.innerHTML = `
        <div class="${type}-message">
            ${message}
        </div>
    `;
    element.style.display = 'block';
    
    console.log(`📝 ${type.toUpperCase()} message:`, message);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (element) {
            element.style.display = 'none';
            element.innerHTML = '';
        }
    }, 5000);
}

// Fallback: If script loaded in iframe directly
if (window.location.pathname.includes('studentRequest.html')) {
    console.log("📄 Script loaded directly in iframe");
    document.addEventListener('DOMContentLoaded', function() {
        // This runs if the JS is loaded inside the iframe
        console.log("Setting up form inside iframe directly");
        setupDirectForm();
    });
}

function setupDirectForm() {
    // Direct form setup (if loaded in iframe)
    const submitBtn = document.getElementById("SubmitButton");
    const form = document.querySelector("form");
    
    if (submitBtn && form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            alert("Form would submit here. Course ID needed from parent window.");
        });
        console.log("✅ Direct form setup complete");
    }
}