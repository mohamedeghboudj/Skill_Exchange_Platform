// File: /assets/js/requestReview.js

class RequestReview {
    constructor() {
        this.requestData = null;

        this.acceptBtn = document.getElementById('ACCEPT');
        this.declineBtn = document.getElementById('REFUS');

        this.levelInput = document.getElementById('level');
        this.daysInput = document.getElementById('days');
        this.timeInput = document.getElementById('time');
        this.messageTextarea = document.getElementById('message');
        this.titleElement = document.querySelector('.title h3');

        this.init();
    }

    init() {
        this.loadRequestData();
        this.setupButtons();
    }

    // ================= LOAD REQUEST =================
    loadRequestData() {
        try {
            const urlParam = new URLSearchParams(window.location.search).get('request');
            this.requestData = urlParam ? JSON.parse(decodeURIComponent(urlParam)) : null;
        } catch (e) {
            console.error('Invalid request data:', e);
            this.requestData = null;
        }

        // If inside iframe
        if (!this.requestData && window.parent !== window) {
            window.addEventListener('message', (e) => {
                if (e.data?.type === 'LOAD_REQUEST') {
                    this.requestData = e.data.request;
                    this.populateData();
                }
            });

            window.parent.postMessage({ type: 'REQUEST_REVIEW_READY' }, '*');
        }

        this.populateData();
    }

    // ================= POPULATE UI =================
    populateData() {
        if (!this.requestData) return;

        const student = this.requestData.student_name || 'Student';

        if (this.titleElement)
            this.titleElement.textContent = `Request from ${student}`;

        if (this.levelInput)
            this.levelInput.value = this.requestData.level || 'Beginner';

        if (this.daysInput)
            this.daysInput.value = this.requestData.days_available || 'Not specified';

        if (this.timeInput)
            this.timeInput.value = this.requestData.time_available || 'Not specified';

        if (this.messageTextarea)
            this.messageTextarea.value = this.requestData.message || 'No message';

        this.updateButtons();
    }

    // ================= BUTTONS =================
    setupButtons() {
        if (this.acceptBtn)
            this.acceptBtn.addEventListener('click', () => this.handleDecision('accept'));

        if (this.declineBtn)
            this.declineBtn.addEventListener('click', () => this.handleDecision('decline'));
    }

    updateButtons() {
        const status = this.requestData?.request_status;

        if (status && status !== 'pending') {
            if (this.acceptBtn) {
                this.acceptBtn.style.display = 'none';
                this.acceptBtn.disabled = true;
            }
            if (this.declineBtn) {
                this.declineBtn.style.display = 'none';
                this.declineBtn.disabled = true;
            }
            this.showStatus(status);
        } else {
            if (this.acceptBtn) {
                this.acceptBtn.style.display = '';
                this.acceptBtn.disabled = false;
            }
            if (this.declineBtn) {
                this.declineBtn.style.display = '';
                this.declineBtn.disabled = false;
            }
        }
    }

    // ================= DECISION =================
    async handleDecision(decision) {
        if (!this.requestData) {
            return this.showNotification('No request loaded', 'error');
        }

        if (!confirm(`Are you sure you want to ${decision} this request?`)) return;

        this.acceptBtn.disabled = true;
        this.declineBtn.disabled = true;

        try {
            const response = await fetch('/api/process_teacher_decision.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    request_id: this.requestData.request_id,
                    decision: decision
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Server error');
            }

            // ✅ IMPORTANT: update correct field
            this.requestData.request_status = result.status;

            this.showNotification(`Request ${decision} successfully`, 'success');
            this.updateButtons();

            // Notify parent to refresh list
            window.parent.postMessage({
                type: 'request_processed',
                request_id: this.requestData.request_id,
                status: result.status
            }, '*');

        } catch (error) {
            console.error('Decision error:', error);
            this.showNotification(error.message, 'error');

            this.acceptBtn.disabled = false;
            this.declineBtn.disabled = false;
        }
    }

    // ================= STATUS MESSAGE =================
    showStatus(status) {
        const container = document.querySelector('.information') || document.body;

        let text = '';
        if (status === 'accepted') text = '✓ You accepted this request';
        if (status === 'declined') text = '✗ You declined this request';

        const old = container.querySelector('.status-message');
        if (old) old.remove();

        const div = document.createElement('div');
        div.className = 'status-message';
        div.textContent = text;

        div.style.cssText = `
            margin-top: 15px;
            padding: 10px;
            font-weight: 600;
            color: ${status === 'accepted' ? '#28a745' : '#dc3545'};
        `;

        container.appendChild(div);
    }

    // ================= NOTIFICATION =================
    showNotification(message, type = 'info') {
        const n = document.createElement('div');
        n.textContent = message;

        n.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            color: white;
            border-radius: 5px;
            z-index: 9999;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;

        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.requestReview = new RequestReview();
});
