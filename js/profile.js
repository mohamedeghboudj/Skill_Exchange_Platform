
document.addEventListener('DOMContentLoaded', function () {
    console.log('Profile page loaded, fetching user data...');

    fetch('api/get_profile.php', {
        credentials: "include"
    })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            console.log('User data received:', user);

            // Get DOM elements
            let NameValue = document.querySelector('#FullnameV'),
                ageValue = document.querySelector('#AgeV'),
                emailValue = document.querySelector('#emailV'),
                skillValue = document.querySelector('#skillV'),
                bioValue = document.querySelector('#bioV'),
                teacherModeElement = document.querySelector('.teacher-mode'),
                profileImage = document.querySelector('.profile-pic');

            // Certificate elements
            const certificatesAlign = document.querySelector('.certificates-align');
            const certificateSection = document.querySelector('.certificate-section');
            const certificateNote = document.querySelector('.note');

            // Populate fields
            NameValue.value = user.full_name || '';
            ageValue.value = user.age || '';
            emailValue.value = user.email || '';
            skillValue.value = user.skill || '';
            bioValue.value = user.bio || '';

            // Profile picture
            profileImage.src = user.profile_picture
                ? user.profile_picture
                : 'images1/profilePicture1.jpg';

            // Show/hide certificates section based on teacher status
            if (user.is_teacher == 1) {
                // Show all certificate elements
                if (certificatesAlign) certificatesAlign.style.display = 'block';
                if (certificateSection) certificateSection.style.display = 'block';
                if (certificateNote) certificateNote.style.display = 'block';

                // Show teacher mode badge
                if (teacherModeElement) {
                    teacherModeElement.style.display = 'block';
                }

                // Load certificates only if teacher
                loadUserCertificates();
            } else {
                // Hide all certificate elements
                if (certificatesAlign) certificatesAlign.style.display = 'none';
                if (certificateSection) certificateSection.style.display = 'none';
                if (certificateNote) certificateNote.style.display = 'none';

                // Hide teacher mode badge
                if (teacherModeElement) {
                    teacherModeElement.style.display = 'none';
                }
            }

            console.log('Profile loaded successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


// Certificate Upload and Management
const certificateInput = document.getElementById('Certificate');
const certificatesContainer = document.getElementById('certificates-container');
let currentCertificateToRemove = null;

if (certificateInput && certificatesContainer) {
    certificateInput.addEventListener('change', async function (e) {
        if (e.target.files.length > 0) {
            // Create FormData to send files
            const formData = new FormData();

            // Add all selected files
            for (let i = 0; i < e.target.files.length; i++) {
                formData.append('certificates[]', e.target.files[i]);
            }

            try {
                // Show loading state (optional)
                console.log('Uploading certificates...');

                // Upload to backend
                const response = await fetch('api/set_certificate.php', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    console.log('Upload successful:', result.message);

                    // Add each uploaded certificate to the UI
                    result.certificates.forEach(cert => {
                        addCertificateToUI(cert);
                    });

                    // Clear the file input
                    certificateInput.value = '';
                } else {
                    console.error('Upload failed:', result.error);
                    alert('Failed to upload certificates: ' + result.error);
                }

            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload certificates. Please try again.');
            }
        }
    });
}

// Helper function to add certificate to UI
function addCertificateToUI(cert) {
    const certificateDiv = document.createElement('div');
    certificateDiv.className = 'certificate-object';
    certificateDiv.dataset.certificateId = cert.certificate_id;
    certificateDiv.dataset.fileName = cert.file_name;
    certificateDiv.dataset.fileUrl = cert.file_url;
    certificateDiv.dataset.fileType = cert.file_type;

    certificateDiv.innerHTML = `
        <div class="certificate-content clickable">
            <i class="spreadsheet" data-lucide="file-spreadsheet"></i>
            <p>${cert.file_name}</p>
        </div>
        <button class="Remove">Remove</button>
    `;

    certificatesContainer.appendChild(certificateDiv);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 0);
}

// Handle Remove button clicks
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('Remove')) {
        e.preventDefault();
        e.stopPropagation();

        const certificateObject = e.target.closest('.certificate-object');
        if (certificateObject) {
            currentCertificateToRemove = certificateObject;
            const certificateId = certificateObject.dataset.certificateId;
            const certificateName = certificateObject.querySelector('p').textContent;

            const mydialog = document.getElementById("popup");
            const iframe = mydialog ? mydialog.querySelector('iframe') : null;

            if (mydialog) {
                mydialog.showModal();
            }

            // Send certificate info to iframe after it loads
            if (iframe) {
                const sendData = () => {
                    console.log('Sending certificate data to iframe:', certificateName);
                    iframe.contentWindow.postMessage({
                        type: 'setCertificateName',
                        certificateId: certificateId,
                        certificateName: certificateName
                    }, '*');
                };

                // If iframe is already loaded
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                    setTimeout(sendData, 100);
                } else {
                    // Wait for iframe to load
                    iframe.onload = () => {
                        setTimeout(sendData, 100);
                    };
                }
            }
        }
    }
});

// Handle certificate click to view
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('Remove') || e.target.closest('.Remove')) {
        return;
    }

    const clickableElement = e.target.closest('.clickable');
    if (clickableElement) {
        e.preventDefault();
        e.stopPropagation();

        const certObject = clickableElement.closest('.certificate-object');
        if (certObject) {
            const fileName = certObject.dataset.fileName;
            const fileUrl = certObject.dataset.fileUrl;
            const fileType = certObject.dataset.fileType || '';

            showCertificateModal(fileName, fileUrl, fileType);
        }
    }
});

// Show certificate in modal
function showCertificateModal(fileName, fileUrl, fileType) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'certificate-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    let content = '';
    if (fileType.includes('image')) {
        content = `<img src="${fileUrl}" style="max-width: 100%; max-height: 80vh;" alt="${fileName}">`;
    } else if (fileType.includes('pdf')) {
        content = `<iframe src="${fileUrl}" style="width: 80vw; height: 80vh; border: none;"></iframe>`;
    } else {
        content = `
            <div style="text-align: center; color: white;">
                <p>${fileName}</p>
                <p>Preview not available</p>
                <a href="${fileUrl}" download="${fileName}" style="color: #4CAF50;">Download</a>
            </div>
        `;
    }

    modalOverlay.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow: auto;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <h3>${fileName}</h3>
                <button class="close-certificate-modal" style="background: #f44336; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">×</button>
            </div>
            ${content}
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
        document.body.removeChild(modalOverlay);
        if (fileUrl && fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fileUrl);
        }
    };

    modalOverlay.querySelector('.close-certificate-modal').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// Handle certificate deletion confirmation
window.addEventListener('message', async function (event) {
    if ((event.data === 'confirmRemove' || event.data === 'hideCertificate') && currentCertificateToRemove) {
        const certificateId = currentCertificateToRemove.dataset.certificateId;

        // Close modal immediately
        const mydialog = document.getElementById("popup");
        if (mydialog) mydialog.close();

        if (certificateId) {
            try {
                const response = await fetch('api/delete_certificate.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ certificate_id: parseInt(certificateId) })
                });

                let result = { success: false };

                // Only attempt JSON parse if response is 200
                if (response.ok) {
                    try {
                        result = await response.json();
                    } catch (e) {
                        console.warn("Invalid JSON response from delete_certificate.php");
                    }
                } else {
                    console.warn("Delete request returned status:", response.status);
                }

                // Remove certificate from UI anyway
                currentCertificateToRemove.remove();
                console.log('Certificate removed from UI');

                // Only alert if backend explicitly fails
                if (!result.success && result.error) {
                    console.warn('Backend error:', result.error);
                }

            } catch (error) {
                console.error('Delete request failed:', error);
                // Still remove from UI
                currentCertificateToRemove.remove();
            }
        } else {
            // Blob preview only
            const fileUrl = currentCertificateToRemove.dataset.fileUrl;
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
            currentCertificateToRemove.remove();
        }

        // Cleanup
        currentCertificateToRemove = null;
    }

    if (event.data === 'cancelRemove') {
        const mydialog = document.getElementById("popup");
        if (mydialog) mydialog.close();
        currentCertificateToRemove = null;
    }
});

// Close popup function
window.closePop = function () {
    const mydialog = document.getElementById("popup");
    if (mydialog) mydialog.close();
    currentCertificateToRemove = null;
};

// Close dialog on outside click
const mydialog = document.getElementById("popup");
if (mydialog) {
    mydialog.addEventListener('click', (e) => {
        if (e.target === mydialog) {
            mydialog.close();
            currentCertificateToRemove = null;
        }
    });
}

// Privacy Terms Dialog
const showTermsBtn = document.querySelector("#vpt");
const privacyDialog = document.getElementById("popup1");

if (showTermsBtn && privacyDialog) {
    showTermsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        privacyDialog.showModal();
    });

    privacyDialog.addEventListener('click', (e) => {
        if (e.target === privacyDialog) {
            e.preventDefault();
            privacyDialog.close();
        }
    });
}

const closeBtn = document.querySelector(".close");
if (closeBtn && privacyDialog) {
    closeBtn.addEventListener("click", () => {
        privacyDialog.close();
    });
}

// Teach Navigation
const teachNav = document.querySelector(".teachnav");
if (teachNav) {
    teachNav.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "pages/teacherrequest.html";
    });
}

// Load user certificates from backend
async function loadUserCertificates() {
    try {
        const response = await fetch('assets/php/get_certificate.php', { credentials: 'include' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Check if there's an error in the response
        if (result.error) {
            console.log('No certificates or error:', result.error);
            return;
        }

        const certificates = result.certificates || [];
        const certificatesContainer = document.getElementById('certificates-container');

        if (!certificatesContainer) {
            console.error('Certificates container not found');
            return;
        }

        // Clear existing certificates
        certificatesContainer.innerHTML = '';

        if (certificates.length === 0) {
            console.log('No certificates found for this teacher');
            return;
        }

        // Use the helper function to add each certificate
        certificates.forEach(cert => {
            addCertificateToUI(cert);
        });

        console.log(`${certificates.length} certificate(s) loaded from backend!`);
    } catch (error) {
        console.error("Error loading certificates:", error);
    }
}