document.addEventListener('DOMContentLoaded', function () {

    // TODO: Get current user from authentication system (session, JWT, etc.)
    const currentUserEmail = localStorage.getItem("currentUserEmail"); // Replace with your auth method

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
    getUserFromBackend().then(user => {
        if (!user) {
            console.log("User not found - redirecting to login");
            window.location.href = "/auth.html";
            return;
        }

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
        certificateInput.addEventListener('change', function(e) {
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
    document.addEventListener('click', function(e) {
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
    document.addEventListener('click', function(e) {
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
        const closeOnEscape = function(e) {
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
    window.addEventListener('message', function(event) {
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
    window.closePop = function() {
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