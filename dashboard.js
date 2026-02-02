// Dashboard functionality
let currentImage = null;
let detectionResults = null;

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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if just logged in and show toast
    if (localStorage.getItem('justLoggedIn') === 'true') {
        localStorage.removeItem('justLoggedIn');
        showToast('Login successful! Welcome back.', 'success');
    }
    
    // Set user name
    const userName = localStorage.getItem('userName') || 'User';
    document.getElementById('userName').textContent = userName;
    
    // Load user reports
    loadUserReports();
    loadStatistics();
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
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            const previewImg = document.getElementById('previewImage');
            previewImg.src = currentImage;
            
            // Show preview, hide upload box
            document.querySelector('.upload-box').style.display = 'none';
            document.getElementById('previewContainer').classList.remove('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Analyze image (simulation)
function analyzeImage() {
    if (!currentImage) return;
    
    // Show loading state
    const analyzeBtn = document.querySelector('.analyze-btn');
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
    
    // Simulate detection with random results
    setTimeout(() => {
        const potholeCount = Math.floor(Math.random() * 5) + 1;
        const severities = ['low', 'medium', 'high'];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const confidence = (Math.random() * 20 + 80).toFixed(1);
        
        detectionResults = {
            count: potholeCount,
            severity: severity,
            confidence: confidence,
            timestamp: new Date().toISOString(),
            image: currentImage
        };
        
        // Display results
        document.getElementById('potholeCount').textContent = potholeCount;
        const severityEl = document.getElementById('severity');
        severityEl.textContent = severity.charAt(0).toUpperCase() + severity.slice(1);
        severityEl.className = 'value severity ' + severity;
        document.getElementById('confidence').textContent = confidence + '%';
        
        // Show results container
        document.getElementById('resultsContainer').classList.remove('hidden');
        
        // Reset button
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }, 2000);
}

// Submit report
function submitReport() {
    if (!detectionResults) return;
    
    const location = document.getElementById('locationInput').value || 'Location not specified';
    
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    
    // Add new report
    const report = {
        id: Date.now(),
        user: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || '',
        location: location,
        count: detectionResults.count,
        severity: detectionResults.severity,
        confidence: detectionResults.confidence,
        image: detectionResults.image,
        timestamp: detectionResults.timestamp,
        status: 'pending'
    };
    
    reports.push(report);
    localStorage.setItem('potholeReports', JSON.stringify(reports));
    
    // Show success message
    showModal('Success', 'Report submitted successfully!', 'success', function() {
        // Reset form
        document.querySelector('.upload-box').style.display = 'block';
        document.getElementById('previewContainer').classList.add('hidden');
        document.getElementById('resultsContainer').classList.add('hidden');
        document.getElementById('locationInput').value = '';
        document.getElementById('imageUpload').value = '';
        currentImage = null;
        detectionResults = null;
        
        // Refresh reports and stats
        loadUserReports();
        loadStatistics();
    });
}

// Load user reports
function loadUserReports() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const userEmail = localStorage.getItem('userEmail');
    const userReports = reports.filter(r => r.email === userEmail);
    
    const reportsList = document.getElementById('reportsList');
    
    if (userReports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No reports yet. Start by detecting potholes!</p>';
        return;
    }
    
    reportsList.innerHTML = userReports.map(report => `
        <div class="report-item">
            <img src="${report.image}" alt="Pothole">
            <div class="report-info">
                <h4>Report #${report.id}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${report.location}</p>
                <p><i class="fas fa-exclamation-triangle"></i> ${report.count} pothole(s) detected</p>
                <p><i class="fas fa-calendar"></i> ${new Date(report.timestamp).toLocaleString()}</p>
            </div>
            <span class="report-status ${report.status}">${report.status}</span>
        </div>
    `).join('');
}

// Load statistics
function loadStatistics() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const userEmail = localStorage.getItem('userEmail');
    const userReports = reports.filter(r => r.email === userEmail);
    
    const totalReports = userReports.length;
    const resolvedReports = userReports.filter(r => r.status === 'resolved').length;
    const pendingReports = userReports.filter(r => r.status === 'pending').length;
    
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('resolvedReports').textContent = resolvedReports;
    document.getElementById('pendingReports').textContent = pendingReports;
    
    // Calculate rank based on total reports
    const allUsers = [...new Set(reports.map(r => r.email))];
    const userCounts = allUsers.map(email => ({
        email: email,
        count: reports.filter(r => r.email === email).length
    })).sort((a, b) => b.count - a.count);
    
    const rank = userCounts.findIndex(u => u.email === userEmail) + 1;
    document.getElementById('userRank').textContent = rank > 0 ? `#${rank}` : '-';
}

// Logout
function logout() {
    showConfirmModal('Logout', 'Are you sure you want to logout?', function() {
        localStorage.setItem('justLoggedOut', 'true');
        localStorage.removeItem('userType');
        window.location.href = 'index.html';
    });
}
