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

let allReports = [];
let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check if just logged in and show toast
    if (sessionStorage.getItem('justLoggedIn') === 'true') {
        sessionStorage.removeItem('justLoggedIn');
        showToast('Admin login successful! Welcome back.', 'success');
    }
    
    // Set admin name
    const adminName = sessionStorage.getItem('adminName') || 'Administrator';
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
    if (event) {
        event.currentTarget.classList.add('active');
    }
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
async function loadAdminOverview() {
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.statistics;
            document.getElementById('adminTotalReports').textContent = stats.totalReports;
            document.getElementById('adminPendingReports').textContent = stats.pendingReports;
            document.getElementById('adminResolvedReports').textContent = stats.resolvedReports;
            document.getElementById('adminActiveUsers').textContent = stats.totalUsers;
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load recent activity
function loadRecentActivity(reports) {
    const recentReports = reports.slice(-5).reverse();
    
    const activityList = document.getElementById('recentActivityList');
    
    if (recentReports.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #999;">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = recentReports.map(report => `
        <div class="activity-item">
            <p><strong>${report.userName}</strong> reported ${report.count} pothole(s) at ${report.location}</p>
            <span class="activity-time">${getTimeAgo(report.createdAt)}</span>
        </div>
    `).join('');
}

// Load all reports
async function loadAllReports() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success) {
            allReports = result.reports;
            renderReportsTable(allReports);
            loadRecentActivity(allReports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function renderReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No reports found</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.userName}</td>
            <td>${report.location}</td>
            <td><span class="severity ${report.severity}">${report.severity}</span></td>
            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
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
async function loadAllUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        const result = await response.json();
        
        if (result.success) {
            allUsers = result.users;
            const tbody = document.getElementById('usersTableBody');
            
            if (allUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No users found</td></tr>';
                return;
            }
            
            tbody.innerHTML = allUsers.map((user, index) => `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><span class="report-status resolved">Active</span></td>
                    <td>
                        <button class="action-btn view" onclick="viewUser(${user.id})">View</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Filter reports
function filterReports() {
    const statusFilter = document.getElementById('statusFilter').value;
    const severityFilter = document.getElementById('severityFilter').value;
    
    let filtered = allReports;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
        filtered = filtered.filter(r => r.severity === severityFilter);
    }
    
    renderReportsTable(filtered);
}

// Search reports
function searchReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    
    const filtered = allReports.filter(r => 
        r.userName.toLowerCase().includes(searchTerm) ||
        r.location.toLowerCase().includes(searchTerm) ||
        r.id.toString().includes(searchTerm)
    );
    
    renderReportsTable(filtered);
}

// View report
function viewReport(reportId) {
    const report = allReports.find(r => r.id === reportId);
    
    if (report) {
        const details = `ID: ${report.id}\nUser: ${report.userName}\nLocation: ${report.location}\nPotholes: ${report.count}\nSeverity: ${report.severity}\nConfidence: ${report.confidence}%\nStatus: ${report.status}\nDate: ${new Date(report.createdAt).toLocaleString()}`;
        showModal('Report Details', details, 'info');
    }
}

// View user
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    
    if (user) {
        const details = `Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}`;
        showModal('User Details', details, 'info');
    }
}

// Update report status
async function updateReportStatus(reportId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/reports/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showModal('Success', `Report #${reportId} has been ${newStatus}!`, 'success', function() {
                // Reload data
                loadAdminOverview();
                loadAllReports();
            });
        } else {
            showModal('Error', result.message || 'Failed to update report', 'error');
        }
    } catch (error) {
        showModal('Error', 'Unable to connect to server. Please make sure the server is running.', 'error');
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
        sessionStorage.setItem('justLoggedOut', 'true');
        sessionStorage.removeItem('userType');
        window.location.href = 'index.html';
    });
}
