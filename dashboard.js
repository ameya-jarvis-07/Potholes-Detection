// Dashboard functionality
let currentImage = null;
let detectionResults = null;

// Toggle Sidebar for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Toast Notification Function
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="toast-icon ${icons[type] || icons.info}"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Modal Functions
function showModal(title, message, type = 'info', callback = null) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalHeader = modal.querySelector('.modal-header');
    const modalIcon = modal.querySelector('.modal-icon');
    const okBtn = document.getElementById('modalOkBtn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Set modal style based on type
    modalHeader.className = 'modal-header ' + type;

    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    modalIcon.className = 'modal-icon ' + (icons[type] || icons.info);

    modal.classList.add('show');

    okBtn.onclick = function() {
        modal.classList.remove('show');
        if (callback) callback();
    };

    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    };
}

function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    confirmTitle.textContent = title;
    confirmMessage.textContent = message;

    modal.classList.add('show');

    confirmOkBtn.onclick = function() {
        modal.classList.remove('show');
        if (onConfirm) onConfirm();
    };

    confirmCancelBtn.onclick = function() {
        modal.classList.remove('show');
        if (onCancel) onCancel();
    };

    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            if (onCancel) onCancel();
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if just logged in and show toast
    if (sessionStorage.getItem('justLoggedIn') === 'true') {
        sessionStorage.removeItem('justLoggedIn');
        showToast('Login successful! Welcome back.', 'success');
    }

    // Set user name
    const userName = sessionStorage.getItem('userName') || 'User';
    document.getElementById('userName').textContent = userName;

    // Load initial data
    loadUserReports();
    loadUserStats();
    
    // Handle window resize for sidebar
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768 || (window.innerWidth <= 1024 && window.innerHeight <= 768 && window.matchMedia('(orientation: landscape)').matches);
        if (!isMobile) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Setup drag and drop for file upload
    const uploadBox = document.querySelector('.upload-box');
    if (uploadBox) {
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '#667eea';
            uploadBox.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        });
        
        uploadBox.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '';
            uploadBox.style.backgroundColor = '';
        });
        
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '';
            uploadBox.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const input = document.getElementById('imageUpload');
                input.files = files;
                handleMediaUpload({ target: input });
            }
        });
    }
});

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });

    // Remove active from menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const sectionMap = {
        'detect': 'detectSection',
        'history': 'historySection',
        'map': 'mapSection',
        'stats': 'statsSection'
    };

    document.getElementById(sectionMap[section]).classList.add('active');

    // Add active to clicked menu item
    event.currentTarget.classList.add('active');
    
    // Close sidebar on mobile after selection
    const isMobile = window.innerWidth <= 768 || (window.innerWidth <= 1024 && window.innerHeight <= 768 && window.matchMedia('(orientation: landscape)').matches);
    if (isMobile) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    }
}

// Handle image or video upload
function handleMediaUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showToast('File size exceeds 50MB. Please upload a smaller file.', 'error');
        return;
    }
    
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    const previewContainer = document.getElementById('previewContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Check if file is image or video
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
        showToast('Please upload an image or video file.', 'error');
        return;
    }
    
    currentImage = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        if (isImage) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
            previewVideo.classList.add('hidden');
            previewVideo.src = '';
        } else if (isVideo) {
            previewVideo.src = e.target.result;
            previewVideo.classList.remove('hidden');
            previewImage.classList.add('hidden');
            previewImage.src = '';
        }
        
        previewContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        
        showToast(`${isImage ? 'Image' : 'Video'} loaded successfully!`, 'success');
    };
    
    reader.onerror = function() {
        showToast('Error loading file. Please try again.', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Backward compatibility for old function name
function handleImageUpload(event) {
    handleMediaUpload(event);
}

// Analyze image or video (uploads to backend -> Cloudinary -> ML)
async function analyzeMedia() {
    if (!currentImage) {
        showToast('Please upload a file first.', 'warning');
        return;
    }
    const fileType = currentImage.type.startsWith('video/') ? 'video' : 'image';
    showToast(`Uploading ${fileType} for analysis...`, 'info');

    try {
        const formData = new FormData();
        formData.append('media', currentImage);

        const resp = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData
        });

        const result = await resp.json();
        console.log('Analyze response:', result); // DEBUG
        
        if (!result.success) {
            showToast(result.message || 'Analysis failed', 'error');
            return;
        }

        const results = result.detection || { count: 0, severity: 'low', confidence: 0 };

        document.getElementById('potholeCount').textContent = results.count;
        document.getElementById('severity').textContent = results.severity;
        document.getElementById('severity').className = `value severity ${results.severity}`;
        document.getElementById('confidence').textContent = `${results.confidence}%`;

        document.getElementById('resultsContainer').classList.remove('hidden');

        detectionResults = results;
        // store uploaded media URL for report submission
        currentImage.uploadedUrl = result.imageUrl;
        
        console.log('Stored image URL:', result.imageUrl); // DEBUG

        showToast(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} analysis complete!`, 'success');
    } catch (err) {
        console.error('Analyze error:', err);
        showToast('Unable to analyze file. Make sure the server is running.', 'error');
    }
}

// Backward compatibility for old function name
function analyzeImage() {
    analyzeMedia();
}

// Submit report
async function submitReport() {
    const userId = sessionStorage.getItem('userId');
    const location = document.getElementById('locationInput').value && document.getElementById('locationInput').value.trim();
    const street = document.getElementById('streetInput').value && document.getElementById('streetInput').value.trim();
    const description = document.getElementById('descriptionInput').value && document.getElementById('descriptionInput').value.trim();
    const urgency = document.getElementById('urgencyInput').value;
    const phone = document.getElementById('phoneInput').value && document.getElementById('phoneInput').value.trim();
    const observations = document.getElementById('observationsInput').value && document.getElementById('observationsInput').value.trim();
    const count = parseInt(document.getElementById('potholeCount').textContent);
    const severity = document.getElementById('severity').textContent;
    const confidence = parseInt(document.getElementById('confidence').textContent);
    const image = currentImage && currentImage.uploadedUrl ? currentImage.uploadedUrl : null;

    // Validate required fields
    if (!currentImage || !image) {
        showModal('Validation Error', 'Please upload a photo or video and run analysis before submitting.', 'error');
        return;
    }

    if (!location) {
        showModal('Validation Error', 'Please provide a location for the report.', 'error');
        return;
    }

    if (!street) {
        showModal('Validation Error', 'Please provide the street/road name.', 'error');
        return;
    }

    if (!description) {
        showModal('Validation Error', 'Please provide a description of the pothole condition.', 'error');
        return;
    }

    if (!userId) {
        showModal('Error', 'User not logged in', 'error');
        return;
    }

    try {
        const reportPayload = {
            userId: parseInt(userId),
            location,
            street,
            description,
            urgency,
            phone: phone || null,
            observations: observations || null,
            count,
            severity,
            confidence,
            image
        };
        
        console.log('Submitting report with payload:', reportPayload); // DEBUG
        console.log('Image URL being sent:', image); // DEBUG
        
        const response = await fetch('http://localhost:3000/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportPayload)
        });

        const result = await response.json();

        if (result.success) {
            showModal('Success', 'Report submitted successfully!', 'success', function() {
                // Reset form
                document.getElementById('imageUpload').value = '';
                document.getElementById('previewContainer').classList.add('hidden');
                document.getElementById('resultsContainer').classList.add('hidden');
                document.getElementById('locationInput').value = '';
                document.getElementById('streetInput').value = '';
                document.getElementById('descriptionInput').value = '';
                document.getElementById('urgencyInput').value = 'medium';
                document.getElementById('phoneInput').value = '';
                document.getElementById('observationsInput').value = '';

                // Reload data
                loadUserReports();
                loadUserStats();
            });
        } else {
            showModal('Error', result.message || 'Failed to submit report', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error); // DEBUG
        showModal('Error', 'Unable to connect to server. Please make sure the server is running.', 'error');
    }
}

// Load user reports
async function loadUserReports() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:3000/api/reports/user/${userId}`);
        const result = await response.json();

        if (result.success) {
            const reportsList = document.getElementById('reportsList');
            if (result.reports.length === 0) {
                reportsList.innerHTML = '<p style="text-align: center; color: #999;">No reports found</p>';
                return;
            }

            console.log('Loaded reports:', result.reports); // DEBUG
            
            reportsList.innerHTML = result.reports.map(report => {
                console.log(`Report #${report.id} - Image URL:`, report.image); // DEBUG
                return `
                <div class="report-card">
                    <div class="report-header">
                        <h4>Report #${report.id}</h4>
                        <span class="report-status ${report.status}">${report.status}</span>
                    </div>
                    <div class="report-details">
                        <p><strong>Location:</strong> ${report.location}, ${report.street}</p>
                        <p><strong>Description:</strong> ${report.description}</p>
                        <p><strong>Potholes Detected:</strong> ${report.count}</p>
                        <p><strong>Severity:</strong> <span class="severity ${report.severity}">${report.severity}</span></p>
                        <p><strong>Urgency:</strong> ${report.urgency}</p>
                        <p><strong>Confidence:</strong> ${report.confidence}%</p>
                        ${report.observations ? `<p><strong>Observations:</strong> ${report.observations}</p>` : ''}
                        <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    ${report.image ? `
                        <div style="width: 100%; border-radius: 10px; overflow: hidden; margin-top: 10px;">
                            <img src="${report.image}" alt="Report image" class="report-image" style="width: 100%; height: 200px; object-fit: cover; display: block;">
                        </div>
                    ` : '<p style="color: #999; font-size: 0.9rem; margin-top: 10px;">No image attached</p>'}
                </div>
            `}).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Load user statistics
async function loadUserStats() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:3000/api/reports/user/${userId}`);
        const result = await response.json();

        if (result.success) {
            const reports = result.reports;
            const total = reports.length;
            const resolved = reports.filter(r => r.status === 'resolved').length;
            const pending = reports.filter(r => r.status === 'pending').length;

            document.getElementById('totalReports').textContent = total;
            document.getElementById('resolvedReports').textContent = resolved;
            document.getElementById('pendingReports').textContent = pending;
            document.getElementById('userRank').textContent = 'Top Contributor'; // Mock rank
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Logout
function logout() {
    showConfirmModal('Logout', 'Are you sure you want to logout?', function() {
        sessionStorage.setItem('justLoggedOut', 'true');
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}
