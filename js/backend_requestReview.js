// File: /assets/js/requestReview.js - FINAL VERSION
class RequestReview {
    constructor() {
        this.requestData = null;
        
        // Using YOUR exact button classes and IDs
        this.acceptBtn = document.getElementById('ACCEPT') || document.querySelector('.accept');
        this.declineBtn = document.getElementById('REFUS') || document.querySelector('.refus');
        
        // Form fields from YOUR HTML
        this.levelInput = document.getElementById('level');
        this.daysInput = document.getElementById('days');
        this.timeInput = document.getElementById('time');
        this.messageTextarea = document.getElementById('message');
        this.titleElement = document.querySelector('.title h3');
        
        console.log('RequestReview initialized. Buttons found:', {
            accept: !!this.acceptBtn,
            decline: !!this.declineBtn
        });
        
        this.init();
    }

    init() {
        this.loadRequestData();
        this.setupEventListeners();
        this.notifyParentLoaded();
    }

    loadRequestData() {
        console.log('Loading request data...');
        
        // Method 1: From URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const requestParam = urlParams.get('request');
        
        if (requestParam) {
            try {
                this.requestData = JSON.parse(decodeURIComponent(requestParam));
                console.log('✅ Loaded request from URL:', this.requestData);
                this.populateRequestData();
                return;
            } catch (e) {
                console.error('❌ Error parsing URL request data:', e);
            }
        }
        
        // Method 2: From parent window message
        if (window.parent && window !== window.parent) {
            console.log('📨 Listening for message from parent...');
            
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'LOAD_REQUEST') {
                    console.log('✅ Received request from parent:', event.data);
                    this.requestData = event.data.request;
                    this.populateRequestData();
                }
            });
            
            // Request data from parent
            setTimeout(() => {
                if (!this.requestData) {
                    window.parent.postMessage({ 
                        type: 'REQUEST_REVIEW_READY' 
                    }, '*');
                }
            }, 500);
        } else {
            this.showError('No request data available');
        }
    }

    populateRequestData() {
        if (!this.requestData) {
            console.error('No request data to populate');
            return;
        }
        
        console.log('Populating form with request data:', this.requestData);
        
        // 1. Update title
        if (this.titleElement) {
            const studentName = this.requestData.student_name || 'Student';
            this.titleElement.textContent = `Student Request from ${studentName}`;
        }
        
        // 2. Fill form fields
        // Note: Your HTML expects specific fields. We'll map database fields to them
        if (this.levelInput) {
            this.levelInput.value = this.extractLevel(this.requestData);
        }
        
        if (this.daysInput) {
            this.daysInput.value = this.extractDays(this.requestData);
        }
        
        if (this.timeInput) {
            this.timeInput.value = this.extractTime(this.requestData);
        }
        
        if (this.messageTextarea) {
            this.messageTextarea.value = this.requestData.student_message || 
                                         this.requestData.message || 
                                         'No message provided';
        }
        
        // 3. Check and update button states based on status
        this.updateButtonStates();
        
        // 4. Notify parent that data is loaded
        this.notifyParentDataLoaded();
    }

    extractLevel(request) {
        // Try different possible fields for level
        return request.current_level || 
               request.level || 
               request.student_level ||
               'Beginner';
    }

    extractDays(request) {
        // Try different possible fields for days
        return request.available_days ||
               request.days_available ||
               request.student_availability ||
               'Monday - Friday';
    }

    extractTime(request) {
        // Try different possible fields for time
        return request.available_time ||
               request.time_available ||
               request.preferred_time ||
               '9:00 AM - 5:00 PM';
    }

    updateButtonStates() {
        if (!this.requestData) return;
        
        const status = this.requestData.request_status || this.requestData.status;
        console.log('Current request status:', status);
        
        if (status !== 'pending') {
            // Request already processed - disable buttons
            if (this.acceptBtn) {
                this.acceptBtn.disabled = true;
                this.acceptBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    ${this.formatStatus(status)}
                `;
                this.acceptBtn.style.opacity = '0.6';
            }
            
            if (this.declineBtn) {
                this.declineBtn.disabled = true;
                this.declineBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                    ${this.formatStatus(status)}
                `;
                this.declineBtn.style.opacity = '0.6';
            }
            
            // Show status message
            this.showStatusMessage(status);
        } else {
            // Enable buttons for pending requests
            if (this.acceptBtn) {
                this.acceptBtn.disabled = false;
                this.acceptBtn.style.opacity = '1';
            }
            if (this.declineBtn) {
                this.declineBtn.disabled = false;
                this.declineBtn.style.opacity = '1';
            }
        }
    }

    setupEventListeners() {
        // Accept button
        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Accept button clicked');
                this.handleDecision('accept');
            });
        } else {
            console.error('Accept button not found!');
        }
        
        // Decline button
        if (this.declineBtn) {
            this.declineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Decline button clicked');
                this.handleDecision('decline');
            });
        } else {
            console.error('Decline button not found!');
        }
    }

    handleDecision(decision) {
        if (!this.requestData) {
            this.showNotification('No request data available', 'error');
            return;
        }
        
        const studentName = this.requestData.student_name || 'the student';
        const courseTitle = this.requestData.course_title || 'the course';
        
        const confirmMessage = decision === 'accept' 
            ? `Accept request from ${studentName} for "${courseTitle}"?`
            : `Decline request from ${studentName}?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Prepare teacher message from form data
        const teacherMessage = this.prepareTeacherMessage();
        
        // Disable buttons to prevent double-click
        this.disableButtons();
        
        // Send decision to server
        this.sendDecisionToServer(decision, teacherMessage);
    }

    prepareTeacherMessage() {
        const parts = [];
        
        if (this.levelInput && this.levelInput.value) {
            parts.push(`Level: ${this.levelInput.value}`);
        }
        if (this.daysInput && this.daysInput.value) {
            parts.push(`Days: ${this.daysInput.value}`);
        }
        if (this.timeInput && this.timeInput.value) {
            parts.push(`Time: ${this.timeInput.value}`);
        }
        
        return parts.join(', ');
    }

    disableButtons() {
        if (this.acceptBtn) {
            this.acceptBtn.disabled = true;
            this.acceptBtn.innerHTML = 'Processing...';
        }
        if (this.declineBtn) {
            this.declineBtn.disabled = true;
            this.declineBtn.innerHTML = 'Processing...';
        }
    }

    enableButtons() {
        if (this.acceptBtn) {
            this.acceptBtn.disabled = false;
            this.acceptBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>
                Accept Request
            `;
        }
        if (this.declineBtn) {
            this.declineBtn.disabled = false;
            this.declineBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                </svg>
                Decline Request
            `;
        }
    }

    async sendDecisionToServer(decision, teacherMessage) {
        try {
            console.log('Sending decision to server:', { decision, teacherMessage });
            
            const response = await fetch('/api/process_teacher_decision.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: this.requestData.request_id || this.requestData.id,
                    decision: decision,
                    teacher_message: teacherMessage
                })
            });
            
            const result = await response.json();
            console.log('Server response:', result);
            
            if (result.success) {
                // Update local data
                this.requestData.request_status = result.status;
                this.requestData.teacher_message = teacherMessage;
                this.requestData.teacher_decision_date = new Date().toISOString();
                
                // Update UI
                this.updateButtonStates();
                this.showStatusMessage(result.status);
                
                // Show success message
                this.showNotification(
                    `Request ${decision}ed successfully!`, 
                    'success'
                );
                
                // Notify parent window
                this.notifyParentDecisionMade(decision, result.status);
                
                // Auto-close after 2 seconds if in popup
                if (window.parent && window !== window.parent) {
                    setTimeout(() => {
                        this.closePopup();
                    }, 2000);
                }
                
            } else {
                throw new Error(result.error || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Error sending decision:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
            this.enableButtons(); // Re-enable buttons on error
        }
    }

    showStatusMessage(status) {
        // Remove existing status message
        const existingMsg = document.querySelector('.status-message');
        if (existingMsg) existingMsg.remove();
        
        // Create new status message
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        
        let message = '';
        let className = '';
        
        switch (status) {
            case 'accepted':
                message = '✓ You have accepted this request. Waiting for student payment.';
                className = 'accepted';
                break;
            case 'declined':
                message = '✗ You have declined this request.';
                className = 'declined';
                break;
            case 'completed':
                message = '✓ Student has completed payment.';
                className = 'completed';
                break;
            default:
                return;
        }
        
        statusDiv.innerHTML = `
            <div class="message ${className}">
                <p>${message}</p>
                ${this.requestData.teacher_message ? 
                  `<p class="teacher-note">Note: ${this.requestData.teacher_message}</p>` : ''}
            </div>
        `;
        
        // Add to page
        const container = document.querySelector('.information') || document.body;
        container.appendChild(statusDiv);
        
        // Add some basic styles if not already present
        if (!document.querySelector('#status-styles')) {
            const style = document.createElement('style');
            style.id = 'status-styles';
            style.textContent = `
                .status-message {
                    margin: 15px 0;
                    padding: 12px;
                    border-radius: 5px;
                    text-align: center;
                }
                .status-message .accepted {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .status-message .declined {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .status-message .completed {
                    background-color: #cce5ff;
                    color: #004085;
                    border: 1px solid #b8daff;
                }
                .teacher-note {
                    margin-top: 8px;
                    font-size: 14px;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        // Set color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else {
            notification.style.backgroundColor = '#17a2b8';
        }
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        console.error('RequestReview Error:', message);
        this.showNotification(`Error: ${message}`, 'error');
    }

    formatStatus(status) {
        if (!status) return 'Pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    notifyParentLoaded() {
        if (window.parent && window !== window.parent) {
            window.parent.postMessage({
                type: 'REQUEST_REVIEW_READY'
            }, '*');
        }
    }

    notifyParentDataLoaded() {
        if (window.parent && window !== window.parent) {
            window.parent.postMessage({
                type: 'REQUEST_DATA_LOADED',
                request_id: this.requestData?.request_id
            }, '*');
        }
    }

    notifyParentDecisionMade(decision, status) {
        if (window.parent && window !== window.parent) {
            window.parent.postMessage({
                type: 'TEACHER_DECISION_MADE',
                request_id: this.requestData.request_id,
                decision: decision,
                status: status
            }, '*');
        }
    }

    closePopup() {
        if (window.parent && window !== window.parent) {
            const popup = window.parent.document.getElementById('popup');
            if (popup) {
                popup.close();
            }
        } else if (window.opener) {
            window.close();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing RequestReview...');
    window.requestReview = new RequestReview();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        console.log('DOM already ready, initializing RequestReview...');
        window.requestReview = new RequestReview();
    }, 100);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequestReview;
}