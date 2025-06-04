// Admin Dashboard JavaScript - Zendesk-Inspired Professional Interface
let currentAdmin = null;
let currentUser = null;
let allTickets = [];
let allContacts = [];
let allWebforms = [];
let allCustomers = [];
let allAppointments = [];
let currentSection = 'dashboard';
let currentTicketId = null;
let replyMode = 'public'; // 'public' or 'internal'
let currentContactToConvert = null;
let currentWebformToConvert = null;
let ticketEditMode = false;
let ticketEditData = null;

// --- Edit Mode State ---
let ticketsEditMode = false;
let contactsEditMode = false;
let webformsEditMode = false;

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

        // Check if user is logged in as admin
        const isLoggedIn = await AdminAuth.isLoggedIn();
        if (!isLoggedIn) {
            console.log('No authenticated admin found');
            redirectToLogin();
            return;
        }

        // Get current admin and user data
        currentAdmin = AdminAuth.getCurrentAdmin();
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;

        console.log('Authenticated admin:', currentAdmin.email);
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        redirectToLogin();
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = 'staff-portal.html';
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
    const webformStatusFilter = document.getElementById('webformStatusFilter');
    
    if (statusFilter) statusFilter.addEventListener('change', () => filterTickets());
    if (priorityFilter) priorityFilter.addEventListener('change', () => filterTickets());
    if (sortBy) sortBy.addEventListener('change', () => filterTickets());
    if (contactStatusFilter) contactStatusFilter.addEventListener('change', () => filterContacts());
    if (appointmentStatusFilter) appointmentStatusFilter.addEventListener('change', () => filterAppointments());
    if (webformStatusFilter) webformStatusFilter.addEventListener('change', () => filterWebforms());
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
        'tickets': 'Tickets',
        'customers': 'Customers', 
        'analytics': 'Analytics',
        'contacts': 'Customer Requests',
        'webforms': 'Web Forms'
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
            case 'webforms':
                await loadWebforms();
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
        const ticketsResult = await AdminDB.tickets.getAll();
        if (ticketsResult.success) {
            allTickets = ticketsResult.data || [];
        updateDashboardStats();
        }
        
        // Load contacts for badges
        const contactsResult = await AdminDB.contactSubmissions.getAll();
        if (contactsResult.success) {
            allContacts = contactsResult.data || [];
        }
        
        // Load webforms for badges
        const webformsResult = await AdminDB.webFormSubmissions.getAll();
        if (webformsResult.success) {
            allWebforms = webformsResult.data || [];
        }
        
        updateNavigationBadges();
        
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
    const unprocessedWebforms = allWebforms.filter(w => !w.processed).length;
    
    const ticketsBadge = document.getElementById('ticketsBadge');
    const contactsBadge = document.getElementById('contactsBadge');
    const webformsBadge = document.getElementById('webformsBadge');
    
    if (ticketsBadge) ticketsBadge.textContent = openTickets;
    if (contactsBadge) contactsBadge.textContent = unprocessedContacts;
    if (webformsBadge) webformsBadge.textContent = unprocessedWebforms;
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    
    try {
        // Get recent tickets, contacts, and webforms
        const recentTickets = allTickets.slice(-3).reverse();
        const recentContacts = allContacts.slice(-2).reverse();
        const recentWebforms = allWebforms.slice(-3).reverse();
        
        const activities = [];
        
        // Add ticket activities
        recentTickets.forEach(ticket => {
            const customerName = ticket.anonymous_customer ? 
                (ticket.anonymous_name || 'Anonymous User') : 
                (ticket.customer_name || 'Unknown');
            activities.push({
                type: 'ticket',
                icon: 'ph-ticket',
                title: `New ticket: ${ticket.title}`,
                meta: `Priority: ${ticket.priority} • Customer: ${customerName}`,
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
        
        // Add webform activities
        recentWebforms.forEach(webform => {
            activities.push({
                type: 'webform',
                icon: 'ph-file-text',
                title: `New web form: ${webform.form_type || 'Form Submission'}`,
                meta: `From: ${webform.name || 'Anonymous'} • ${webform.email || 'No email'}`,
                time: formatTimeAgo(webform.created_at)
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
    const ticketsTableData = document.getElementById('ticketsTableData');
    
    try {
        ticketsTableData.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading tickets...</div>';
        
        const result = await AdminDB.tickets.getAll();
        
        if (result.success) {
            allTickets = result.data || [];
            displayTickets(allTickets);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        ticketsTableData.innerHTML = `
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
    const ticketsTableData = document.getElementById('ticketsTableData');
    
    if (tickets.length === 0) {
        ticketsTableData.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-ticket" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4>No Tickets Found</h4>
                <p>Create your first ticket to get started.</p>
            </div>
        `;
        return;
    }
    
    ticketsTableData.innerHTML = tickets.map(ticket => {
        // Determine customer name display
        let customerName = 'Unknown';
        if (ticket.anonymous_customer) {
            customerName = ticket.anonymous_name || 'Anonymous User';
        } else if (ticket.customers?.full_name) {
            customerName = ticket.customers.full_name;
        } else if (ticket.customer_name) {
            customerName = ticket.customer_name;
        }
        
        return `
            <div class="table-row" ${!ticketsEditMode ? `onclick=\"openTicketDetail('${ticket.id}')\"` : ''}>
                ${ticketsEditMode ? `<div class="table-cell"><input type="checkbox" class="ticket-checkbox" value="${ticket.id}" onclick="updateSelectAllState('ticket-checkbox','selectAllTickets')"></div>` : ''}
                <div class="table-cell"><span class="status-badge status-${ticket.status.replace(/_/g, '_')}">${formatStatus(ticket.status)}</span></div>
                <div class="table-cell">#${ticket.id.substring(0, 8)}</div>
                <div class="table-cell subject">${escapeHtml(ticket.title)}</div>
                <div class="table-cell priority priority-${ticket.priority}">${formatPriority(ticket.priority)}</div>
                <div class="table-cell">${customerName}</div>
                <div class="table-cell">${formatDate(ticket.created_at)}</div>
            </div>
        `;
    }).join('');
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
        const ticketResult = await AdminDB.tickets.getById(ticketId);
        if (!ticketResult.success) {
            throw new Error(ticketResult.error);
        }
        
        const ticket = ticketResult.data;
        
        // Update panel title
        document.getElementById('detailTitle').textContent = `#${ticket.id.substring(0, 8)} - ${ticket.title}`;
        
        // Get customer info
        let customerInfo = 'Unknown Customer';
        if (ticket.anonymous_customer) {
            customerInfo = `${ticket.anonymous_name || 'Anonymous User'}`;
            if (ticket.anonymous_email) {
                customerInfo += ` (${ticket.anonymous_email})`;
            }
        } else if (ticket.customer_id) {
            const customerResult = await AdminDB.customers.getById(ticket.customer_id);
            if (customerResult.success) {
                customerInfo = customerResult.data.full_name;
            }
        }
        
        // Get messages
        const messagesResult = await AdminDB.ticketMessages.getByTicketId(ticketId);
        const messages = messagesResult.success ? messagesResult.data : [];
        
        // Add Edit button
        let editBtnHtml = `<button class="btn secondary" id="editTicketBtn" style="float:right; margin-bottom:1rem;">Edit</button>`;
        
        // Display ticket details
        content.innerHTML = `
            ${editBtnHtml}
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
        
        // After rendering, add event listener:
        setTimeout(() => {
            const editBtn = document.getElementById('editTicketBtn');
            if (editBtn) editBtn.onclick = () => enableTicketEdit(ticketId);
        }, 0);
        
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
            staff_id: currentAdmin.admin_id,
            message: message,
            is_from_staff: true,
            is_internal: replyMode === 'internal'
        };
        
        // Send message
        const result = await AdminDB.ticketMessages.create(messageData);
        
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
    const contactsTableData = document.getElementById('contactsTableData');
    
    try {
        contactsTableData.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading contacts...</div>';
        
        const result = await AdminDB.contactSubmissions.getAll();
        
        if (result.success) {
            allContacts = result.data || [];
            displayContacts(allContacts);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsTableData.innerHTML = `
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
    const contactsTableData = document.getElementById('contactsTableData');
    
    if (contacts.length === 0) {
        contactsTableData.innerHTML = `
            <div class="empty-state">
                <i class="ph-light ph-user-circle"></i>
                <h4>No Customer Requests</h4>
                <p>Contact requests from logged-in customers will appear here.</p>
            </div>
        `;
        return;
    }
    
    contactsTableData.innerHTML = contacts.map(contact => `
        <div class="table-row">
            ${contactsEditMode ? `<div class="table-cell"><input type="checkbox" class="contact-checkbox" value="${contact.id}" onclick="updateSelectAllState('contact-checkbox','selectAllContacts')"></div>` : ''}
            <div class="table-cell subject">${escapeHtml(contact.subject)}</div>
            <div class="table-cell">${escapeHtml(contact.name)}</div>
            <div class="table-cell">${escapeHtml(contact.email)}</div>
            <div class="table-cell"><span class="status-badge ${contact.processed ? 'status-completed' : 'status-new'}">${contact.processed ? 'Processed' : 'New'}</span></div>
            <div class="table-cell">${formatDate(contact.created_at)}</div>
            <div class="table-cell">${!contact.processed ? `<button class="btn secondary" onclick="convertToTicket('${contact.id}')"><i class="ph-light ph-ticket"></i> Convert to Ticket</button>` : '<span style="color: rgba(255, 255, 255, 0.5);">Processed</span>'}</div>
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
 * Load webforms
 */
async function loadWebforms() {
    const webformsTableData = document.getElementById('webformsTableData');
    
    try {
        webformsTableData.innerHTML = '<div class="loading"><i class="ph-light ph-spinner"></i>Loading webforms...</div>';
        
        const result = await AdminDB.webFormSubmissions.getAll();
        
        if (result.success) {
            allWebforms = result.data || [];
            displayWebforms(allWebforms);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading webforms:', error);
        webformsTableData.innerHTML = `
            <div class="error" style="text-align: center; padding: 2rem;">
                <i class="ph-light ph-warning"></i>
                Error loading webforms: ${error.message}
            </div>
        `;
    }
}

/**
 * Display webforms in table
 */
function displayWebforms(webforms) {
    const webformsTableData = document.getElementById('webformsTableData');
    
    if (webforms.length === 0) {
        webformsTableData.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-file-text" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4>No Web Form Submissions</h4>
                <p>Web form submissions will appear here.</p>
            </div>
        `;
        return;
    }
    
    webformsTableData.innerHTML = webforms.map(webform => `
        <div class="table-row">
            ${webformsEditMode ? `<div class="table-cell"><input type="checkbox" class="webform-checkbox" value="${webform.id}" onclick="updateSelectAllState('webform-checkbox','selectAllWebforms')"></div>` : ''}
            <div class="table-cell">${escapeHtml(webform.form_type || 'Contact Form')}</div>
            <div class="table-cell">${escapeHtml(webform.name || 'Anonymous')}</div>
            <div class="table-cell">${escapeHtml(webform.email || 'No email')}</div>
            <div class="table-cell"><span class="status-badge ${webform.processed ? 'status-completed' : 'status-new'}">${webform.processed ? 'Processed' : 'New'}</span></div>
            <div class="table-cell">${formatDate(webform.created_at)}</div>
            <div class="table-cell">${!webform.processed ? `<button class="btn secondary" onclick="convertWebformToTicket('${webform.id}')"><i class="ph-light ph-ticket"></i> Convert to Ticket</button>` : '<span style="color: rgba(255, 255, 255, 0.5);">Processed</span>'}</div>
        </div>
    `).join('');
}

/**
 * Filter webforms
 */
function filterWebforms() {
    const statusFilter = document.getElementById('webformStatusFilter').value;
    
    let filtered = [...allWebforms];
    
    if (statusFilter !== '') {
        const isProcessed = statusFilter === 'true';
        filtered = filtered.filter(webform => webform.processed === isProcessed);
    }
    
    displayWebforms(filtered);
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
            (ticket.customers?.full_name && ticket.customers.full_name.toLowerCase().includes(query)) ||
            (ticket.customer_name && ticket.customer_name.toLowerCase().includes(query)) ||
            (ticket.anonymous_name && ticket.anonymous_name.toLowerCase().includes(query))
        );
        displayTickets(filtered);
    } else if (currentSection === 'contacts') {
        const filtered = allContacts.filter(contact => 
            contact.subject.toLowerCase().includes(query) ||
            contact.name.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            (contact.message && contact.message.toLowerCase().includes(query))
        );
        displayContacts(filtered);
    } else if (currentSection === 'webforms') {
        const filtered = allWebforms.filter(webform => 
            (webform.form_type && webform.form_type.toLowerCase().includes(query)) ||
            (webform.name && webform.name.toLowerCase().includes(query)) ||
            (webform.email && webform.email.toLowerCase().includes(query)) ||
            (webform.subject && webform.subject.toLowerCase().includes(query)) ||
            (webform.message && webform.message.toLowerCase().includes(query))
        );
        displayWebforms(filtered);
    }
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
        
        const customerValue = document.getElementById('ticketCustomer').value;
        
        const formData = {
            customer_id: customerValue === 'anonymous' ? null : customerValue,
            title: document.getElementById('ticketTitle').value,
            description: document.getElementById('ticketDescription').value,
            priority: document.getElementById('ticketPriority').value,
            staff_notes: document.getElementById('ticketNotes').value,
            created_by_staff: true,
            anonymous_customer: customerValue === 'anonymous'
        };
        
        const result = await AdminDB.tickets.create(formData);
        
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
        const result = await AdminDB.customers.getAll();
        if (result.success) {
            const select = document.getElementById('ticketCustomer');
            if (select) {
                select.innerHTML = '<option value="">Select Customer</option>' +
                    '<option value="anonymous">No Customer (Anonymous)</option>' +
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
        const result = await AdminAuth.signOut();
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
    // Find the contact
    const contact = allContacts.find(c => c.id === contactId);
    if (!contact) return;
    currentContactToConvert = contact;
    // Pre-fill modal fields
    document.getElementById('convertName').value = contact.name || '';
    document.getElementById('convertEmail').value = contact.email || '';
    document.getElementById('convertSubject').value = contact.subject || '';
    document.getElementById('convertDescription').value = contact.message || contact.description || '';
    document.getElementById('convertPriority').value = 'normal';
    // Show modal
    document.getElementById('convertToTicketModal').style.display = 'block';
    // Always attach the handler (remove previous to avoid duplicates)
    const convertForm = document.getElementById('convertToTicketForm');
    convertForm.removeEventListener('submit', handleConvertToTicket);
    convertForm.addEventListener('submit', handleConvertToTicket);
}

async function handleConvertToTicket(e) {
    e.preventDefault();
    if (!currentContactToConvert) return;
    const submitBtn = e.target.querySelector('.btn.primary');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Converting...';
    try {
        // Use customer_id from the contact request
        const customerId = currentContactToConvert.customer_id;
        if (!customerId) throw new Error('No customer_id found on contact request.');
        // Create ticket linked to customer_id
        const ticketData = {
            customer_id: customerId,
            title: document.getElementById('convertSubject').value,
            description: document.getElementById('convertDescription').value,
            priority: document.getElementById('convertPriority').value,
            created_by_staff: true
        };
        const result = await AdminDB.tickets.create(ticketData);
        if (!result.success) throw new Error(result.error);
        // Delete the contact request after conversion
        const deleteResult = await AdminDB.contactSubmissions.delete(currentContactToConvert.id);
        if (!deleteResult.success) throw new Error(deleteResult.error);
        showNotification('Contact converted to ticket and deleted!', 'success');
        closeModal('convertToTicketModal');
        // Refresh contacts and tickets
        await loadContacts();
        await loadTickets();
        } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Convert & Create Ticket';
        currentContactToConvert = null;
    }
}

function enableTicketEdit(ticketId) {
    ticketEditMode = true;
    // Re-render ticket detail in edit mode
    renderTicketEditForm(ticketId);
}

async function renderTicketEditForm(ticketId) {
    // Load ticket data again for safety
    const ticketResult = await AdminDB.tickets.getById(ticketId);
    if (!ticketResult.success) return;
    const ticket = ticketResult.data;
    ticketEditData = {...ticket};
    const content = document.getElementById('ticketDetailContent');
    content.innerHTML = `
        <form id="editTicketForm">
            <div class="ticket-properties">
                <div class="property-item">
                    <div class="property-label">Status</div>
                    <select class="form-select" name="status" id="editStatus">
                        <option value="new" ${ticket.status==='new'?'selected':''}>New</option>
                        <option value="in_progress" ${ticket.status==='in_progress'?'selected':''}>In Progress</option>
                        <option value="completed" ${ticket.status==='completed'?'selected':''}>Completed</option>
                        <option value="cancelled" ${ticket.status==='cancelled'?'selected':''}>Cancelled</option>
                    </select>
        </div>
                <div class="property-item">
                    <div class="property-label">Priority</div>
                    <select class="form-select" name="priority" id="editPriority">
                        <option value="urgent" ${ticket.priority==='urgent'?'selected':''}>Urgent</option>
                        <option value="high" ${ticket.priority==='high'?'selected':''}>High</option>
                        <option value="normal" ${ticket.priority==='normal'?'selected':''}>Normal</option>
                        <option value="low" ${ticket.priority==='low'?'selected':''}>Low</option>
                    </select>
                </div>
                <div class="property-item">
                    <div class="property-label">Subject</div>
                    <input class="form-input" type="text" id="editTitle" value="${escapeHtml(ticket.title)}" required />
                </div>
                <div class="property-item">
                    <div class="property-label">Description</div>
                    <textarea class="form-textarea" id="editDescription" required>${escapeHtml(ticket.description)}</textarea>
                </div>
            </div>
            <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:flex-end;">
                <button type="button" class="btn secondary" id="cancelEditTicketBtn">Cancel</button>
                <button type="submit" class="btn primary">Save Changes</button>
            </div>
        </form>
    `;
    document.getElementById('cancelEditTicketBtn').onclick = () => {
        ticketEditMode = false;
        openTicketDetail(ticketId);
    };
    document.getElementById('editTicketForm').onsubmit = async function(e) {
        e.preventDefault();
        const updates = {
            status: document.getElementById('editStatus').value,
            priority: document.getElementById('editPriority').value,
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value
        };
        const result = await AdminDB.tickets.update(ticketId, updates);
        if (result.success) {
            showNotification('Ticket updated!', 'success');
            ticketEditMode = false;
            openTicketDetail(ticketId);
            await loadTickets();
        } else {
            showNotification('Error updating ticket: ' + result.error, 'error');
        }
    };
}

// --- Bulk Delete Utilities ---
async function deleteSelectedTickets() {
    const checkboxes = document.querySelectorAll('.ticket-checkbox:checked');
    if (checkboxes.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected tickets?')) return;
    for (const cb of checkboxes) {
        await AdminDB.tickets.delete(cb.value);
    }
    await loadTickets();
    exitTicketsEditMode();
}

async function deleteSelectedContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    if (checkboxes.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected customer requests?')) return;
    for (const cb of checkboxes) {
        await AdminDB.contactSubmissions.delete(cb.value);
    }
    await loadContacts();
    exitContactsEditMode();
}

// Utility to toggle all checkboxes
function toggleSelectAll(className, checked) {
    document.querySelectorAll('.' + className).forEach(cb => { cb.checked = checked; });
}

// Utility to update select-all checkbox state
function updateSelectAllState(className, selectAllId) {
    const all = document.querySelectorAll('.' + className);
    const checked = document.querySelectorAll('.' + className + ':checked');
    const selectAll = document.getElementById(selectAllId);
    if (selectAll) selectAll.checked = all.length === checked.length;
}

// --- Edit Mode Functions ---
function enterTicketsEditMode() {
    ticketsEditMode = true;
    document.getElementById('ticketsEditBtn').style.display = 'none';
    document.getElementById('ticketsEditControls').style.display = 'flex';
    document.getElementById('ticketsCheckboxHeader').style.display = 'block';
    displayTickets(allTickets);
}

function exitTicketsEditMode() {
    ticketsEditMode = false;
    document.getElementById('ticketsEditBtn').style.display = 'block';
    document.getElementById('ticketsEditControls').style.display = 'none';
    document.getElementById('ticketsCheckboxHeader').style.display = 'none';
    displayTickets(allTickets);
}

function enterContactsEditMode() {
    contactsEditMode = true;
    document.getElementById('contactsEditBtn').style.display = 'none';
    document.getElementById('contactsEditControls').style.display = 'flex';
    document.getElementById('contactsCheckboxHeader').style.display = 'block';
    displayContacts(allContacts);
}

function exitContactsEditMode() {
    contactsEditMode = false;
    document.getElementById('contactsEditBtn').style.display = 'block';
    document.getElementById('contactsEditControls').style.display = 'none';
    document.getElementById('contactsCheckboxHeader').style.display = 'none';
    displayContacts(allContacts);
}

function convertWebformToTicket(webformId) {
    // Find the webform
    const webform = allWebforms.find(w => w.id === webformId);
    if (!webform) return;
    currentWebformToConvert = webform;
    
    // Pre-fill modal fields
    document.getElementById('convertWebformName').value = webform.name || '';
    document.getElementById('convertWebformEmail').value = webform.email || '';
    document.getElementById('convertWebformSubject').value = webform.subject || webform.form_type || 'Web Form Submission';
    document.getElementById('convertWebformDescription').value = webform.message || webform.description || '';
    document.getElementById('convertWebformPriority').value = 'normal';
    
    // Show modal
    document.getElementById('convertWebformToTicketModal').style.display = 'block';
    
    // Always attach the handler (remove previous to avoid duplicates)
    const convertForm = document.getElementById('convertWebformToTicketForm');
    convertForm.removeEventListener('submit', handleConvertWebformToTicket);
    convertForm.addEventListener('submit', handleConvertWebformToTicket);
}

async function handleConvertWebformToTicket(e) {
    e.preventDefault();
    if (!currentWebformToConvert) return;
    
    const submitBtn = e.target.querySelector('.btn.primary');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Converting...';
    
    try {
        // Create ticket without customer_id (anonymous)
        const ticketData = {
            customer_id: null,
            title: document.getElementById('convertWebformSubject').value,
            description: document.getElementById('convertWebformDescription').value,
            priority: document.getElementById('convertWebformPriority').value,
            created_by_staff: true,
            anonymous_customer: true,
            anonymous_name: document.getElementById('convertWebformName').value,
            anonymous_email: document.getElementById('convertWebformEmail').value
        };
        
        const result = await AdminDB.tickets.create(ticketData);
        if (!result.success) throw new Error(result.error);
        
        // Delete the webform after conversion
        const deleteResult = await AdminDB.webFormSubmissions.delete(currentWebformToConvert.id);
        if (!deleteResult.success) throw new Error(deleteResult.error);
        
        showNotification('Web form converted to ticket and deleted!', 'success');
        closeModal('convertWebformToTicketModal');
        
        // Refresh webforms and tickets
        await loadWebforms();
        await loadTickets();
        
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Convert & Create Ticket';
        currentWebformToConvert = null;
    }
}

async function deleteSelectedWebforms() {
    const checkboxes = document.querySelectorAll('.webform-checkbox:checked');
    if (checkboxes.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected web form submissions?')) return;
    for (const cb of checkboxes) {
        await AdminDB.webFormSubmissions.delete(cb.value);
    }
    await loadWebforms();
    exitWebformsEditMode();
}

function enterWebformsEditMode() {
    webformsEditMode = true;
    document.getElementById('webformsEditBtn').style.display = 'none';
    document.getElementById('webformsEditControls').style.display = 'flex';
    document.getElementById('webformsCheckboxHeader').style.display = 'block';
    displayWebforms(allWebforms);
}

function exitWebformsEditMode() {
    webformsEditMode = false;
    document.getElementById('webformsEditBtn').style.display = 'block';
    document.getElementById('webformsEditControls').style.display = 'none';
    document.getElementById('webformsCheckboxHeader').style.display = 'none';
    displayWebforms(allWebforms);
}