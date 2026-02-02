require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { db } = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Content Security Policy middleware
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' http://localhost:3000 ws://localhost:3000",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '));
    next();
});

app.use(express.static('public'));

// Serve static files
app.use(express.static(__dirname));

// API Routes

// User Registration
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const userRef = db.collection('users').where('email', '==', email);
        const existingUser = await userRef.get();

        if (!existingUser.empty) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Get the next user ID
        const usersSnapshot = await db.collection('users').orderBy('id', 'desc').limit(1).get();
        let nextId = 1;
        if (!usersSnapshot.empty) {
            nextId = usersSnapshot.docs[0].data().id + 1;
        }

        // Create new user
        const newUser = {
            id: nextId,
            name,
            email,
            phone,
            password,
            type: 'user',
            createdAt: new Date().toISOString()
        };

        await db.collection('users').doc(nextId.toString()).set(newUser);

        res.json({ success: true, message: 'Account created successfully', user: { id: newUser.id, name, email } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, emailOrUsername, password } = req.body;

        // Validate inputs exist
        if (!(email || emailOrUsername) || !password) {
            return res.status(400).json({ success: false, message: 'Email/Username and password are required' });
        }

        // Try to find user by either email or name
        let userSnapshot;
        if (email) {
            userSnapshot = await db.collection('users')
                .where('email', '==', email)
                .where('password', '==', password)
                .limit(1)
                .get();
        } else {
            // try by email first, then by name
            userSnapshot = await db.collection('users')
                .where('email', '==', emailOrUsername)
                .where('password', '==', password)
                .limit(1)
                .get();

            if (userSnapshot.empty) {
                userSnapshot = await db.collection('users')
                    .where('name', '==', emailOrUsername)
                    .where('password', '==', password)
                    .limit(1)
                    .get();
            }
        }

        if (!userSnapshot.empty) {
            const user = userSnapshot.docs[0].data();
            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: 'user'
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Admin Registration
app.post('/api/admin/signup', async (req, res) => {
    try {
        const { department, email, name, username, password } = req.body;

        // Validate inputs
        if (!department || !email || !name || !username || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate government email domain
        if (!email.endsWith('@gov.in')) {
            return res.status(400).json({ success: false, message: 'Admin email must be a valid government email ending with @gov.in' });
        }

        // Check if username or email already exists
        const usernameSnap = await db.collection('admins').where('username', '==', username).get();
        if (!usernameSnap.empty) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }

        const emailSnap = await db.collection('admins').where('email', '==', email).get();
        if (!emailSnap.empty) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Get next admin ID
        const adminsSnapshot = await db.collection('admins').orderBy('id', 'desc').limit(1).get();
        let nextId = 1;
        if (!adminsSnapshot.empty) {
            nextId = adminsSnapshot.docs[0].data().id + 1;
        }

        const newAdmin = {
            id: nextId,
            department,
            name,
            username,
            email,
            password,
            type: 'admin',
            createdAt: new Date().toISOString()
        };

        await db.collection('admins').doc(nextId.toString()).set(newAdmin);

        res.json({ success: true, message: 'Admin account created successfully', admin: { id: newAdmin.id, username, email } });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, emailOrUsername, username, password } = req.body;

        // Validate inputs exist
        if (!(email || emailOrUsername || username) || !password) {
            return res.status(400).json({ success: false, message: 'Email/Username/Username and password are required' });
        }

        const identifier = email || emailOrUsername || username;

        // Try email first, then username
        let adminSnapshot = await db.collection('admins')
            .where('email', '==', identifier)
            .where('password', '==', password)
            .limit(1)
            .get();

        if (adminSnapshot.empty) {
            adminSnapshot = await db.collection('admins')
                .where('username', '==', identifier)
                .where('password', '==', password)
                .limit(1)
                .get();
        }

        if (!adminSnapshot.empty) {
            const admin = adminSnapshot.docs[0].data();
            return res.json({
                success: true,
                message: 'Admin login successful',
                admin: {
                    id: admin.id,
                    username: admin.username,
                    type: 'admin'
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Submit Pothole Report
app.post('/api/reports', async (req, res) => {
    try {
        const { userId, location, count, severity, confidence, image } = req.body;

        // Get user from Firebase
        const userDoc = await db.collection('users').doc(userId.toString()).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = userDoc.data();

        // Get the next report ID
        const reportsSnapshot = await db.collection('reports').orderBy('id', 'desc').limit(1).get();
        let nextId = 1;
        if (!reportsSnapshot.empty) {
            nextId = reportsSnapshot.docs[0].data().id + 1;
        }

        const newReport = {
            id: nextId,
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

        await db.collection('reports').doc(nextId.toString()).set(newReport);

        res.json({ success: true, message: 'Report submitted successfully', report: newReport });
    } catch (error) {
        console.error('Report submission error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get User Reports
app.get('/api/reports/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const reportsSnapshot = await db.collection('reports').where('userId', '==', userId).get();
        const reports = reportsSnapshot.docs.map(doc => doc.data());

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get All Reports (Admin)
app.get('/api/reports', async (req, res) => {
    try {
        const reportsSnapshot = await db.collection('reports').get();
        const reports = reportsSnapshot.docs.map(doc => doc.data());

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update Report Status (Admin)
app.put('/api/reports/:reportId', async (req, res) => {
    try {
        const reportId = parseInt(req.params.reportId);
        const { status } = req.body;

        const reportRef = db.collection('reports').doc(reportId.toString());
        const reportDoc = await reportRef.get();

        if (!reportDoc.exists) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        await reportRef.update({
            status,
            updatedAt: new Date().toISOString()
        });

        const updatedReport = (await reportRef.get()).data();

        res.json({ success: true, message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get All Users (Admin)
app.get('/api/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => {
            const user = doc.data();
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get Statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const reportsSnapshot = await db.collection('reports').get();
        const usersSnapshot = await db.collection('users').get();

        const reports = reportsSnapshot.docs.map(doc => doc.data());
        const users = usersSnapshot.docs.map(doc => doc.data());

        const totalReports = reports.length;
        const pendingReports = reports.filter(r => r.status === 'pending').length;
        const resolvedReports = reports.filter(r => r.status === 'resolved').length;
        const totalUsers = users.length;

        // Get reports by severity
        const severityStats = {
            low: reports.filter(r => r.severity === 'low').length,
            medium: reports.filter(r => r.severity === 'medium').length,
            high: reports.filter(r => r.severity === 'high').length
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
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
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
