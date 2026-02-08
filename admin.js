// Admin panel functionality

// ==================== MAP CONFIGURATION ====================
// Replace this with your LocationIQ API key (same as dashboard)
const LOCATIONIQ_API_KEY = 'pk.17a66f28fd65481575ebcd156c8b09f0';

// Map instance for location viewer
let locationMapInstance = null;

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
    loadAnalytics();
    
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
    
    const targetSection = sectionMap[section];
    if (targetSection) {
        document.getElementById(targetSection).classList.add('active');
    }
    
    // Add active to clicked menu item by finding the one with onclick matching this section
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${section}'`)) {
            item.classList.add('active');
        }
    });
    
    // Load section-specific data
    if (section === 'analytics') {
        loadAnalytics();
    }
    
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
            console.log('Loaded admin reports:', result.reports); // DEBUG
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
        console.log('Viewing report:', report); // DEBUG
        console.log('Image URL:', report.image); // DEBUG
        
        const modal = document.getElementById('reportDetailModal');
        const title = document.getElementById('reportDetailTitle');
        const body = document.getElementById('reportDetailBody');
        
        title.textContent = `Report #${report.id} - Details`;
        
        body.innerHTML = `
            <div class="report-detail-content">
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Reporter Information</h4>
                    <p><strong>Name:</strong> ${report.userName}</p>
                    <p><strong>Email:</strong> ${report.userEmail}</p>
                    <p><strong>Phone:</strong> ${report.userPhone || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Location Details</h4>
                    <p><strong>Location:</strong> ${report.location}</p>
                    <p><strong>Street/Road:</strong> ${report.street}</p>
                    ${report.latitude && report.longitude ? `
                        <p><strong>Coordinates:</strong> ${parseFloat(report.latitude).toFixed(6)}, ${parseFloat(report.longitude).toFixed(6)}</p>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Pothole Information</h4>
                    <p><strong>Description:</strong> ${report.description}</p>
                    <p><strong>Potholes Detected:</strong> ${report.count}</p>
                    <p><strong>Severity:</strong> <span class="severity ${report.severity}">${report.severity}</span></p>
                    <p><strong>Urgency:</strong> <span class="badge urgency-${report.urgency}">${report.urgency}</span></p>
                    <p><strong>Confidence:</strong> ${report.confidence}%</p>
                    ${report.observations ? `<p><strong>Observations:</strong> ${report.observations}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Status & Timeline</h4>
                    <p><strong>Status:</strong> <span class="report-status ${report.status}">${report.status}</span></p>
                    <p><strong>Reported On:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> ${new Date(report.updatedAt).toLocaleString()}</p>
                </div>
                
                ${report.image ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-image"></i> Attached Media</h4>
                        <div style="width: 100%; border-radius: 10px; overflow: hidden; margin-top: 10px;">
                            <img src="${report.image}" alt="Report image" style="width: 100%; height: 250px; object-fit: cover; display: block;">
                        </div>
                    </div>
                ` : ''}
                
                <div class="detail-actions" style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; border-top: 1px solid #ddd; padding-top: 20px;">
                    ${report.image ? `
                        <button onclick="showPhotoViewer('${report.image}')" class="action-btn photo-btn">
                            <i class="fas fa-image"></i> Show Photo
                        </button>
                    ` : ''}
                    ${report.latitude && report.longitude ? `
                        <button onclick="showLocationMap(${report.latitude}, ${report.longitude}, '${report.location.replace(/'/g, "\\'")}')" class="action-btn map-btn">
                            <i class="fas fa-map-marker-alt"></i> Show Map
                        </button>
                    ` : ''}
                    ${report.status === 'pending' ? `
                        <button onclick="closeReportDetail(); updateReportStatus(${report.id}, 'resolved');" class="action-btn approve" style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white;">
                            <i class="fas fa-check"></i> Mark as Resolved
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        modal.classList.add('show');
        
        // Close on background click
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeReportDetail();
            }
        };
    }
}

/**
 * Closes the report detail modal
 */
function closeReportDetail() {
    const modal = document.getElementById('reportDetailModal');
    modal.classList.remove('show');
    modal.onclick = null;
}

// ==================== PHOTO VIEWER FUNCTIONS ====================

/**
 * Shows photo in a modal viewer
 */
function showPhotoViewer(imageUrl) {
    const modal = document.getElementById('photoViewerModal');
    const image = document.getElementById('photoViewerImage');
    
    image.src = imageUrl;
    modal.classList.add('show');
    
    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closePhotoViewer();
        }
    };
}

/**
 * Closes the photo viewer modal
 */
function closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    modal.classList.remove('show');
    modal.onclick = null;
}

/**
 * Shows location on a map in modal
 */
function showLocationMap(lat, lng, address) {
    const modal = document.getElementById('locationMapModal');
    modal.classList.add('show');
    
    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeLocationMap();
        }
    };
    
    // Initialize map after modal is shown
    setTimeout(() => {
        if (locationMapInstance) {
            locationMapInstance.remove();
        }
        
        // Check if API key is set
        if (LOCATIONIQ_API_KEY === 'YOUR_LOCATIONIQ_API_KEY_HERE') {
            document.getElementById('locationMapViewer').innerHTML = 
                '<div style=\"padding: 40px; text-align: center; color: #e74c3c;\"><i class=\"fas fa-exclamation-triangle\" style=\"font-size: 48px; margin-bottom: 20px;\"></i><p>Please add your LocationIQ API key in admin.js</p></div>';
            return;
        }
        
        // Create map instance
        locationMapInstance = L.map('locationMapViewer').setView([lat, lng], 16);
        
        // Add LocationIQ tile layer
        L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`, {
            attribution: '&copy; <a href=\"https://locationiq.com\">LocationIQ</a> | &copy; <a href=\"https://openstreetmap.org\">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(locationMapInstance);
        
        // Add marker for the pothole location
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker high',
                html: '<i class=\"fas fa-exclamation-triangle\"></i>',
                iconSize: [30, 30]
            })
        }).addTo(locationMapInstance)
          .bindPopup(`<b>Pothole Location</b><br>${address}`)
          .openPopup();
    }, 100);
}

/**
 * Closes the location map modal
 */
function closeLocationMap() {
    const modal = document.getElementById('locationMapModal');
    modal.classList.remove('show');
    modal.onclick = null;
    
    // Destroy map instance
    if (locationMapInstance) {
        locationMapInstance.remove();
        locationMapInstance = null;
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

// Load Analytics
async function loadAnalytics() {
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.statistics;
            
            // Get all reports for detailed analytics
            const reportsResponse = await fetch('http://localhost:3000/api/reports');
            const reportsResult = await reportsResponse.json();
            
            if (reportsResult.success) {
                const reports = reportsResult.reports;
                
                // Create Reports Over Time Chart Data
                createReportsOverTimeChart(reports);
                
                // Create Severity Distribution Chart
                createSeverityDistributionChart(reports);
            }
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Show error message in charts
        document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
            placeholder.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load analytics data</p>
                <small>Make sure the server is running</small>
            `;
        });
    }
}

// Create Reports Over Time Chart
function createReportsOverTimeChart(reports) {
    const chartContainer = document.querySelector('.chart-card:nth-child(1) .chart-placeholder');
    
    if (!reports || reports.length === 0) {
        chartContainer.innerHTML = `
            <i class="fas fa-chart-line"></i>
            <p>No report data available</p>
        `;
        return;
    }
    
    // Group reports by date
    const reportsByDate = {};
    const last7Days = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last7Days.push(dateStr);
        reportsByDate[dateStr] = 0;
    }
    
    // Count reports per day
    reports.forEach(report => {
        const date = new Date(report.createdAt || report.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (reportsByDate.hasOwnProperty(dateStr)) {
            reportsByDate[dateStr]++;
        }
    });
    
    // Find max value for scaling
    const maxValue = Math.max(...Object.values(reportsByDate), 1);
    
    // Create simple bar chart
    let chartHTML = '<div class="simple-chart">';
    last7Days.forEach(day => {
        const count = reportsByDate[day];
        const percentage = (count / maxValue) * 100;
        chartHTML += `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${percentage}%" title="${count} reports">
                    <span class="bar-value">${count}</span>
                </div>
                <div class="chart-label">${day}</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartContainer.innerHTML = chartHTML;
}

// Create Severity Distribution Chart
function createSeverityDistributionChart(reports) {
    const chartContainer = document.querySelector('.chart-card:nth-child(2) .chart-placeholder');
    
    if (!reports || reports.length === 0) {
        chartContainer.innerHTML = `
            <i class="fas fa-chart-pie"></i>
            <p>No severity data available</p>
        `;
        return;
    }
    
    // Count severity levels
    const severityCounts = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
    };
    
    reports.forEach(report => {
        const severity = (report.severity || 'medium').toLowerCase();
        if (severityCounts.hasOwnProperty(severity)) {
            severityCounts[severity]++;
        }
    });
    
    const total = reports.length;
    
    // Create donut chart segments
    const severityColors = {
        low: '#4CAF50',
        medium: '#FF9800',
        high: '#FF5722',
        critical: '#D32F2F'
    };
    
    let chartHTML = '<div class="severity-chart">';
    
    Object.entries(severityCounts).forEach(([severity, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        chartHTML += `
            <div class="severity-item">
                <div class="severity-bar" style="width: ${percentage}%; background: ${severityColors[severity]}"></div>
                <div class="severity-info">
                    <span class="severity-name">${severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
                    <span class="severity-stats">${count} (${percentage}%)</span>
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

// Logout
function logout() {
    showConfirmModal('Logout', 'Are you sure you want to logout?', function() {
        sessionStorage.setItem('justLoggedOut', 'true');
        sessionStorage.removeItem('userType');
        window.location.href = 'index.html';
    });
}
