document.addEventListener('DOMContentLoaded', function() {
    // Get certificate name from localStorage
    const certificateName = localStorage.getItem('currentCertificateName') || 'Professional certificate';
    
    // Update the certificate name in the HTML
    const certificateNameElement = document.querySelector('.selected-certificate p');
    if (certificateNameElement) {
        certificateNameElement.textContent = certificateName;
    }
    
    // Get buttons
    let removeBtn = document.getElementById("rv"); // Matches your HTML id="rv"
    let cancelBtn = document.getElementById("cancel");

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Remove button clicked in iframe");
            
            // Send CONFIRM message to parent
            window.parent.postMessage('confirmRemove', '*');
            // Also send the old message for compatibility
            window.parent.postMessage('hideCertificate', '*');
            
            // Clear the stored certificate name
            localStorage.removeItem('currentCertificateName');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Cancel button clicked in iframe");
            
            // Send CANCEL message to parent
            window.parent.postMessage('cancelRemove', '*');
            // Also call the global close function
            window.parent.closePop();
            
            // Clear the stored certificate name
            localStorage.removeItem('currentCertificateName');
        });
    }
});