/*document.addEventListener('DOMContentLoaded', function () {

    // // TODO: Get current user from authentication system (session, JWT, etc.)
    // const currentUserEmail = localStorage.getItem("currentUserEmail"); // Replace with your auth method


    // TODO: Fetch user data from backend
    async function getUserFromBackend() {
        try {
            // Example: GET /api/user/profile
            // const response = await fetch('/api/user/profile', {
            //     headers: {
            //         'Authorization': `Bearer ${token}` // Add auth token
            //     }
            // });
            // if (response.ok) {
            //     return await response.json();
            // }
            // return null;

            // Placeholder - remove when implementing backend
            return null;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }

    // Load user data
    //  getUserFromBackend().then(user => {
    // if (!user) {
    //    console.log("User not found - redirecting to login");
    //  window.location.href = "/auth.html"; ---------- why this ?!!!
    //   return;
    // }


    // Get DOM elements
    let NameValue = document.querySelector('#FullnameV'),
        ageValue = document.querySelector('#AgeV'),
        emailValue = document.querySelector('#emailV'),
        skillValue = document.querySelector('#skillV'),
        bioValue = document.querySelector('#bioV'),
        teacherModeElement = document.querySelector('.teacher-mode'),
        certificateSection = document.querySelector('.certificate-section');
    profileImage = document.querySelector('.profile-pic');

    // Set form values from backend data
    NameValue.value = user.name || '';
    ageValue.value = user.age || '';
    emailValue.value = user.email || '';
    skillValue.value = user.skill || '';
    bioValue.value = user.bio || '';
    profileImage.src = user.profilePicture || '';

    // TODO: Load user certificates from backend
    // loadUserCertificates(user.id);

    updateUIForUserRole(user.role);
}).catch(error => {
    console.error("Error loading user:", error);
});

// CERTIFICATE HANDLING - UPDATED FOR MULTIPLE CERTIFICATES
const certificateInput = document.getElementById('Certificate');
const certificatesContainer = document.querySelector('.certificate');
let currentCertificateToRemove = null;

// When certificate is selected
if (certificateInput && certificatesContainer) {
    certificateInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            for (let file of e.target.files) {
                const fileName = file.name;
                const fileUrl = URL.createObjectURL(file);

                // Create new certificate element
                const certificateDiv = document.createElement('div');
                certificateDiv.className = 'certificate-object';

                // Store file data
                certificateDiv.dataset.fileName = fileName;
                certificateDiv.dataset.fileUrl = fileUrl;
                certificateDiv.dataset.fileType = file.type;

                certificateDiv.innerHTML = `
                        <div class="certificate-content clickable">
                            <i class="spreadsheet" data-lucide="file-spreadsheet"></i>
                            <p>${fileName}</p>
                        </div>
                        <button class="Remove">Remove</button>
                    `;

                // Add to container
                certificatesContainer.appendChild(certificateDiv);

                // TODO: Upload certificate to backend
                // uploadCertificateToBackend(file);

                // Update Lucide icons
                setTimeout(() => {
                    lucide.createIcons();
                }, 0);
            }

            // Clear file input for next upload
            certificateInput.value = '';
        }
    });
}

// Handle ALL remove buttons (event delegation)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('Remove')) {
        e.preventDefault();
        e.stopPropagation();

        const certificateObject = e.target.closest('.certificate-object');
        if (certificateObject) {
            currentCertificateToRemove = certificateObject;

            // Get the certificate name
            const certificateName = certificateObject.querySelector('p').textContent;

            // Store the certificate name so iframe can access it
            localStorage.setItem('currentCertificateName', certificateName);

            // Show the confirmation dialog
            const mydialog = document.getElementById("popup");
            if (mydialog) {
                mydialog.showModal();

                // Refresh iframe to show updated certificate name
                const iframe = mydialog.querySelector('iframe');
                if (iframe) {
                    iframe.src = iframe.src;
                }
            }
        }
    }
});

// Handle certificate card clicks to view content
document.addEventListener('click', function (e) {
    // Don't trigger if clicking the remove button
    if (e.target.classList.contains('Remove') || e.target.closest('.Remove')) {
        return;
    }

    const clickableElement = e.target.closest('.clickable');
    const certificateObject = e.target.closest('.certificate-object');

    if (clickableElement || certificateObject) {
        e.preventDefault();
        e.stopPropagation();

        const certObject = certificateObject || clickableElement.closest('.certificate-object');
        if (certObject) {
            const fileName = certObject.dataset.fileName || certObject.querySelector('p').textContent;
            const fileUrl = certObject.dataset.fileUrl;
            const fileType = certObject.dataset.fileType || '';

            // Show certificate in modal
            showCertificateModal(fileName, fileUrl, fileType);
        }
    }
});

// Function to show certificate in modal
function showCertificateModal(fileName, fileUrl, fileType) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'certificate-modal-overlay';

    // Determine content based on file type
    let content = '';
    let contentClass = '';

    if (fileType.includes('image')) {
        content = `<img src="${fileUrl}" class="certificate-image-preview" alt="${fileName}">`;
        contentClass = 'image-content';
    } else if (fileType.includes('pdf')) {
        content = `<iframe src="${fileUrl}" class="certificate-pdf-preview"></iframe>`;
        contentClass = 'pdf-content';
    } else {
        content = `
                <div class="certificate-download-content">
                    <i data-lucide="file" class="file-icon-large"></i>
                    <p class="file-name">${fileName}</p>
                    <p class="file-message">Preview not available for this file type</p>
                    <a href="${fileUrl}" download="${fileName}" class="download-button">
                        Download File
                    </a>
                </div>
            `;
        contentClass = 'download-content';
    }

    // Create modal
    modalOverlay.innerHTML = `
            <div class="certificate-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${fileName}</h3>
                    <button class="close-certificate-modal">
                        ×
                    </button>
                </div>
                <div class="modal-body ${contentClass}">
                    ${content}
                </div>
            </div>
        `;

    document.body.appendChild(modalOverlay);

    // Update Lucide icons in modal
    setTimeout(() => {
        lucide.createIcons();
    }, 0);

    // Close modal on X button click
    modalOverlay.querySelector('.close-certificate-modal').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        // Revoke object URL to free memory
        if (fileUrl && fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fileUrl);
        }
    });

    // Close modal on background click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            // Revoke object URL to free memory
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
        }
    });

    // Close modal on Escape key
    const closeOnEscape = function (e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modalOverlay);
            // Revoke object URL to free memory
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    document.addEventListener('keydown', closeOnEscape);
}

// TODO: Function to load existing certificates from backend
// async function loadUserCertificates(userId) {
//     try {
//         const response = await fetch(`/api/user/${userId}/certificates`);
//         if (response.ok) {
//             const certificates = await response.json();
//             certificates.forEach(cert => {
//                 // Create certificate elements from backend data
//                 // ...
//             });
//         }
//     } catch (error) {
//         console.error("Error loading certificates:", error);
//     }
// }

// TODO: Function to upload certificate to backend
// async function uploadCertificateToBackend(file) {
//     const formData = new FormData();
//     formData.append('certificate', file);
//     
//     try {
//         const response = await fetch('/api/certificates/upload', {
//             method: 'POST',
//             body: formData
//         });
//         if (response.ok) {
//             const result = await response.json();
//             console.log("Certificate uploaded:", result);
//         }
//     } catch (error) {
//         console.error("Error uploading certificate:", error);
//     }
// }

// TODO: Function to delete certificate from backend
// async function deleteCertificateFromBackend(certificateId) {
//     try {
//         const response = await fetch(`/api/certificates/${certificateId}`, {
//             method: 'DELETE'
//         });
//         if (response.ok) {
//             console.log("Certificate deleted from backend");
//         }
//     } catch (error) {
//         console.error("Error deleting certificate:", error);
//     }
// }

// LISTEN FOR MESSAGES FROM IFRAME
window.addEventListener('message', function (event) {
    if (event.data === 'confirmRemove' && currentCertificateToRemove) {
        // TODO: Delete certificate from backend
        // const certificateId = currentCertificateToRemove.dataset.certificateId;
        // deleteCertificateFromBackend(certificateId);

        // Revoke object URL before removing
        const fileUrl = currentCertificateToRemove.dataset.fileUrl;
        if (fileUrl && fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fileUrl);
        }

        // Remove the certificate from UI
        currentCertificateToRemove.remove();
        currentCertificateToRemove = null;

        // Clear stored certificate name
        localStorage.removeItem('currentCertificateName');

        // Close dialog
        const mydialog = document.getElementById("popup");
        if (mydialog) {
            mydialog.close();
        }
    }

    if (event.data === 'cancelRemove') {
        currentCertificateToRemove = null;

        // Clear stored certificate name
        localStorage.removeItem('currentCertificateName');

        // Close dialog
        const mydialog = document.getElementById("popup");
        if (mydialog) {
            mydialog.close();
        }
    }

    // Old message for compatibility
    if (event.data === 'hideCertificate' && currentCertificateToRemove) {
        // TODO: Delete certificate from backend
        // const certificateId = currentCertificateToRemove.dataset.certificateId;
        // deleteCertificateFromBackend(certificateId);

        // Revoke object URL before removing
        const fileUrl = currentCertificateToRemove.dataset.fileUrl;
        if (fileUrl && fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fileUrl);
        }

        currentCertificateToRemove.remove();
        currentCertificateToRemove = null;

        // Clear stored certificate name
        localStorage.removeItem('currentCertificateName');

        const mydialog = document.getElementById("popup");
        if (mydialog) {
            mydialog.close();
        }
    }
});

// Global function for iframe to close dialog
window.closePop = function () {
    const mydialog = document.getElementById("popup");
    if (mydialog) {
        mydialog.close();
    }
    currentCertificateToRemove = null;
    localStorage.removeItem('currentCertificateName');
};

// Update UI based on user role
function updateUIForUserRole(userRole) {
    const isTeacher = userRole && userRole.includes('Teacher');
    const teacherModeElement = document.querySelector('.teacher-mode');
    const certificateSection = document.querySelector('.certificate-section');

    if (teacherModeElement && certificateSection) {
        if (isTeacher) {
            teacherModeElement.style.display = 'block';
            certificateSection.style.display = 'flex';
        } else {
            teacherModeElement.style.display = 'none';
            certificateSection.style.display = 'none';
        }
    }
}

let mydialog = document.getElementById("popup");

mydialog.addEventListener('click', (e) => {
    if (e.target === mydialog) {
        mydialog.close();
        currentCertificateToRemove = null;
        localStorage.removeItem('currentCertificateName');
    }
});

let showTrems = document.querySelector("#vpt");
let mydialog2 = document.getElementById("popup1");

showTrems.addEventListener('click', (e) => {
    e.preventDefault();
    mydialog2.showModal();
});

mydialog2.addEventListener('click', (e) => {
    if (e.target === mydialog2) {
        e.preventDefault();
        mydialog2.close();
    }
});

let closeBtn = document.querySelector(".close");
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        mydialog2.close();
    });
}

// TODO: Update teacher navigation logic for backend
function handleBecomeTeacherClick() {
    // TODO: Check if user is already a teacher via backend
    // const response = await fetch('/api/user/teacher-status');
    // const data = await response.json();

    // if (data.isTeacher) {
    //     window.location.href = "/html/teach.html";
    // } else {
    //     window.location.href = "/pages/teacherrequest.html";
    // }

    // Placeholder - remove when implementing backend
    window.location.href = "/pages/teacherrequest.html";
}

document.querySelector(".teachnav").addEventListener("click", (e) => {
    e.preventDefault();
    handleBecomeTeacherClick();
});
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/get_profile.php')
        .then(response => {
            if (!response.ok) throw new Error('User not found');
            return response.json();
        })
        .then(user => {
            // Fill your HTML inputs with data
            document.getElementById('FullnameV').value = user.full_name;
            document.getElementById('emailV').value = user.email;
            document.getElementById('skillV').value = user.skill;
            document.getElementById('AgeV').value = user.age;
            document.getElementById('bioV').value = user.bio;
        })
        .catch(error => {
            console.error(error);
            alert('Could not load user data');
        });
});*/

document.addEventListener('DOMContentLoaded', function () {
    console.log('Profile page loaded, fetching user data...');
    //--------------------------------------i changed this to make the session credentials work  hadil

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
                certificateSection = document.querySelector('.certificate-section'),
                profileImage = document.querySelector('.profile-pic');


            NameValue.value = user.full_name || '';
            ageValue.value = user.age || '';
            emailValue.value = user.email || '';
            skillValue.value = user.skill || '';
            bioValue.value = user.bio || '';

            // Profile picture
            profileImage.src = user.profile_picture
                ? user.profile_picture
                : 'images1/profilePicture1.jpg';
            console.log('✅ Profile loaded successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
        });

        loadUserCertificates();  
})






const certificateInput = document.getElementById('Certificate');
const certificatesContainer = document.getElementById('certificates-container');
let currentCertificateToRemove = null;

if (certificateInput && certificatesContainer) {
    certificateInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            for (let file of e.target.files) {
                const fileName = file.name;
                const fileUrl = URL.createObjectURL(file);

                const certificateDiv = document.createElement('div');
                certificateDiv.className = 'certificate-object';
                certificateDiv.dataset.fileName = fileName;
                certificateDiv.dataset.fileUrl = fileUrl;
                certificateDiv.dataset.fileType = file.type;

                certificateDiv.innerHTML = `
                    <div class="certificate-content clickable">
                        <i class="spreadsheet" data-lucide="file-spreadsheet"></i>
                        <p>${fileName}</p>
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
            certificateInput.value = '';
        }
    });
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('Remove')) {
        e.preventDefault();
        e.stopPropagation();

        const certificateObject = e.target.closest('.certificate-object');
        if (certificateObject) {
            currentCertificateToRemove = certificateObject;
            const certificateName = certificateObject.querySelector('p').textContent;
            localStorage.setItem('currentCertificateName', certificateName);

            const mydialog = document.getElementById("popup");
            if (mydialog) {
                mydialog.showModal();
            }
        }
    }
});

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

window.addEventListener('message', function (event) {
    if ((event.data === 'confirmRemove' || event.data === 'hideCertificate') && currentCertificateToRemove) {
        const fileUrl = currentCertificateToRemove.dataset.fileUrl;
        if (fileUrl && fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fileUrl);
        }

        currentCertificateToRemove.remove();
        currentCertificateToRemove = null;
        localStorage.removeItem('currentCertificateName');

        const mydialog = document.getElementById("popup");
        if (mydialog) mydialog.close();
    }

    if (event.data === 'cancelRemove') {
        currentCertificateToRemove = null;
        localStorage.removeItem('currentCertificateName');

        const mydialog = document.getElementById("popup");
        if (mydialog) mydialog.close();
    }
});

window.closePop = function () {
    const mydialog = document.getElementById("popup");
    if (mydialog) mydialog.close();
    currentCertificateToRemove = null;
    localStorage.removeItem('currentCertificateName');
};

const mydialog = document.getElementById("popup");
if (mydialog) {
    mydialog.addEventListener('click', (e) => {
        if (e.target === mydialog) {
            mydialog.close();
            currentCertificateToRemove = null;
            localStorage.removeItem('currentCertificateName');
        }
    });
}

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

const teachNav = document.querySelector(".teachnav");
if (teachNav) {
    teachNav.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "pages/teacherrequest.html";
    });
}
//  hadil added this to display the certificates from the backend --------------------------------
async function loadUserCertificates() {
    try {
        const response = await fetch('api/get_certificates.php', { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const certificates = await response.json();

        certificates.forEach(cert => {
            const certificateDiv = document.createElement('div');
            certificateDiv.className = 'certificate-object';
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
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
        console.log(' Certificates loaded from backend!');
    } catch (error) {
        console.error("Error loading certificates:", error);
    }
}
