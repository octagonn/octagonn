// Customer Portal JavaScript - Updated for Staff-Only Ticket Creation
let currentCustomer = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuthentication();
    
    // Initialize portal
    if (currentUser && currentCustomer) {
        initializePortal();
    }
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        currentUser = await SpyderNetDB.auth.getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Get customer data
        const customerResult = await SpyderNetDB.db.customers.getByUserId(currentUser.id);
        if (customerResult.success) {
            currentCustomer = customerResult.data;
        } else {
            console.error('Error getting customer data:', customerResult.error);
        }
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
    }
}

// Initialize portal functionality
async function initializePortal() {
    // Set customer name
    document.getElementById('customerName').textContent = currentCustomer.full_name || 'Customer';
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    await loadDashboardData();
    
    // Setup tabs
    setupTabs();
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        const result = await SpyderNetDB.auth.signOut();
        if (result.success) {
            window.location.href = 'index.html';
        }
    });

    // Schedule appointment button
    document.getElementById('scheduleBtn').addEventListener('click', function() {
        showAppointmentModal();
    });

    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        toggleProfileEdit(true);
    });

    // Cancel edit button
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        toggleProfileEdit(false);
    });

    // Profile edit form
    document.getElementById('profileEditForm').addEventListener('submit', handleProfileUpdate);

    // Appointment form
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });

    // Close modal on outside click
    document.getElementById('appointmentModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAllModals();
        }
    });

    document.getElementById('ticketModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAllModals();
        }
    });
}

// Setup tab functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab
            this.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Load tab-specific data
            switch(tabName) {
                case 'tickets':
                    loadTickets();
                    break;
                case 'appointments':
                    loadAppointments();
                    break;
                case 'profile':
                    loadProfile();
                    break;
            }
        });
    });

    // Load initial tickets
    loadTickets();
}

// Load dashboard statistics
async function loadDashboardData() {
    try {
        // Get tickets
        const ticketsResult = await SpyderNetDB.db.tickets.getByCustomerId(currentCustomer.id);
        if (ticketsResult.success) {
            const tickets = ticketsResult.data;
            const activeTickets = tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
            const completedServices = tickets.filter(t => t.status === 'completed').length;
            
            document.getElementById('activeTickets').textContent = activeTickets;
            document.getElementById('completedServices').textContent = completedServices;
        }

        // Get appointments
        const appointmentsResult = await SpyderNetDB.db.appointments.getByCustomerId(currentCustomer.id);
        if (appointmentsResult.success) {
            const appointments = appointmentsResult.data;
            const upcomingAppointments = appointments.filter(a => {
                const appointmentDate = new Date(a.appointment_date + ' ' + a.appointment_time);
                return appointmentDate > new Date() && (a.status === 'scheduled' || a.status === 'confirmed');
            }).length;
            
            document.getElementById('upcomingAppointments').textContent = upcomingAppointments;
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load tickets
async function loadTickets() {
    const ticketsList = document.getElementById('ticketsList');
    
    try {
        ticketsList.innerHTML = '<div class="loading">Loading tickets...</div>';
        
        const result = await SpyderNetDB.db.tickets.getByCustomerId(currentCustomer.id);
        
        if (result.success) {
            const tickets = result.data;
            
            if (tickets.length === 0) {
                ticketsList.innerHTML = `
                    <div class="empty-state glass-card">
                        <i class="ph-light ph-ticket"></i>
                        <h4>No Service Tickets</h4>
                        <p>Our support team will create tickets for your service requests.</p>
                        <a href="contact.html" class="btn btn-primary">Contact Support</a>
                    </div>
                `;
                return;
            }
            
            ticketsList.innerHTML = tickets.map(ticket => `
                <div class="ticket-card glass-card" data-ticket-id="${ticket.id}">
                    <div class="ticket-header">
                        <h4>${ticket.title}</h4>
                        <span class="status-badge ${SpyderNetDB.utils.getStatusColor(ticket.status)}">
                            ${SpyderNetDB.utils.formatStatus(ticket.status)}
                        </span>
                    </div>
                    <p class="ticket-description">${ticket.description}</p>
                    <div class="ticket-meta">
                        <div class="ticket-date">
                            <i class="ph-light ph-calendar"></i>
                            Created: ${SpyderNetDB.utils.formatDate(ticket.created_at)}
                        </div>
                        <div class="ticket-priority">
                            <i class="ph-light ph-flag"></i>
                            Priority: ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                            <i class="ph-light ph-eye"></i>
                            View Details
                        </button>
                    </div>
                </div>
            `).join('');
            
        } else {
            ticketsList.innerHTML = `
                <div class="error-state glass-card">
                    <i class="ph-light ph-warning"></i>
                    <h4>Error Loading Tickets</h4>
                    <p>${result.error}</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        ticketsList.innerHTML = `
            <div class="error-state glass-card">
                <i class="ph-light ph-warning"></i>
                <h4>Error Loading Tickets</h4>
                <p>An unexpected error occurred.</p>
            </div>
        `;
    }
}

// View ticket details and messages
async function viewTicketDetails(ticketId) {
    try {
        // Get ticket details
        const ticketResult = await SpyderNetDB.db.tickets.getById(ticketId);
        if (!ticketResult.success) {
            showNotification('Error loading ticket details', 'error');
            return;
        }
        
        const ticket = ticketResult.data;
        
        // Get ticket messages
        const messagesResult = await SpyderNetDB.db.messages.getByTicketId(ticketId);
        const messages = messagesResult.success ? messagesResult.data : [];
        
        // Update modal content
        document.getElementById('ticketModalTitle').textContent = `Ticket: ${ticket.title}`;
        
        const modalContent = document.getElementById('ticketModalContent');
        modalContent.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-info">
                    <div class="info-row">
                        <label>Status:</label>
                        <span class="status-badge ${SpyderNetDB.utils.getStatusColor(ticket.status)}">
                            ${SpyderNetDB.utils.formatStatus(ticket.status)}
                        </span>
                    </div>
                    <div class="info-row">
                        <label>Priority:</label>
                        <span>${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</span>
                    </div>
                    <div class="info-row">
                        <label>Created:</label>
                        <span>${SpyderNetDB.utils.formatDate(ticket.created_at)}</span>
                    </div>
                </div>
                
                <div class="ticket-description">
                    <h4>Description:</h4>
                    <p>${ticket.description}</p>
                </div>
                
                <div class="ticket-messages">
                    <h4>Communication:</h4>
                    <div class="messages-list" id="messagesList">
                        ${messages.length === 0 ? 
                            '<p class="no-messages">No messages yet. Send a message to communicate with our support team.</p>' : 
                            messages.map(msg => `
                                <div class="message ${msg.is_from_staff ? 'staff-message' : 'customer-message'}">
                                    <div class="message-header">
                                        <span class="message-author">${msg.is_from_staff ? 'Support Team' : 'You'}</span>
                                        <span class="message-time">${SpyderNetDB.utils.formatTime(msg.created_at)}</span>
                                    </div>
                                    <div class="message-content">${msg.message}</div>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    ${ticket.status !== 'completed' && ticket.status !== 'cancelled' ? `
                        <form id="messageForm" class="message-form" data-ticket-id="${ticketId}">
                            <div class="form-group">
                                <textarea id="messageText" placeholder="Type your message here..." rows="3" required></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="ph-light ph-paper-plane"></i>
                                    Send Message
                                </button>
                            </div>
                        </form>
                    ` : '<p class="ticket-closed">This ticket has been closed. Contact support if you need further assistance.</p>'}
                </div>
            </div>
        `;
        
        // Setup message form if ticket is active
        if (ticket.status !== 'completed' && ticket.status !== 'cancelled') {
            const messageForm = document.getElementById('messageForm');
            messageForm.addEventListener('submit', handleMessageSubmit);
        }
        
        // Show modal
        document.getElementById('ticketModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error viewing ticket details:', error);
        showNotification('Error loading ticket details', 'error');
    }
}

// Handle message submission
async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const ticketId = e.target.dataset.ticketId;
    const messageText = document.getElementById('messageText').value.trim();
    
    if (!messageText) return;
    
    const button = e.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
    
    try {
        const messageData = {
            ticket_id: ticketId,
            customer_id: currentCustomer.id,
            message: messageText
        };
        
        const result = await SpyderNetDB.db.messages.create(messageData);
        
        if (result.success) {
            // Add message to UI
            const messagesList = document.getElementById('messagesList');
            const noMessages = messagesList.querySelector('.no-messages');
            if (noMessages) {
                noMessages.remove();
            }
            
            const newMessage = document.createElement('div');
            newMessage.className = 'message customer-message';
            newMessage.innerHTML = `
                <div class="message-header">
                    <span class="message-author">You</span>
                    <span class="message-time">Just now</span>
                </div>
                <div class="message-content">${messageText}</div>
            `;
            messagesList.appendChild(newMessage);
            
            // Clear form
            document.getElementById('messageText').value = '';
            
            showNotification('Message sent successfully!', 'success');
        } else {
            showNotification('Error sending message: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="ph-light ph-paper-plane"></i> Send Message';
    }
}

// Load appointments
async function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    
    try {
        appointmentsList.innerHTML = '<div class="loading">Loading appointments and requests...</div>';
        
        // Load both appointments and appointment requests
        const [appointmentsResult, requestsResult] = await Promise.all([
            SpyderNetDB.db.appointments.getByCustomerId(currentCustomer.id),
            SpyderNetDB.db.appointmentRequests.getByCustomerId(currentCustomer.id)
        ]);
        
        let combinedItems = [];
        
        // Add confirmed appointments
        if (appointmentsResult.success) {
            appointmentsResult.data.forEach(appointment => {
                combinedItems.push({
                    ...appointment,
                    type: 'appointment',
                    date: appointment.appointment_date,
                    time: appointment.appointment_time
                });
            });
        }
        
        // Add appointment requests
        if (requestsResult.success) {
            requestsResult.data.forEach(request => {
                combinedItems.push({
                    ...request,
                    type: 'request',
                    date: request.requested_date,
                    time: request.requested_time
                });
            });
        }
        
        // Sort by date
        combinedItems.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
        
        if (combinedItems.length === 0) {
            appointmentsList.innerHTML = `
                <div class="empty-state glass-card">
                    <i class="ph-light ph-calendar"></i>
                    <h4>No Appointments or Requests</h4>
                    <p>You don't have any appointments or requests yet.</p>
                    <button class="btn btn-primary" onclick="showAppointmentModal()">Request Appointment</button>
                </div>
            `;
            return;
        }
        
        appointmentsList.innerHTML = combinedItems.map(item => {
            const itemDate = new Date(item.date + ' ' + item.time);
            const isUpcoming = itemDate > new Date();
            const isRequest = item.type === 'request';
            
            return `
                <div class="appointment-card glass-card ${!isUpcoming ? 'past-appointment' : ''} ${isRequest ? 'appointment-request' : ''}">
                    <div class="appointment-header">
                        <div class="appointment-datetime">
                            <i class="ph-light ph-calendar"></i>
                            <span class="date">${SpyderNetDB.utils.formatDate(item.date)}</span>
                            <span class="time">${formatTime(item.time)}</span>
                        </div>
                        <div class="appointment-badges">
                            ${isRequest ? '<span class="type-badge">Request</span>' : '<span class="type-badge confirmed">Appointment</span>'}
                            <span class="status-badge ${SpyderNetDB.utils.getStatusColor(item.status)}">
                                ${SpyderNetDB.utils.formatStatus(item.status)}
                            </span>
                        </div>
                    </div>
                    ${item.notes ? `<p class="appointment-notes">${item.notes}</p>` : ''}
                    ${item.staff_response ? `<p class="staff-response"><strong>Staff Response:</strong> ${item.staff_response}</p>` : ''}
                    <div class="appointment-meta">
                        ${isRequest ? 
                            `<span class="request-info">Requested on ${SpyderNetDB.utils.formatDate(item.created_at)}</span>` :
                            `<span class="duration">${item.duration_minutes || 60} minutes</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading appointments and requests:', error);
        appointmentsList.innerHTML = `
            <div class="error-state glass-card">
                <i class="ph-light ph-warning"></i>
                <h4>Error Loading Appointments</h4>
                <p>An unexpected error occurred.</p>
            </div>
        `;
    }
}

// Load profile data
function loadProfile() {
    document.getElementById('profileName').textContent = currentCustomer.full_name || '-';
    document.getElementById('profileEmail').textContent = currentCustomer.email || '-';
    document.getElementById('profilePhone').textContent = currentCustomer.phone || '-';
    document.getElementById('profileAddress').textContent = currentCustomer.address || '-';
    
    // Populate edit form
    document.getElementById('editName').value = currentCustomer.full_name || '';
    document.getElementById('editPhone').value = currentCustomer.phone || '';
    document.getElementById('editAddress').value = currentCustomer.address || '';
}

// Toggle profile edit mode
function toggleProfileEdit(edit) {
    const display = document.getElementById('profileDisplay');
    const form = document.getElementById('profileEditForm');
    
    if (edit) {
        display.style.display = 'none';
        form.style.display = 'block';
    } else {
        display.style.display = 'block';
        form.style.display = 'none';
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const updates = {
        full_name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value
    };
    
    try {
        const result = await SpyderNetDB.db.customers.update(currentCustomer.id, updates);
        
        if (result.success) {
            currentCustomer = result.data;
            loadProfile();
            toggleProfileEdit(false);
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification('Error updating profile: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('An error occurred while updating your profile.', 'error');
    }
}

// Show appointment modal
async function showAppointmentModal() {
    // Load available tickets for the dropdown
    try {
        const ticketsResult = await SpyderNetDB.db.tickets.getByCustomerId(currentCustomer.id);
        const ticketSelect = document.getElementById('appointmentTicket');
        
        // Clear existing options (keep the "General Appointment" option)
        ticketSelect.innerHTML = '<option value="">General Appointment</option>';
        
        if (ticketsResult.success) {
            const openTickets = ticketsResult.data.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
            openTickets.forEach(ticket => {
                const option = document.createElement('option');
                option.value = ticket.id;
                option.textContent = `#${ticket.id.slice(-8)} - ${ticket.title}`;
                ticketSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading tickets for appointment request:', error);
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Show modal
    document.getElementById('appointmentModal').style.display = 'flex';
}

// Handle appointment submission
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const requestData = {
        customer_id: currentCustomer.id,
        ticket_id: document.getElementById('appointmentTicket').value || null,
        requested_date: document.getElementById('appointmentDate').value,
        requested_time: document.getElementById('appointmentTime').value,
        notes: document.getElementById('appointmentNotes').value
    };
    
    const button = e.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.innerHTML = '<i class="ph-light ph-spinner"></i> Sending Request...';
    
    try {
        const result = await SpyderNetDB.db.appointmentRequests.create(requestData);
        
        if (result.success) {
            showNotification('Appointment request sent successfully! Our staff will review and contact you soon.', 'success');
            closeAllModals();
            document.getElementById('appointmentForm').reset();
            
            // Refresh data
            await loadDashboardData();
            if (document.getElementById('appointmentsTab').classList.contains('active')) {
                loadAppointments();
            }
        } else {
            showNotification('Error sending appointment request: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error sending appointment request:', error);
        showNotification('An error occurred while sending your appointment request.', 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Request Appointment';
    }
}

// Close all modals
function closeAllModals() {
    document.getElementById('appointmentModal').style.display = 'none';
    document.getElementById('ticketModal').style.display = 'none';
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => hideNotification(notification), 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
}

// Hide notification
function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Make viewTicketDetails globally accessible
window.viewTicketDetails = viewTicketDetails;
window.showAppointmentModal = showAppointmentModal; 