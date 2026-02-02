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

// Authentication handling
function showTab(tab) {
    const userForm = document.getElementById('userLoginForm');
    const adminForm = document.getElementById('adminLoginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.tab-btn');

    // Reset all forms
    userForm.classList.remove('active');
    adminForm.classList.remove('active');
    signupForm.classList.remove('active');
    tabs.forEach(t => t.classList.remove('active'));

    // Show selected tab
    if (tab === 'user') {
        userForm.classList.add('active');
        tabs[0].classList.add('active');
    } else if (tab === 'admin') {
        adminForm.classList.add('active');
        tabs[1].classList.add('active');
    }
}

function showSignup() {
    const forms = document.querySelectorAll('.login-form');
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById('signupForm').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
}

function showLogin() {
    showTab('user');
}

// User Login
document.getElementById('userLoginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    if (email && password) {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store user data
                localStorage.setItem('userId', result.user.id);
                localStorage.setItem('userEmail', result.user.email);
                localStorage.setItem('userName', result.user.name);
                localStorage.setItem('userType', 'user');
                
                // Set login success flag and redirect
                localStorage.setItem('justLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                showModal('Error', result.message || 'Invalid email or password', 'error');
            }
        } catch (error) {
            showModal('Error', 'Unable to connect to server. Please make sure the server is running.', 'error');
        }
    } else {
        showModal('Error', 'Please fill in all fields', 'error');
    }
});

// Admin Login
document.getElementById('adminLoginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username && password) {
        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store admin data
                localStorage.setItem('adminId', result.admin.id);
                localStorage.setItem('adminName', result.admin.username);
                localStorage.setItem('userType', 'admin');
                
                // Set login success flag and redirect
                localStorage.setItem('justLoggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                showModal('Error', result.message || 'Invalid admin credentials', 'error');
            }
        } catch (error) {
            showModal('Error', 'Unable to connect to server. Please make sure the server is running.', 'error');
        }
    } else {
        showModal('Error', 'Please fill in all fields', 'error');
    }
});

// Signup
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    if (name && email && phone && password) {
        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showModal('Success', 'Account created successfully! Please login.', 'success', function() {
                    showLogin();
                });
            } else {
                showModal('Error', result.message || 'Unable to create account', 'error');
            }
        } catch (error) {
            showModal('Error', 'Unable to connect to server. Please make sure the server is running.', 'error');
        }
    } else {
        showModal('Error', 'Please fill in all fields', 'error');
    }
});

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Check if just logged out and show toast
if (localStorage.getItem('justLoggedOut') === 'true') {
    localStorage.removeItem('justLoggedOut');
    showToast('Logged out successfully!', 'info');
}

// Check authentication on dashboard/admin pages
function checkAuth() {
    const userType = localStorage.getItem('userType');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html' && userType !== 'user') {
        window.location.href = 'index.html';
    } else if (currentPage === 'admin.html' && userType !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Run auth check on page load
if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html')) {
    checkAuth();
}
