document.addEventListener('DOMContentLoaded', function () {
    console.log('removeCertificate.js loaded');

    const certificateNameElement = document.getElementById('certificate-name-display');

    if (!certificateNameElement) {
        console.error('Element #certificate-name-display not found!');
        return;
    }

    // Listen for certificate data from parent window
    window.addEventListener('message', function (event) {
        console.log('Message received:', event.data);

        if (event.data.type === 'setCertificateName') {
            const certificateName = event.data.certificateName;
            console.log('Setting certificate name:', certificateName);

            if (certificateName && certificateNameElement) {
                certificateNameElement.textContent = certificateName;
                console.log('Certificate name updated to:', certificateName);

                // Recreate Lucide icons after updating text
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    });

    // Initial Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Get buttons
    let removeBtn = document.getElementById("rv");
    let cancelBtn = document.getElementById("cancel");

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Remove button clicked");

            // Send messages to parent
            window.parent.postMessage('confirmRemove', '*');
        });
    } else {
        console.error('Remove button not found!');
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Cancel button clicked");

            // Send cancel message to parent
            window.parent.postMessage('cancelRemove', '*');
        });
    } else {
        console.error('Cancel button not found!');
    }
});