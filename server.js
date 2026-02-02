const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Serve static files
app.use(express.static(__dirname));

// Data storage file
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        users: [
            {
                id: 1,
                name: 'Demo User',
                email: 'user@demo.com',
                password: 'user123',
                phone: '1234567890',
                type: 'user',
                createdAt: new Date().toISOString()
            }
        ],
        admins: [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                type: 'admin',
                createdAt: new Date().toISOString()
            }
        ],
        reports: []
    }, null, 2));
}

// Helper functions
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// User Registration
app.post('/api/signup', (req, res) => {
    const { name, email, phone, password } = req.body;
    
    const data = readData();
    
    // Check if user already exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Create new user
    const newUser = {
        id: data.users.length + 1,
        name,
        email,
        phone,
        password,
        type: 'user',
        createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    writeData(data);
    
    res.json({ success: true, message: 'Account created successfully', user: { id: newUser.id, name, email } });
});

// User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Validate inputs exist
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const data = readData();
    // Strict exact match - both email AND password must match exactly
    const user = data.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                type: 'user' 
            } 
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validate inputs exist
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    
    const data = readData();
    // Strict exact match - both username AND password must match exactly
    const admin = data.admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        res.json({ 
            success: true, 
            message: 'Admin login successful', 
            admin: { 
                id: admin.id, 
                username: admin.username, 
                type: 'admin' 
            } 
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
});

// Submit Pothole Report
app.post('/api/reports', (req, res) => {
    const { userId, location, count, severity, confidence, image } = req.body;
    
    const data = readData();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const newReport = {
        id: data.reports.length + 1,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        location,
        count,
        severity,
        confidence,
        image,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    data.reports.push(newReport);
    writeData(data);
    
    res.json({ success: true, message: 'Report submitted successfully', report: newReport });
});

// Get User Reports
app.get('/api/reports/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    
    const data = readData();
    const userReports = data.reports.filter(r => r.userId === userId);
    
    res.json({ success: true, reports: userReports });
});

// Get All Reports (Admin)
app.get('/api/reports', (req, res) => {
    const data = readData();
    res.json({ success: true, reports: data.reports });
});

// Update Report Status (Admin)
app.put('/api/reports/:reportId', (req, res) => {
    const reportId = parseInt(req.params.reportId);
    const { status } = req.body;
    
    const data = readData();
    const reportIndex = data.reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
        return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    data.reports[reportIndex].status = status;
    data.reports[reportIndex].updatedAt = new Date().toISOString();
    
    writeData(data);
    
    res.json({ success: true, message: 'Report updated successfully', report: data.reports[reportIndex] });
});

// Get All Users (Admin)
app.get('/api/users', (req, res) => {
    const data = readData();
    const users = data.users.map(({ password, ...user }) => user);
    res.json({ success: true, users });
});

// Get Statistics
app.get('/api/statistics', (req, res) => {
    const data = readData();
    
    const totalReports = data.reports.length;
    const pendingReports = data.reports.filter(r => r.status === 'pending').length;
    const resolvedReports = data.reports.filter(r => r.status === 'resolved').length;
    const totalUsers = data.users.length;
    
    // Get reports by severity
    const severityStats = {
        low: data.reports.filter(r => r.severity === 'low').length,
        medium: data.reports.filter(r => r.severity === 'medium').length,
        high: data.reports.filter(r => r.severity === 'high').length
    };
    
    res.json({
        success: true,
        statistics: {
            totalReports,
            pendingReports,
            resolvedReports,
            totalUsers,
            severityStats
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Pothole Detection Server is running!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`\n🔐 Admin Login: admin / admin123`);
    console.log(`👤 User Login: user@demo.com / user123\n`);
});
