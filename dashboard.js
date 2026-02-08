// Dashboard functionality
let currentImage = null;
let detectionResults = null;

// ==================== MAP CONFIGURATION ====================
// Replace this with your LocationIQ API key
const LOCATIONIQ_API_KEY = 'pk.17a66f28fd65481575ebcd156c8b09f0';

// Map instances
let mapPicker = null;
let potholeMap = null;
let selectedMarker = null;
let selectedLocation = {
    lat: null,
    lng: null,
    address: null
};

// Default map center (you can change this to your city/region)
const DEFAULT_MAP_CENTER = [21.149619, 79.080760]; // New Delhi, India
const DEFAULT_ZOOM = 13;

// ==================== MAP PICKER FUNCTIONS ====================

/**
 * Opens the map picker modal for location selection
 */
function openMapPicker() {
    const modal = document.getElementById('mapPickerModal');
    modal.classList.add('show');
    
    // Initialize map picker if not already initialized
    setTimeout(() => {
        if (!mapPicker) {
            initMapPicker();
        } else {
            mapPicker.invalidateSize(); // Refresh map size
        }
    }, 100);
}

/**
 * Closes the map picker modal
 */
function closeMapPicker() {
    const modal = document.getElementById('mapPickerModal');
    modal.classList.remove('show');
}

/**
 * Initializes the map picker with LocationIQ tiles
 */
function initMapPicker() {
    // Check if API key is set
    if (LOCATIONIQ_API_KEY === 'YOUR_LOCATIONIQ_API_KEY_HERE') {
        showModal('API Key Required', 
            'Please add your LocationIQ API key in dashboard.js. Get a free key at locationiq.com', 
            'error');
        closeMapPicker();
        return;
    }
    
    // Create map instance
    mapPicker = L.map('mapPicker').setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);
    
    // Add LocationIQ tile layer
    L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`, {
        attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mapPicker);
    
    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                mapPicker.setView([userLat, userLng], 15);
                
                // Add a blue marker for user's location
                L.circleMarker([userLat, userLng], {
                    radius: 8,
                    fillColor: '#3498db',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(mapPicker)
                  .bindPopup('<b>Your Location</b>')
                  .openPopup();
            },
            (error) => {
                console.log('Geolocation error:', error);
                showToast('Could not get your location. Please click on map to select location.', 'info');
            }
        );
    }
    
    // Add click event to select location
    mapPicker.on('click', async function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Remove previous marker if exists
        if (selectedMarker) {
            mapPicker.removeLayer(selectedMarker);
        }
        
        // Add new marker
        selectedMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker high',
                html: '<i class="fas fa-exclamation-triangle"></i>',
                iconSize: [30, 30]
            })
        }).addTo(mapPicker);
        
        // Show loading state
        document.getElementById('selectedLocationInfo').style.display = 'block';
        document.getElementById('selectedAddress').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting address...';
        document.getElementById('selectedCoords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Perform reverse geocoding
        const address = await reverseGeocode(lat, lng);
        
        // Store selected location
        selectedLocation = {
            lat: lat,
            lng: lng,
            address: address
        };
        
        // Update UI
        document.getElementById('selectedAddress').textContent = address;
        document.getElementById('confirmLocationBtn').disabled = false;
        
        // Add popup to marker
        selectedMarker.bindPopup(`<b>Selected Location</b><br>${address}`).openPopup();
    });
}

/**
 * Performs reverse geocoding using LocationIQ API
 */
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`
        );
        
        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }
        
        const data = await response.json();
        
        // Format address from the response
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        return address;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        showToast('Could not get address. Please check your API key.', 'error');
        return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
}

/**
 * Confirms the selected location and closes the modal
 */
function confirmLocation() {
    if (!selectedLocation.lat || !selectedLocation.lng) {
        showToast('Please select a location on the map first', 'warning');
        return;
    }
    
    // Fill the form fields
    document.getElementById('locationInput').value = selectedLocation.address;
    document.getElementById('latitudeInput').value = selectedLocation.lat;
    document.getElementById('longitudeInput').value = selectedLocation.lng;
    
    // Log for debugging
    console.log('✅ Location confirmed and set:', {
        address: selectedLocation.address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
    });
    
    // Show success message
    showToast('Location selected successfully!', 'success');
    
    // Close modal
    closeMapPicker();
    
    // Reset for next use
    document.getElementById('selectedLocationInfo').style.display = 'none';
    document.getElementById('confirmLocationBtn').disabled = true;
}

// ==================== POTHOLE MAP FUNCTIONS ====================

/**
 * Initializes the pothole map in the Map section
 */
function initPotholeMap() {
    // Check if API key is set
    if (LOCATIONIQ_API_KEY === 'YOUR_LOCATIONIQ_API_KEY_HERE') {
        document.getElementById('potholeMap').innerHTML = 
            '<div style="padding: 40px; text-align: center; color: #e74c3c;"><i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i><p>Please add your LocationIQ API key in dashboard.js<br>Get a free key at <a href="https://locationiq.com" target="_blank">locationiq.com</a></p></div>';
        return;
    }
    
    // Create map instance
    potholeMap = L.map('potholeMap').setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);
    
    // Add LocationIQ tile layer
    L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`, {
        attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(potholeMap);
    
    // Load and display potholes
    loadPotholesOnMap();
}

/**
 * Loads all pothole reports and displays them on the map
 */
async function loadPotholesOnMap() {
    try {
        const userId = sessionStorage.getItem('userId');
        const response = await fetch(`http://localhost:3000/api/reports?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load reports');
        }
        
        const result = await response.json();
        
        if (!result.success || !result.reports || result.reports.length === 0) {
            // No reports to display
            L.marker(DEFAULT_MAP_CENTER).addTo(potholeMap)
                .bindPopup('<b>No potholes reported yet</b><br>Start by reporting your first pothole!')
                .openPopup();
            return;
        }
        
        // Add markers for each pothole
        const bounds = [];
        
        result.reports.forEach(report => {
            // Only add if coordinates are available
            if (report.latitude && report.longitude) {
                const lat = parseFloat(report.latitude);
                const lng = parseFloat(report.longitude);
                
                // Determine marker color based on urgency
                const urgencyClass = report.urgency || 'medium';
                
                // Create custom marker
                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: `custom-marker ${urgencyClass}`,
                        html: '<i class="fas fa-exclamation-triangle"></i>',
                        iconSize: [30, 30]
                    })
                }).addTo(potholeMap);
                
                // Create popup content
                const popupContent = `
                    <div class="pothole-popup">
                        <h4><i class="fas fa-road"></i> Pothole Report</h4>
                        <p><strong>Location:</strong> ${report.location || 'N/A'}</p>
                        <p><strong>Street:</strong> ${report.street || 'N/A'}</p>
                        <p><strong>Status:</strong> ${report.status || 'Pending'}</p>
                        <p><strong>Reported:</strong> ${new Date(report.timestamp).toLocaleDateString()}</p>
                        <span class="urgency-badge ${urgencyClass}">${urgencyClass} urgency</span>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                
                // Add to bounds
                bounds.push([lat, lng]);
            }
        });
        
        // Fit map to show all markers
        if (bounds.length > 0) {
            potholeMap.fitBounds(bounds, { padding: [50, 50] });
        }
        
    } catch (error) {
        console.error('Error loading potholes on map:', error);
        showToast('Error loading pothole locations', 'error');
    }
}

/**
 * Refreshes the pothole map
 */
function refreshPotholeMap() {
    if (potholeMap) {
        // Clear existing layers except the tile layer
        potholeMap.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                potholeMap.removeLayer(layer);
            }
        });
        
        // Reload potholes
        loadPotholesOnMap();
        showToast('Map refreshed!', 'success');
    }
}

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
    
    // Initialize map when map section is shown
    if (section === 'map') {
        setTimeout(() => {
            if (!potholeMap) {
                initPotholeMap();
            } else {
                potholeMap.invalidateSize(); // Refresh map size
                refreshPotholeMap(); // Reload markers
            }
        }, 100);
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
    
    // Get coordinates from map picker
    const latitude = document.getElementById('latitudeInput').value;
    const longitude = document.getElementById('longitudeInput').value;

    // Validate required fields
    if (!currentImage || !image) {
        showModal('Validation Error', 'Please upload a photo or video and run analysis before submitting.', 'error');
        return;
    }

    if (!location) {
        showModal('Validation Error', 'Please provide a location for the report. Use the "Pick on Map" button.', 'error');
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
            image,
            latitude: latitude || null,
            longitude: longitude || null
        };
        
        console.log('📍 Location being submitted:', location); // DEBUG
        console.log('📍 Coordinates being submitted:', { latitude, longitude }); // DEBUG
        console.log('📦 Full report payload:', reportPayload); // DEBUG
        
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
                document.getElementById('latitudeInput').value = '';
                document.getElementById('longitudeInput').value = '';
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
                    <div class="report-actions" style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
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
                    </div>
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

// ==================== PHOTO VIEWER FUNCTIONS ====================

let locationMapInstance = null;

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
                '<div style="padding: 40px; text-align: center; color: #e74c3c;"><i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i><p>Please add your LocationIQ API key in dashboard.js</p></div>';
            return;
        }
        
        // Create map instance
        locationMapInstance = L.map('locationMapViewer').setView([lat, lng], 16);
        
        // Add LocationIQ tile layer
        L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`, {
            attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(locationMapInstance);
        
        // Add marker for the pothole location
        L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker high',
                html: '<i class="fas fa-exclamation-triangle"></i>',
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

// Logout
function logout() {
    showConfirmModal('Logout', 'Are you sure you want to logout?', function() {
        sessionStorage.setItem('justLoggedOut', 'true');
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}
