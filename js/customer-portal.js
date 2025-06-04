// Customer Portal JavaScript - Simplified & User-Friendly Interface
let currentCustomer = null;
let currentUser = null;
let allTickets = [];
let currentTicketId = null;

// Initialize portal when DOM loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Customer Portal initializing...');
    
    // Check authentication
    await checkAuthentication();
    
    // Initialize portal if authenticated
    if (currentUser && currentCustomer) {
        await initializePortal();
    }
});

/**
 * Check if user is authenticated and get customer data
 */
async function checkAuthentication() {
    try {
        // Check if supabase is available
        if (!supabase) {
            console.error('Supabase not initialized');
            redirectToLogin();
            return;
        }

        // Get current user
        currentUser = await auth.getCurrentUser();
        
        if (!currentUser) {
            console.log('No authenticated user found');
            redirectToLogin();
            return;
        }

        console.log('Authenticated user:', currentUser.email);

        // Get customer data
        const customerResult = await db.customers.getByUserId(currentUser.id);
        if (customerResult.success) {
            currentCustomer = customerResult.data;
            console.log('Customer data loaded:', currentCustomer);
        } else {
            console.error('Error getting customer data:', customerResult.error);
            // Customer might not exist in customers table, redirect to login
            redirectToLogin();
        }
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        redirectToLogin();
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = 'login.html';
}

/**
 * Initialize portal functionality
 */
async function initializePortal() {
    try {
        console.log('Initializing portal for customer:', currentCustomer.full_name);
        
        // Set customer name in UI
        const customerNameElements = document.querySelectorAll('#customerName');
        customerNameElements.forEach(el => {
            el.textContent = currentCustomer.full_name || currentCustomer.email || 'Customer';
        });

        // Pre-fill create ticket form
        document.getElementById('ticketName').value = currentCustomer.full_name || '';
        document.getElementById('ticketEmail').value = currentCustomer.email || '';

        // Setup event listeners
        setupEventListeners();
        
        // Load dashboard data
        await loadDashboardData();
        
        console.log('Portal initialized successfully');
        
    } catch (error) {
        console.error('Error initializing portal:', error);
        showMessage('Error initializing portal', 'error');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation
    setupNavigationListeners();
    
    // Create ticket form
    setupCreateTicketForm();
    
    // Reply form
    setupReplyForm();
    
    // Search functionality
    setupSearchListeners();
    
    // File upload
    setupFileUpload();
}

/**
 * Setup navigation event listeners
 */
function setupNavigationListeners() {
    // Add click handlers for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
}

/**
 * Setup create ticket form
 */
function setupCreateTicketForm() {
    const form = document.getElementById('createTicketForm');
    if (form) {
        form.addEventListener('submit', handleCreateTicket);
    }
}

/**
 * Setup reply form
 */
function setupReplyForm() {
    const form = document.getElementById('replyForm');
    if (form) {
        form.addEventListener('submit', handleReplySubmit);
    }
}

/**
 * Setup search listeners
 */
function setupSearchListeners() {
    const searchInput = document.getElementById('ticketsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTickets(this.value);
        });
    }
}

/**
 * Setup file upload functionality
 */
function setupFileUpload() {
    const fileInput = document.getElementById('ticketAttachments');
    const fileList = document.getElementById('file-list');
    
    if (fileInput && fileList) {
        fileInput.addEventListener('change', function() {
            displaySelectedFiles(this.files, fileList);
        });
    }
}

/**
 * Display selected files
 */
function displaySelectedFiles(files, container) {
    container.innerHTML = '';
    
    if (files.length === 0) return;
    
    const fileContainer = document.createElement('div');
    fileContainer.style.marginTop = '1rem';
    
    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9rem;
        `;
        
        fileItem.innerHTML = `
            <span><i class="ph-light ph-file"></i> ${file.name} (${formatFileSize(file.size)})</span>
        `;
        
        fileContainer.appendChild(fileItem);
    });
    
    container.appendChild(fileContainer);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show specific section and update navigation
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'home':
            loadDashboardData();
            break;
        case 'my-tickets':
            loadTickets();
            break;
        case 'create-ticket':
            // Form is already pre-filled
            break;
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Get tickets
        const ticketsResult = await db.tickets.getByCustomerId(currentCustomer.id);
        if (ticketsResult.success) {
            allTickets = ticketsResult.data || [];
            
            const activeTickets = allTickets.filter(t => 
                t.status === 'new' || t.status === 'in_progress'
            ).length;
            
            const completedTickets = allTickets.filter(t => 
                t.status === 'completed'
            ).length;
            
            // Update dashboard stats
            document.getElementById('activeTickets').textContent = activeTickets;
            document.getElementById('completedTickets').textContent = completedTickets;
        }

        // Get appointments
        const appointmentsResult = await db.appointments.getByCustomerId(currentCustomer.id);
        if (appointmentsResult.success) {
            const appointments = appointmentsResult.data || [];
            const upcomingAppointments = appointments.filter(a => {
                const appointmentDate = new Date(a.appointment_date + ' ' + a.appointment_time);
                return appointmentDate > new Date() && 
                       (a.status === 'scheduled' || a.status === 'confirmed');
            }).length;
            
            document.getElementById('upcomingAppointments').textContent = upcomingAppointments;
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Handle create ticket form submission
 */
async function handleCreateTicket(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const messageDiv = document.getElementById('create-ticket-message');
    
    try {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Submitting...';
        
        // Get form data
        const formData = {
            name: document.getElementById('ticketName').value.trim(),
            email: document.getElementById('ticketEmail').value.trim(),
            subject: document.getElementById('ticketSubject').value.trim(),
            message: document.getElementById('ticketDescription').value.trim(),
            is_from_customer: true,
            customer_id: currentCustomer.id
        };
        
        // Validate required fields
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            throw new Error('Please fill in all required fields');
        }
        
        console.log('Submitting contact form:', formData);
        
        // Submit as contact submission (staff will convert to ticket)
        const result = await db.contacts.create(formData);
        
        if (result.success) {
            showMessage('Your request has been submitted successfully! Our team will review it and create a support ticket for you.', 'success', messageDiv);
            
            // Reset form
            e.target.reset();
            document.getElementById('file-list').innerHTML = '';
            
            // Pre-fill customer info again
            document.getElementById('ticketName').value = currentCustomer.full_name || '';
            document.getElementById('ticketEmail').value = currentCustomer.email || '';
            
            // Refresh dashboard data
            setTimeout(() => {
                loadDashboardData();
            }, 1000);
            
        } else {
            throw new Error(result.error || 'Failed to submit request');
        }
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        showMessage(error.message, 'error', messageDiv);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-light ph-paper-plane-right"></i> Submit Request';
    }
}

/**
 * Load and display tickets
 */
async function loadTickets() {
    const ticketsList = document.getElementById('ticketsList');
    
    try {
        ticketsList.innerHTML = '<div class="loading">Loading your tickets...</div>';
        
        const result = await db.tickets.getByCustomerId(currentCustomer.id);
        
        if (result.success) {
            allTickets = result.data || [];
            displayTickets(allTickets);
        } else {
            ticketsList.innerHTML = `
                <div class="error">
                    <i class="ph-light ph-warning"></i>
                    Error loading tickets: ${result.error}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        ticketsList.innerHTML = `
            <div class="error">
                <i class="ph-light ph-warning"></i>
                An unexpected error occurred while loading tickets.
            </div>
        `;
    }
}

/**
 * Display tickets in the table
 */
function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-ticket" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4 style="margin-bottom: 1rem;">No Support Tickets</h4>
                <p>You don't have any support tickets yet.</p>
                <button class="create-ticket-cta" onclick="showSection('create-ticket')" style="margin-top: 1rem; font-size: 1rem; padding: 0.75rem 1.5rem;">
                    <i class="ph-light ph-plus-circle"></i>
                    Create Your First Ticket
                </button>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-row" onclick="openTicketDetail('${ticket.id}')">
            <div class="ticket-number">#${ticket.id.substring(0, 8)}</div>
            <div class="ticket-subject">${escapeHtml(ticket.title)}</div>
            <div>
                <span class="status-badge ${getStatusClass(ticket.status)}">
                    ${formatStatus(ticket.status)}
                </span>
            </div>
            <div class="ticket-date">${formatDate(ticket.created_at)}</div>
        </div>
    `).join('');
}

/**
 * Filter tickets based on search term
 */
function filterTickets(searchTerm) {
    if (!searchTerm.trim()) {
        displayTickets(allTickets);
        return;
    }
    
    const filtered = allTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displayTickets(filtered);
}

/**
 * Open ticket detail modal
 */
async function openTicketDetail(ticketId) {
    currentTicketId = ticketId;
    const modal = document.getElementById('ticketModal');
    const titleElement = document.getElementById('modalTicketTitle');
    const detailsElement = document.getElementById('ticketDetails');
    const conversationElement = document.getElementById('ticketConversation');
    
    // Show modal
    modal.style.display = 'block';
    
    try {
        // Reset content
        titleElement.textContent = 'Loading...';
        detailsElement.innerHTML = '<div class="loading">Loading ticket details...</div>';
        conversationElement.innerHTML = '<div class="loading">Loading conversation...</div>';
        
        // Get ticket details
        const ticketResult = await db.tickets.getById(ticketId);
        if (!ticketResult.success) {
            throw new Error(ticketResult.error);
        }
        
        const ticket = ticketResult.data;
        
        // Update modal title
        titleElement.textContent = `#${ticket.id.substring(0, 8)} - ${ticket.title}`;
        
        // Display ticket details
        detailsElement.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <strong style="color: #7877c6;">Status:</strong><br>
                    <span class="status-badge ${getStatusClass(ticket.status)}">${formatStatus(ticket.status)}</span>
                </div>
                <div>
                    <strong style="color: #7877c6;">Priority:</strong><br>
                    <span style="color: rgba(255, 255, 255, 0.8);">${formatPriority(ticket.priority)}</span>
                </div>
                <div>
                    <strong style="color: #7877c6;">Created:</strong><br>
                    <span style="color: rgba(255, 255, 255, 0.8);">${formatDate(ticket.created_at)}</span>
                </div>
            </div>
            <div>
                <strong style="color: #7877c6;">Description:</strong><br>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.5; margin-top: 0.5rem;">${escapeHtml(ticket.description)}</p>
            </div>
        `;
        
        // Load conversation
        await loadTicketConversation(ticketId);
        
    } catch (error) {
        console.error('Error loading ticket details:', error);
        detailsElement.innerHTML = `
            <div class="error">
                <i class="ph-light ph-warning"></i>
                Error loading ticket details: ${error.message}
            </div>
        `;
    }
}

/**
 * Load ticket conversation/messages
 */
async function loadTicketConversation(ticketId) {
    const conversationElement = document.getElementById('ticketConversation');
    
    try {
        const result = await db.ticketMessages.getByTicketId(ticketId);
        
        if (result.success) {
            const messages = result.data || [];
            
            if (messages.length === 0) {
                conversationElement.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
                        <i class="ph-light ph-chat-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p>No messages yet. Send a message to start the conversation.</p>
                    </div>
                `;
                return;
            }
            
            conversationElement.innerHTML = messages.map(message => `
                <div class="message ${message.is_from_staff ? 'staff' : 'customer'}">
                    <div class="message-header">
                        <span class="message-author">
                            ${message.is_from_staff ? 
                                (message.staff_name || 'Support Team') : 
                                (currentCustomer.full_name || 'You')
                            }
                        </span>
                        <span class="message-time">${formatDateTime(message.created_at)}</span>
                    </div>
                    <div class="message-content">${escapeHtml(message.message)}</div>
                </div>
            `).join('');
            
            // Scroll to bottom
            conversationElement.scrollTop = conversationElement.scrollHeight;
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading conversation:', error);
        conversationElement.innerHTML = `
            <div class="error">
                <i class="ph-light ph-warning"></i>
                Error loading conversation: ${error.message}
            </div>
        `;
    }
}

/**
 * Handle reply form submission
 */
async function handleReplySubmit(e) {
    e.preventDefault();
    
    if (!currentTicketId) return;
    
    const messageInput = document.getElementById('replyMessage');
    const submitBtn = e.target.querySelector('.submit-btn');
    const message = messageInput.value.trim();
    
    if (!message) {
        showMessage('Please enter a message', 'error');
        return;
    }
    
    try {
        // Disable form
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
        
        // Create message data
        const messageData = {
            ticket_id: currentTicketId,
            customer_id: currentCustomer.id,
            message: message,
            is_from_staff: false,
            is_internal: false
        };
        
        // Send message
        const result = await db.ticketMessages.create(messageData);
        
        if (result.success) {
            // Clear form
            messageInput.value = '';
            
            // Reload conversation
            await loadTicketConversation(currentTicketId);
            
            showMessage('Message sent successfully', 'success');
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('Error sending message: ' + error.message, 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-light ph-paper-plane-right"></i> Send Reply';
    }
}

/**
 * Close ticket modal
 */
function closeTicketModal() {
    document.getElementById('ticketModal').style.display = 'none';
    currentTicketId = null;
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        const result = await auth.signOut();
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            console.error('Logout error:', result.error);
            // Force redirect anyway
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect anyway
        window.location.href = 'index.html';
    }
}

/**
 * Utility Functions
 */

// Get status CSS class
function getStatusClass(status) {
    const statusMap = {
        'new': 'status-open',
        'in_progress': 'status-in-progress', 
        'completed': 'status-resolved',
        'cancelled': 'status-awaiting'
    };
    return statusMap[status] || 'status-open';
}

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'new': 'Open',
        'in_progress': 'In Progress',
        'completed': 'Resolved', 
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

// Format priority for display
function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message
function showMessage(message, type = 'info', container = null) {
    if (!container) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = type;
        notification.innerHTML = `<i class="ph-light ph-${type === 'error' ? 'warning' : 'check-circle'}"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    } else {
        container.innerHTML = `<div class="${type}">${message}</div>`;
        // Clear after 10 seconds
        setTimeout(() => {
            container.innerHTML = '';
        }, 10000);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('ticket-modal')) {
        closeTicketModal();
    }
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 