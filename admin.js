// Admin panel functionality

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
    if (localStorage.getItem('justLoggedIn') === 'true') {
        localStorage.removeItem('justLoggedIn');
        showToast('Admin login successful! Welcome back.', 'success');
    }
    
    // Set admin name
    const adminName = localStorage.getItem('adminName') || 'Administrator';
    document.getElementById('adminName').textContent = adminName;
    
    // Load initial data
    loadAdminOverview();
    loadAllReports();
    loadAllUsers();
    loadRecentActivity();
    
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

// Show admin section
function showAdminSection(section) {
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
        'overview': 'overviewSection',
        'reports': 'reportsSection',
        'users': 'usersSection',
        'analytics': 'analyticsSection',
        'settings': 'settingsSection'
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

// Load admin overview
function loadAdminOverview() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const activeUsers = [...new Set(reports.map(r => r.email))].length;
    
    document.getElementById('adminTotalReports').textContent = total;
    document.getElementById('adminPendingReports').textContent = pending;
    document.getElementById('adminResolvedReports').textContent = resolved;
    document.getElementById('adminActiveUsers').textContent = activeUsers;
}

// Load recent activity
function loadRecentActivity() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const recentReports = reports.slice(-5).reverse();
    
    const activityList = document.getElementById('recentActivityList');
    
    if (recentReports.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #999;">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = recentReports.map(report => `
        <div class="activity-item">
            <p><strong>${report.user}</strong> reported ${report.count} pothole(s) at ${report.location}</p>
            <span class="activity-time">${getTimeAgo(report.timestamp)}</span>
        </div>
    `).join('');
}

// Load all reports
function loadAllReports() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const tbody = document.getElementById('reportsTableBody');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No reports found</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.user}</td>
            <td>${report.location}</td>
            <td><span class="severity ${report.severity}">${report.severity}</span></td>
            <td>${new Date(report.timestamp).toLocaleDateString()}</td>
            <td><span class="report-status ${report.status}">${report.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewReport(${report.id})">View</button>
                ${report.status === 'pending' ? `
                    <button class="action-btn approve" onclick="updateReportStatus(${report.id}, 'resolved')">Resolve</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Load all users
function loadAllUsers() {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const users = {};
    
    reports.forEach(report => {
        if (!users[report.email]) {
            users[report.email] = {
                name: report.user,
                email: report.email,
                reports: 0,
                joined: report.timestamp
            };
        }
        users[report.email].reports++;
    });
    
    const tbody = document.getElementById('usersTableBody');
    const userArray = Object.values(users);
    
    if (userArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = userArray.map((user, index) => `
        <tr>
            <td>#${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.reports}</td>
            <td>${new Date(user.joined).toLocaleDateString()}</td>
            <td><span class="report-status resolved">Active</span></td>
            <td>
                <button class="action-btn view" onclick="viewUser('${user.email}')">View</button>
            </td>
        </tr>
    `).join('');
}

// Filter reports
function filterReports() {
    const statusFilter = document.getElementById('statusFilter').value;
    const severityFilter = document.getElementById('severityFilter').value;
    
    let reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    
    if (statusFilter !== 'all') {
        reports = reports.filter(r => r.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
        reports = reports.filter(r => r.severity === severityFilter);
    }
    
    // Update table with filtered reports
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.user}</td>
            <td>${report.location}</td>
            <td><span class="severity ${report.severity}">${report.severity}</span></td>
            <td>${new Date(report.timestamp).toLocaleDateString()}</td>
            <td><span class="report-status ${report.status}">${report.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewReport(${report.id})">View</button>
                ${report.status === 'pending' ? `
                    <button class="action-btn approve" onclick="updateReportStatus(${report.id}, 'resolved')">Resolve</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Search reports
function searchReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    
    const filtered = reports.filter(r => 
        r.user.toLowerCase().includes(searchTerm) ||
        r.location.toLowerCase().includes(searchTerm) ||
        r.id.toString().includes(searchTerm)
    );
    
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = filtered.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.user}</td>
            <td>${report.location}</td>
            <td><span class="severity ${report.severity}">${report.severity}</span></td>
            <td>${new Date(report.timestamp).toLocaleDateString()}</td>
            <td><span class="report-status ${report.status}">${report.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewReport(${report.id})">View</button>
                ${report.status === 'pending' ? `
                    <button class="action-btn approve" onclick="updateReportStatus(${report.id}, 'resolved')">Resolve</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// View report
function viewReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        const details = `ID: ${report.id}\nUser: ${report.user}\nLocation: ${report.location}\nPotholes: ${report.count}\nSeverity: ${report.severity}\nConfidence: ${report.confidence}%\nStatus: ${report.status}\nDate: ${new Date(report.timestamp).toLocaleString()}`;
        showModal('Report Details', details, 'info');
    }
}

// View user
function viewUser(email) {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const userReports = reports.filter(r => r.email === email);
    const user = userReports[0];
    
    if (user) {
        const details = `Name: ${user.user}\nEmail: ${email}\nTotal Reports: ${userReports.length}\nJoined: ${new Date(user.timestamp).toLocaleDateString()}`;
        showModal('User Details', details, 'info');
    }
}

// Update report status
function updateReportStatus(reportId, newStatus) {
    const reports = JSON.parse(localStorage.getItem('potholeReports') || '[]');
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
        reports[reportIndex].status = newStatus;
        localStorage.setItem('potholeReports', JSON.stringify(reports));
        
        showModal('Success', `Report #${reportId} has been ${newStatus}!`, 'success', function() {
            // Reload data
            loadAdminOverview();
            loadAllReports();
            loadRecentActivity();
        });
    }
}

// Get time ago
function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Logout
function logout() {
    showConfirmModal('Logout', 'Are you sure you want to logout?', function() {
        localStorage.setItem('justLoggedOut', 'true');
        localStorage.removeItem('userType');
        window.location.href = 'index.html';
    });
}
