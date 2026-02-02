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
document.getElementById('userLoginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    // Simple validation (in production, use backend authentication)
    if (email && password) {
        // Store user data
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userName', email.split('@')[0]);
        
        // Show success message
        Toastify({
            text: "Login successful!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
        }).showToast();
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        Toastify({
            text: "Please fill in all fields",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)"
        }).showToast();
    }
});

// Admin Login
document.getElementById('adminLoginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    // Simple admin validation (default: admin/admin123)
    if (username === 'admin' && password === 'admin123') {
        // Store admin data
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('adminName', username);
        
        Toastify({
            text: "Admin login successful!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
        }).showToast();
        window.location.href = 'admin.html';
    } else {
        Toastify({
            text: "Invalid admin credentials. Try admin/admin123",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)"
        }).showToast();
    }
});

// Signup
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    if (name && email && phone && password) {
        // Store user data
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPhone', phone);
        
        Toastify({
            text: "Account created successfully! Please login.",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
        }).showToast();
        showLogin();
    } else {
        Toastify({
            text: "Please fill in all fields",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)"
        }).showToast();
    }
});

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
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
