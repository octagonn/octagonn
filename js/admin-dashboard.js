// Admin Dashboard JavaScript - Zendesk-Inspired Professional Interface
let currentAdmin = null;
let currentUser = null;
let allTickets = [];
let allContacts = [];
let allCustomers = [];
let allAppointments = [];
let currentSection = 'dashboard';
let currentTicketId = null;
let replyMode = 'public'; // 'public' or 'internal'

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin Dashboard initializing...');
    
    // Check authentication
    await checkAuthentication();
    
    // Initialize dashboard if authenticated
    if (currentUser && currentAdmin) {
        await initializeDashboard();
    }
});

/**
 * Check if user is authenticated and has admin access
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

        // Check if user is admin/staff
        const staffResult = await db.staff.getByUserId(currentUser.id);
        if (staffResult.success) {
            currentAdmin = staffResult.data;
            console.log('Admin access confirmed:', currentAdmin);
        } else {
            console.error('Admin access denied');
            showNotification('Access denied. Admin privileges required.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
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
    window.location.href = 'admin-login.html';
}

/**
 * Initialize dashboard functionality
 */
async function initializeDashboard() {
    try {
        console.log('Initializing dashboard for admin:', currentAdmin.full_name);
        
        // Set admin info in UI
        updateAdminInfo();
        
        // Setup navigation
        setupNavigation();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial dashboard data
        await loadSection('dashboard');
        
        console.log('Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error initializing dashboard', 'error');
    }
}

/**
 * Update admin info in sidebar
 */
function updateAdminInfo() {
    const adminName = document.getElementById('adminName');
    const adminRole = document.getElementById('adminRole');
    const adminAvatar = document.getElementById('adminAvatar');
    
    if (adminName) adminName.textContent = currentAdmin.full_name || 'Admin User';
    if (adminRole) adminRole.textContent = currentAdmin.role || 'Administrator';
    if (adminAvatar) {
        const initials = (currentAdmin.full_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();
        adminAvatar.textContent = initials;
    }
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }
    
    // Filter dropdowns
    setupFilterListeners();
    
    // Modal close handlers
    setupModalHandlers();
    
    // Reply tabs
    setupReplyTabs();
}

/**
 * Setup filter dropdown listeners
 */
function setupFilterListeners() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const sortBy = document.getElementById('sortBy');
    const contactStatusFilter = document.getElementById('contactStatusFilter');
    const appointmentStatusFilter = document.getElementById('appointmentStatusFilter');
    
    if (statusFilter) statusFilter.addEventListener('change', () => filterTickets());
    if (priorityFilter) priorityFilter.addEventListener('change', () => filterTickets());
    if (sortBy) sortBy.addEventListener('change', () => filterTickets());
    if (contactStatusFilter) contactStatusFilter.addEventListener('change', () => filterContacts());
    if (appointmentStatusFilter) appointmentStatusFilter.addEventListener('change', () => filterAppointments());
}

/**
 * Setup modal event handlers
 */
function setupModalHandlers() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Create ticket form
    const createTicketForm = document.getElementById('createTicketForm');
    if (createTicketForm) {
        createTicketForm.addEventListener('submit', handleCreateTicket);
    }
}

/**
 * Setup reply tabs functionality
 */
function setupReplyTabs() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reply-tab')) {
            switchReplyMode(e.target.dataset.mode);
        }
    });
}

/**
 * Switch between dashboard sections
 */
function switchSection(sectionName) {
    console.log('Switching to section:', sectionName);
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = getSectionTitle(sectionName);
    }
    
    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section data
    currentSection = sectionName;
    loadSection(sectionName);
}

/**
 * Get section title for display
 */
function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'tickets': 'Support Tickets',
        'contacts': 'Contact Requests',
        'customers': 'Customer Management',
        'appointments': 'Appointments',
        'analytics': 'Analytics',
        'reports': 'Reports'
    };
    return titles[sectionName] || 'Dashboard';
}

/**
 * Load data for specific section
 */
async function loadSection(sectionName) {
    try {
        switch (sectionName) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'tickets':
                await loadTickets();
                break;
            case 'contacts':
                await loadContacts();
                break;
            case 'customers':
                await loadCustomers();
                break;
            case 'appointments':
                await loadAppointments();
                break;
            case 'analytics':
            case 'reports':
                // These sections show placeholder content
                break;
        }
    } catch (error) {
        console.error(`Error loading ${sectionName}:`, error);
        showNotification(`Error loading ${sectionName}`, 'error');
    }
}

/**
 * Load dashboard overview data
 */
async function loadDashboard() {
    console.log('Loading dashboard data...');
    
    try {
        // Load tickets for stats
        const ticketsResult = await db.tickets.getAll();
        if (ticketsResult.success) {
            allTickets = ticketsResult.data || [];
            updateDashboardStats();
        }
        
        // Load contacts for badges
        const contactsResult = await db.contacts.getAll();
        if (contactsResult.success) {
            allContacts = contactsResult.data || [];
            updateNavigationBadges();
        }
        
        // Load recent activity
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
    const urgentTickets = allTickets.filter(t => t.priority === 'urgent').length;
    
    document.getElementById('totalTickets').textContent = totalTickets;
    document.getElementById('openTickets').textContent = openTickets;
    document.getElementById('urgentTickets').textContent = urgentTickets;
    
    // Calculate average response time (placeholder)
    document.getElementById('avgResponseTime').textContent = '2.4h';
}

/**
 * Update navigation badges
 */
function updateNavigationBadges() {
    const openTickets = allTickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
    const unprocessedContacts = allContacts.filter(c => !c.processed).length;
    
    const ticketsBadge = document.getElementById('ticketsBadge');
    const contactsBadge = document.getElementById('contactsBadge');
    
    if (ticketsBadge) ticketsBadge.textContent = openTickets;
    if (contactsBadge) contactsBadge.textContent = unprocessedContacts;
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    
    try {
        // Get recent tickets, contacts, and messages
        const recentTickets = allTickets.slice(-5).reverse();
        const recentContacts = allContacts.slice(-3).reverse();
        
        const activities = [];
        
        // Add ticket activities
        recentTickets.forEach(ticket => {
            activities.push({
                type: 'ticket',
                icon: 'ph-ticket',
                title: `New ticket: ${ticket.title}`,
                meta: `Priority: ${ticket.priority} • Customer: ${ticket.customer_name || 'Unknown'}`,
                time: formatTimeAgo(ticket.created_at)
            });
        });
        
        // Add contact activities
        recentContacts.forEach(contact => {
            activities.push({
                type: 'contact',
                icon: 'ph-envelope',
                title: `New contact: ${contact.subject}`,
                meta: `From: ${contact.name} • ${contact.email}`,
                time: formatTimeAgo(contact.created_at)
            });
        });
        
        // Sort by most recent
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
                    <i class="ph-light ph-clock" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = activities.slice(0, 8).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="ph-light ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">${activity.meta}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        activityContainer.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <i class="ph-light ph-warning"></i>
                Error loading recent activity
            </div>
        `;
    }
}

/**
 * Load and display tickets
 */
async function loadTickets() {
    const ticketsTable = document.getElementById('ticketsTable');
    
    try {
        ticketsTable.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading tickets...</div>';
        
        const result = await db.tickets.getAll();
        
        if (result.success) {
            allTickets = result.data || [];
            displayTickets(allTickets);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        ticketsTable.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <i class="ph-light ph-warning"></i>
                Error loading tickets: ${error.message}
            </div>
        `;
    }
}

/**
 * Display tickets in table
 */
function displayTickets(tickets) {
    const ticketsTable = document.getElementById('ticketsTable');
    
    if (tickets.length === 0) {
        ticketsTable.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-ticket" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4>No Tickets Found</h4>
                <p>Create your first ticket to get started.</p>
            </div>
        `;
        return;
    }
    
    ticketsTable.innerHTML = tickets.map(ticket => `
        <div class="table-row" onclick="openTicketDetail('${ticket.id}')">
            <div class="table-cell">#${ticket.id.substring(0, 8)}</div>
            <div class="table-cell subject">${escapeHtml(ticket.title)}</div>
            <div class="table-cell">
                <span class="status-badge status-${ticket.status}">
                    ${formatStatus(ticket.status)}
                </span>
            </div>
            <div class="table-cell priority priority-${ticket.priority}">
                ${formatPriority(ticket.priority)}
            </div>
            <div class="table-cell">${ticket.customer_name || 'Unknown'}</div>
            <div class="table-cell">${formatDate(ticket.created_at)}</div>
        </div>
    `).join('');
}

/**
 * Filter tickets based on current filters
 */
function filterTickets() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filtered = [...allTickets];
    
    // Apply filters
    if (statusFilter) {
        filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'status':
                return a.status.localeCompare(b.status);
            case 'created_at':
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    
    displayTickets(filtered);
}

/**
 * Open ticket detail panel
 */
async function openTicketDetail(ticketId) {
    console.log('Opening ticket detail:', ticketId);
    currentTicketId = ticketId;
    
    const panel = document.getElementById('ticketDetailPanel');
    const content = document.getElementById('ticketDetailContent');
    
    // Show panel
    panel.classList.add('open');
    
    // Reset content
    content.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading ticket details...</div>';
    
    try {
        // Get ticket details
        const ticketResult = await db.tickets.getById(ticketId);
        if (!ticketResult.success) {
            throw new Error(ticketResult.error);
        }
        
        const ticket = ticketResult.data;
        
        // Update panel title
        document.getElementById('detailTitle').textContent = `#${ticket.id.substring(0, 8)} - ${ticket.title}`;
        
        // Get customer info
        let customerInfo = 'Unknown Customer';
        if (ticket.customer_id) {
            const customerResult = await db.customers.getById(ticket.customer_id);
            if (customerResult.success) {
                customerInfo = customerResult.data.full_name;
            }
        }
        
        // Get messages
        const messagesResult = await db.ticketMessages.getByTicketId(ticketId);
        const messages = messagesResult.success ? messagesResult.data : [];
        
        // Display ticket details
        content.innerHTML = `
            <div class="ticket-properties">
                <div class="property-item">
                    <div class="property-label">Status</div>
                    <div class="property-value">
                        <span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span>
                    </div>
                </div>
                <div class="property-item">
                    <div class="property-label">Priority</div>
                    <div class="property-value priority-${ticket.priority}">${formatPriority(ticket.priority)}</div>
                </div>
                <div class="property-item">
                    <div class="property-label">Customer</div>
                    <div class="property-value">${customerInfo}</div>
                </div>
                <div class="property-item">
                    <div class="property-label">Created</div>
                    <div class="property-value">${formatDateTime(ticket.created_at)}</div>
                </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h4 style="color: #ffffff; margin-bottom: 0.5rem;">Description</h4>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.5; margin: 0;">${escapeHtml(ticket.description)}</p>
            </div>
            
            <div class="conversation">
                <div class="conversation-header">Conversation</div>
                <div id="messagesContainer">
                    ${messages.length === 0 ? 
                        '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 2rem;">No messages yet</p>' :
                        messages.map(message => `
                            <div class="message ${message.is_from_staff ? 'staff' : 'customer'}">
                                <div class="message-header">
                                    <span class="message-author">
                                        ${message.is_from_staff ? 
                                            (message.staff_name || 'Support Team') : 
                                            (customerInfo || 'Customer')
                                        }
                                    </span>
                                    <span class="message-time">${formatDateTime(message.created_at)}</span>
                                </div>
                                <div class="message-content">${escapeHtml(message.message)}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            
            <div class="reply-section">
                <div class="reply-tabs">
                    <button class="reply-tab active" data-mode="public">Public Reply</button>
                    <button class="reply-tab" data-mode="internal">Internal Note</button>
                </div>
                <form id="replyForm" onsubmit="handleReplySubmit(event)">
                    <textarea class="reply-textarea" id="replyMessage" placeholder="Type your ${replyMode} message here..." required></textarea>
                    <div class="reply-actions">
                        <button type="submit" class="btn primary">
                            <i class="ph-light ph-paper-plane-right"></i>
                            Send ${replyMode === 'public' ? 'Reply' : 'Note'}
                        </button>
                        <button type="button" class="btn secondary" onclick="closeTicketDetail()">Close</button>
                    </div>
                </form>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading ticket details:', error);
        content.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <i class="ph-light ph-warning"></i>
                Error loading ticket details: ${error.message}
            </div>
        `;
    }
}

/**
 * Close ticket detail panel
 */
function closeTicketDetail() {
    document.getElementById('ticketDetailPanel').classList.remove('open');
    currentTicketId = null;
}

/**
 * Switch reply mode between public and internal
 */
function switchReplyMode(mode) {
    replyMode = mode;
    
    // Update tabs
    document.querySelectorAll('.reply-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-mode="${mode}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update placeholder and button text
    const textarea = document.getElementById('replyMessage');
    const submitBtn = document.querySelector('#replyForm .btn.primary');
    
    if (textarea) {
        textarea.placeholder = `Type your ${mode} message here...`;
    }
    
    if (submitBtn) {
        submitBtn.innerHTML = `
            <i class="ph-light ph-paper-plane-right"></i>
            Send ${mode === 'public' ? 'Reply' : 'Note'}
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
    const submitBtn = e.target.querySelector('.btn.primary');
    const message = messageInput.value.trim();
    
    if (!message) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    try {
        // Disable form
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
        
        // Create message data
        const messageData = {
            ticket_id: currentTicketId,
            staff_id: currentAdmin.id,
            message: message,
            is_from_staff: true,
            is_internal: replyMode === 'internal'
        };
        
        // Send message
        const result = await db.ticketMessages.create(messageData);
        
        if (result.success) {
            // Clear form
            messageInput.value = '';
            
            // Reload ticket details to show new message
            await openTicketDetail(currentTicketId);
            
            showNotification('Message sent successfully', 'success');
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message: ' + error.message, 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        switchReplyMode(replyMode); // Reset button text
    }
}

/**
 * Load contacts
 */
async function loadContacts() {
    const contactsTable = document.getElementById('contactsTable');
    
    try {
        contactsTable.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading contacts...</div>';
        
        const result = await db.contacts.getAll();
        
        if (result.success) {
            allContacts = result.data || [];
            displayContacts(allContacts);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsTable.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <i class="ph-light ph-warning"></i>
                Error loading contacts: ${error.message}
            </div>
        `;
    }
}

/**
 * Display contacts in table
 */
function displayContacts(contacts) {
    const contactsTable = document.getElementById('contactsTable');
    
    if (contacts.length === 0) {
        contactsTable.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-envelope" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4>No Contact Requests</h4>
                <p>Contact requests will appear here.</p>
            </div>
        `;
        return;
    }
    
    contactsTable.innerHTML = contacts.map(contact => `
        <div class="table-row">
            <div class="table-cell subject">${escapeHtml(contact.subject)}</div>
            <div class="table-cell">${escapeHtml(contact.name)}</div>
            <div class="table-cell">${escapeHtml(contact.email)}</div>
            <div class="table-cell">
                <span class="status-badge ${contact.processed ? 'status-completed' : 'status-new'}">
                    ${contact.processed ? 'Processed' : 'New'}
                </span>
            </div>
            <div class="table-cell">${formatDate(contact.created_at)}</div>
            <div class="table-cell">
                ${!contact.processed ? 
                    `<button class="btn secondary" onclick="convertToTicket('${contact.id}')">
                        <i class="ph-light ph-ticket"></i> Convert to Ticket
                    </button>` : 
                    '<span style="color: rgba(255, 255, 255, 0.5);">Processed</span>'
                }
            </div>
        </div>
    `).join('');
}

/**
 * Filter contacts
 */
function filterContacts() {
    const statusFilter = document.getElementById('contactStatusFilter').value;
    
    let filtered = [...allContacts];
    
    if (statusFilter !== '') {
        const isProcessed = statusFilter === 'true';
        filtered = filtered.filter(contact => contact.processed === isProcessed);
    }
    
    displayContacts(filtered);
}

/**
 * Utility Functions
 */

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'new': 'New',
        'in_progress': 'In Progress',
        'completed': 'Completed',
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

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="ph-light ph-${type === 'error' ? 'warning' : type === 'success' ? 'check-circle' : 'info'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Global Functions
 */

// Refresh current view
function refreshCurrentView() {
    loadSection(currentSection);
    showNotification('Data refreshed', 'info');
}

// Refresh activity
function refreshActivity() {
    loadRecentActivity();
    showNotification('Activity refreshed', 'info');
}

// Handle global search
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (currentSection === 'tickets') {
        const filtered = allTickets.filter(ticket => 
            ticket.title.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            (ticket.customer_name && ticket.customer_name.toLowerCase().includes(query))
        );
        displayTickets(filtered);
    }
    // Add other section search logic as needed
}

// Show create ticket modal
function showCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    modal.style.display = 'block';
    
    // Load customers for dropdown
    loadCustomersDropdown();
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle create ticket
async function handleCreateTicket(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.btn.primary');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Creating...';
        
        const formData = {
            customer_id: document.getElementById('ticketCustomer').value,
            title: document.getElementById('ticketTitle').value,
            description: document.getElementById('ticketDescription').value,
            priority: document.getElementById('ticketPriority').value,
            staff_notes: document.getElementById('ticketNotes').value,
            created_by_staff: true,
            assigned_to: currentAdmin.id
        };
        
        const result = await db.tickets.create(formData);
        
        if (result.success) {
            showNotification('Ticket created successfully', 'success');
            closeModal('createTicketModal');
            
            // Refresh tickets if we're on that view
            if (currentSection === 'tickets') {
                await loadTickets();
            }
            
            // Reset form
            e.target.reset();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        showNotification('Error creating ticket: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-light ph-plus"></i> Create Ticket';
    }
}

// Load customers for dropdown
async function loadCustomersDropdown() {
    try {
        const result = await db.customers.getAll();
        if (result.success) {
            const select = document.getElementById('ticketCustomer');
            if (select) {
                select.innerHTML = '<option value="">Select Customer</option>' +
                    result.data.map(customer => 
                        `<option value="${customer.id}">${customer.full_name} (${customer.email})</option>`
                    ).join('');
            }
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Handle logout
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

// Placeholder functions for future features
function loadCustomers() {
    const customersTable = document.getElementById('customersTable');
    customersTable.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
            <i class="ph-light ph-users" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            <h4>Customer Management</h4>
            <p>Customer management features coming soon.</p>
        </div>
    `;
}

function loadAppointments() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    appointmentsTable.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
            <i class="ph-light ph-calendar" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            <h4>Appointment Management</h4>
            <p>Appointment management features coming soon.</p>
        </div>
    `;
}

function filterAppointments() {
    // Placeholder
}

function showAddCustomerModal() {
    showNotification('Customer management features coming soon', 'info');
}

function showCreateAppointmentModal() {
    showNotification('Appointment management features coming soon', 'info');
}

function convertToTicket(contactId) {
    showNotification('Contact conversion features coming soon', 'info');
} 