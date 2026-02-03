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
    loadStatistics();
    
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

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('previewContainer').classList.remove('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Analyze image (mock implementation)
function analyzeImage() {
    // Show loading
    showToast('Analyzing image...', 'info');

    // Mock analysis delay
    setTimeout(() => {
        // Mock results
        const results = {
            count: Math.floor(Math.random() * 5) + 1,
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            confidence: Math.floor(Math.random() * 30) + 70
        };

        document.getElementById('potholeCount').textContent = results.count;
        document.getElementById('severity').textContent = results.severity;
        document.getElementById('severity').className = `value severity ${results.severity}`;
        document.getElementById('confidence').textContent = `${results.confidence}%`;

        document.getElementById('resultsContainer').classList.remove('hidden');
        showToast('Analysis complete!', 'success');
    }, 2000);
}

// Submit report
async function submitReport() {
    const userId = sessionStorage.getItem('userId');
    const location = document.getElementById('locationInput').value || 'Unknown location';
    const count = parseInt(document.getElementById('potholeCount').textContent);
    const severity = document.getElementById('severity').textContent;
    const confidence = parseInt(document.getElementById('confidence').textContent);
    const image = document.getElementById('previewImage').src;

    if (!userId) {
        showModal('Error', 'User not logged in', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                location,
                count,
                severity,
                confidence,
                image
            })
        });

        const result = await response.json();

        if (result.success) {
            showModal('Success', 'Report submitted successfully!', 'success', function() {
                // Reset form
                document.getElementById('imageUpload').value = '';
                document.getElementById('previewContainer').classList.add('hidden');
                document.getElementById('resultsContainer').classList.add('hidden');
                document.getElementById('locationInput').value = '';

                // Reload data
                loadUserReports();
                loadUserStats();
            });
        } else {
            showModal('Error', result.message || 'Failed to submit report', 'error');
        }
    } catch (error) {
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

            reportsList.innerHTML = result.reports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <h4>Report #${report.id}</h4>
                        <span class="report-status ${report.status}">${report.status}</span>
                    </div>
                    <div class="report-details">
                        <p><strong>Location:</strong> ${report.location}</p>
                        <p><strong>Potholes:</strong> ${report.count}</p>
                        <p><strong>Severity:</strong> <span class="severity ${report.severity}">${report.severity}</span></p>
                        <p><strong>Confidence:</strong> ${report.confidence}%</p>
                        <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    ${report.image ? `<img src="${report.image}" alt="Report image" class="report-image">` : ''}
                </div>
            `).join('');
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
