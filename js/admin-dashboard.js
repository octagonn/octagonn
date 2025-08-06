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
let messageSubscription = null;
let adminReplyFiles = [];

// --- Edit Mode State ---
let ticketsEditMode = false;
let contactsEditMode = false;
let webformsEditMode = false;
let appointmentsEditMode = false;

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Admin Dashboard initializing...');
    console.log('Current URL:', window.location.href);
    console.log('Document ready state:', document.readyState);
    
    // Test if basic DOM elements exist
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const navItems = document.querySelectorAll('.nav-item');
    
    console.log('Sidebar found:', !!sidebar);
    console.log('Main content found:', !!mainContent);
    console.log('Nav items found:', navItems.length);
    
    // Check authentication
    console.log('Checking authentication...');
    await checkAuthentication();
    
    // Initialize dashboard if authenticated
    if (currentUser && currentAdmin) {
        console.log('User authenticated, initializing dashboard...');
        await initializeDashboard();
    } else {
        console.log('User not authenticated, redirecting...');
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
    console.log('Initializing admin dashboard...');
    
    // Update admin info
    updateAdminInfo();
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for saved section in localStorage
    const savedSection = localStorage.getItem('adminDashboardActiveSection');
    const initialSection = savedSection || 'dashboard'; // Default to dashboard if no saved section
    
    console.log('Restored section from localStorage:', savedSection);
    console.log('Starting with section:', initialSection);
    
    // Switch to the initial section (either saved or dashboard)
    switchSection(initialSection);
    
    console.log('Admin dashboard initialized successfully');
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
    console.log('Setting up navigation...');
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    if (navItems.length === 0) {
        console.error('No navigation items found! DOM might not be ready.');
        return;
    }
    
    navItems.forEach((item, index) => {
        const section = item.getAttribute('data-section');
        console.log(`Nav item ${index}: section="${section}"`);
        
        if (section) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Navigation clicked:', section);
                switchSection(section);
            });
        } else {
            console.warn(`Nav item ${index} has no data-section attribute`);
        }
    });
    
    console.log('Navigation setup complete');
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
    const appointmentSortBy = document.getElementById('appointmentSortBy');
    const appointmentSearch = document.getElementById('appointmentSearch');
    const webformStatusFilter = document.getElementById('webformStatusFilter');
    const ticketSearch = document.getElementById('ticketSearch');
    
    if (statusFilter) statusFilter.addEventListener('change', () => filterTickets());
    if (priorityFilter) priorityFilter.addEventListener('change', () => filterTickets());
    if (sortBy) sortBy.addEventListener('change', () => filterTickets());
    if (document.getElementById('assigneeFilter')) document.getElementById('assigneeFilter').addEventListener('change', () => filterTickets());
    if (document.getElementById('dateStartFilter')) document.getElementById('dateStartFilter').addEventListener('change', () => filterTickets());
    if (document.getElementById('dateEndFilter')) document.getElementById('dateEndFilter').addEventListener('change', () => filterTickets());
    if (contactStatusFilter) contactStatusFilter.addEventListener('change', () => filterContacts());
    if (appointmentStatusFilter) appointmentStatusFilter.addEventListener('change', () => filterAppointments());
    if (appointmentSortBy) appointmentSortBy.addEventListener('change', () => filterAppointments());
    if (appointmentSearch) appointmentSearch.addEventListener('input', () => filterAppointments());
    if (webformStatusFilter) webformStatusFilter.addEventListener('change', () => filterWebforms());
    if (ticketSearch) ticketSearch.addEventListener('input', () => filterTickets());
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
    const publicTab = document.querySelector('.reply-tab[data-mode="public"]');
    const internalTab = document.querySelector('.reply-tab[data-mode="internal"]');
    const replyForm = document.getElementById('replyForm');

    if (publicTab) {
        publicTab.addEventListener('click', () => switchReplyMode('public'));
    }

    if (internalTab) {
        internalTab.addEventListener('click', () => switchReplyMode('internal'));
    }
    
    if (replyForm) {
        // Remove existing listener to prevent duplicates
        replyForm.removeEventListener('submit', handleReplySubmit);
        replyForm.addEventListener('submit', handleReplySubmit);
    }

    // Set initial state
    switchReplyMode('public');
}

function setupAdminFileUpload() {
    const fileInput = document.getElementById('adminReplyAttachments');
    if (!fileInput) return;

    const renderFileList = () => {
        const fileListContainer = document.getElementById('admin-reply-file-list-container');
        if (!fileListContainer) return;
        fileListContainer.innerHTML = '';
        adminReplyFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-list-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="ph-light ph-file"></i>
                    <span>${file.name} (${formatFileSize(file.size)})</span>
                </div>
                <button type="button" class="remove-file-btn" data-index="${index}">&times;</button>
            `;
            fileListContainer.appendChild(fileItem);
        });
    };

    const handleFiles = (files) => {
        for (const file of files) {
            if (adminReplyFiles.length >= 5) {
                showNotification('You can upload a maximum of 5 files.', 'error');
                break;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showNotification(`File "${file.name}" is too large. Max size is 10MB.`, 'error');
                continue;
            }
            if (!adminReplyFiles.some(f => f.name === file.name && f.size === file.size)) {
                adminReplyFiles.push(file);
            }
        }
        renderFileList();
    };
    
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    const fileListContainer = document.getElementById('admin-reply-file-list-container');
    if (fileListContainer) {
        fileListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-file-btn')) {
                const index = parseInt(e.target.dataset.index, 10);
                adminReplyFiles.splice(index, 1);
                renderFileList();
            }
        });
    }
}

/**
 * Switch between dashboard sections
 */
function switchSection(sectionName) {
    console.log('Switching to section:', sectionName);
    
    // Save current section to localStorage
    localStorage.setItem('adminDashboardActiveSection', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = getSectionTitle(sectionName);
    }
    
    // Update header button based on section
    const headerBtn = document.querySelector('.header-btn.primary');
    if (headerBtn) {
        switch (sectionName) {
            case 'tickets':
                headerBtn.innerHTML = '<i class="ph-light ph-plus"></i> New Ticket';
                headerBtn.onclick = () => showCreateTicketModal();
                break;
            case 'customers':
                headerBtn.innerHTML = '<i class="ph-light ph-plus"></i> Add Customer';
                headerBtn.onclick = () => showAddCustomerModal();
                break;
            case 'appointments':
                headerBtn.innerHTML = '<i class="ph-light ph-plus"></i> New Appointment';
                headerBtn.onclick = () => showCreateAppointmentModal();
                break;
            default:
                headerBtn.innerHTML = '<i class="ph-light ph-plus"></i> New Ticket';
                headerBtn.onclick = () => showCreateTicketModal();
                break;
        }
    }
    
    // Load section data
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
            populateAssigneeFilter();
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

async function populateAssigneeFilter() {
    const assigneeFilter = document.getElementById('assigneeFilter');
    if (!assigneeFilter) return;

    const staffResult = await AdminDB.staff.getAll();
    if (staffResult.success) {
        const staff = staffResult.data || [];
        assigneeFilter.innerHTML = '<option value="">All Staff</option>';
        staff.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.full_name;
            assigneeFilter.appendChild(option);
        });
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
        
        let assigneeName = 'Unassigned';
        if (ticket.assigned_to && ticket.admin_users && ticket.admin_users.full_name) {
            assigneeName = ticket.admin_users.full_name;
        }

        return `
            <div class="table-row" ${!ticketsEditMode ? `onclick="openTicketDetail('${ticket.id}')"` : ''}>
                ${ticketsEditMode ? `<div class="table-cell"><input type="checkbox" class="ticket-checkbox" value="${ticket.id}" onclick="updateSelectAllState('ticket-checkbox','selectAllTickets')"></div>` : ''}
                <div class="table-cell"><span class="status-badge status-${ticket.status.replace(/_/g, '_')}">${formatStatus(ticket.status)}</span></div>
                <div class="table-cell">#${ticket.ticket_number || ticket.id.substring(0, 8)}</div>
                <div class="table-cell subject">${escapeHtml(ticket.title)}</div>
                <div class="table-cell priority priority-${ticket.priority}">${formatPriority(ticket.priority)}</div>
                <div class="table-cell">${assigneeName}</div>
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
    const assigneeFilter = document.getElementById('assigneeFilter').value;
    const dateStartFilter = document.getElementById('dateStartFilter').value;
    const dateEndFilter = document.getElementById('dateEndFilter').value;
    const searchQuery = document.getElementById('ticketSearch').value.toLowerCase();
    
    let filtered = [...allTickets];
    
    // Apply filters
    if (statusFilter) {
        filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    if (assigneeFilter) {
        filtered = filtered.filter(ticket => ticket.assigned_to === assigneeFilter);
    }

    if (dateStartFilter) {
        filtered = filtered.filter(ticket => new Date(ticket.created_at) >= new Date(dateStartFilter));
    }

    if (dateEndFilter) {
        filtered = filtered.filter(ticket => new Date(ticket.created_at) <= new Date(dateEndFilter));
    }

    if (searchQuery) {
        filtered = filtered.filter(ticket =>
            ticket.title.toLowerCase().includes(searchQuery) ||
            ticket.description.toLowerCase().includes(searchQuery) ||
            (ticket.customers?.full_name && ticket.customers.full_name.toLowerCase().includes(searchQuery)) ||
            (ticket.customer_name && ticket.customer_name.toLowerCase().includes(searchQuery)) ||
            (ticket.anonymous_name && ticket.anonymous_name.toLowerCase().includes(searchQuery)) ||
            (ticket.ticket_number && ticket.ticket_number.toString().includes(searchQuery))
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'ticket_number':
                return (a.ticket_number || 999999) - (b.ticket_number || 999999);
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
        document.getElementById('detailTitle').textContent = `#${ticket.ticket_number || ticket.id.substring(0, 8)} - ${ticket.title}`;
        
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

        // Get attachments
        const attachmentsResult = await AdminDB.attachments.getByTicketId(ticketId);
        const attachments = attachmentsResult.success ? attachmentsResult.data : [];
        
        // Get staff for assignee dropdown
        const staffResult = await AdminDB.staff.getAll();
        const staff = staffResult.success ? staffResult.data : [];

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
                    <div class="property-label">Assigned To</div>
                    <div class="property-value">
                        <select id="assignee-dropdown" class="form-select" onchange="updateTicketAssignee('${ticket.id}')">
                            <option value="">Unassigned</option>
                            ${staff.map(member => `<option value="${member.id}" ${ticket.assigned_to === member.id ? 'selected' : ''}>${member.full_name}</option>`).join('')}
                        </select>
                    </div>
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
                    ${messages.length === 0 && attachments.filter(a => !a.message_id).length === 0 ? 
                        '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 2rem;">No messages yet</p>' :
                        `
                        ${attachments.filter(a => !a.message_id).length > 0 ? `
                            <div class="message customer">
                                <div class="message-header">
                                    <span class="message-author">${customerInfo || 'Customer'}</span>
                                    <span class="message-time">Initial Attachments</span>
                                </div>
                                <div class="attachments-list">
                                    ${attachments.filter(a => !a.message_id).map(attachment => `
                                        <a href="${attachment.url}" target="_blank" download="${escapeHtml(attachment.file_name)}" class="attachment-item">
                                            <i class="ph-light ph-file"></i>
                                            <span>${escapeHtml(attachment.file_name)}</span>
                                            <small>(${formatFileSize(attachment.file_size)})</small>
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${messages.map(message => {
                            const messageAttachments = attachments.filter(a => a.message_id === message.id);
                            return `
                                <div class="message ${message.is_from_staff ? 'staff' : 'customer'} ${message.is_internal ? 'internal' : ''}">
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
                                    ${messageAttachments.length > 0 ? `
                                        <div class="attachments-list">
                                            ${messageAttachments.map(attachment => `
                                                <a href="${attachment.url}" target="_blank" download="${escapeHtml(attachment.file_name)}" class="attachment-item">
                                                    <i class="ph-light ph-file"></i>
                                                    <span>${escapeHtml(attachment.file_name)}</span>
                                                    <small>(${formatFileSize(attachment.file_size)})</small>
                                                </a>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                        `
                    }
                </div>
            </div>
            
            <div class="reply-section">
                <div class="reply-tabs">
                    <button class="reply-tab active" data-mode="public">Public Reply</button>
                    <button class="reply-tab" data-mode="internal">Internal Note</button>
                </div>
                <form id="replyForm">
                    <textarea class="reply-textarea" id="replyMessage" placeholder="Type your ${replyMode} message here..."></textarea>
                    <div id="admin-reply-file-list-container" class="file-list-container"></div>
                    <div class="reply-actions">
                        <label for="adminReplyAttachments" class="attachment-btn">
                            <i class="ph-light ph-paperclip"></i>
                        </label>
                        <input type="file" id="adminReplyAttachments" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" style="display: none;">
                        <button type="submit" class="btn primary">
                            <i class="ph-light ph-paper-plane-right"></i>
                            Send ${replyMode === 'public' ? 'Reply' : 'Note'}
                        </button>
                    </div>
                </form>
            </div>
            `;
        
        // After rendering, add event listeners:
        setTimeout(() => {
            const editBtn = document.getElementById('editTicketBtn');
            if (editBtn) editBtn.onclick = () => enableTicketEdit(ticketId);
            
                    // Setup reply functionality
            setupReplyTabs();
            setupAdminFileUpload();
        
            // Subscribe to realtime updates
            subscribeToTicketMessages(ticketId);
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

    // Unsubscribe from messages when the panel is closed
    if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
        messageSubscription = null;
        console.log('Unsubscribed from ticket messages.');
    }
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
    console.log('handleReplySubmit called');
    
    if (!currentTicketId) return;
    
    const messageInput = document.getElementById('replyMessage');
    const submitBtn = e.target.querySelector('.btn.primary');
    const message = messageInput.value.trim();
    
    if (!message && adminReplyFiles.length === 0) {
        showNotification('Please enter a message or add a file', 'error');
        return;
    }
    
    try {
        // Disable form
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
        
        let messageId = null;

        // Create message data
        if (message) {
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
                messageId = result.data.id;
                messageInput.value = '';
            } else {
                throw new Error(result.error);
            }
        }

        // Upload files if any
        if (adminReplyFiles.length > 0) {
            submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Uploading files...';
            for (const file of adminReplyFiles) {
                const filePath = `${currentAdmin.user_id}/${currentTicketId}/${Date.now()}-${file.name}`;
                const uploadResult = await storage.uploadFile('ticket-attachments', filePath, file);
                
                if (uploadResult.success) {
                    await db.attachments.create({
                        ticket_id: currentTicketId,
                        message_id: messageId,
                        user_id: currentAdmin.user_id,
                        file_name: file.name,
                        file_path: uploadResult.data.path,
                        mime_type: file.type,
                        file_size: file.size
                    });
                } else {
                    throw new Error(`Failed to upload ${file.name}: ${uploadResult.error}`);
                }
            }
        }
        
        // Clear form
        messageInput.value = '';
        adminReplyFiles = [];
        const fileListContainer = document.getElementById('admin-reply-file-list-container');
        if (fileListContainer) fileListContainer.innerHTML = '';

        // Reloading is now handled by the realtime subscription
        
        showNotification('Message sent successfully', 'success');
        
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
 * Subscribe to realtime updates for ticket messages
 */
function subscribeToTicketMessages(ticketId) {
    // If there's an existing subscription, remove it first
    if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
        messageSubscription = null;
        console.log('Removed previous message subscription.');
    }

    console.log('Subscribing to messages for ticket:', ticketId);

    messageSubscription = supabase
        .channel(`public:ticket_messages:ticket_id=eq.${ticketId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'ticket_messages',
            filter: `ticket_id=eq.${ticketId}`
        }, payload => {
            console.log('New message received via realtime:', payload.new);
            // Reload the conversation to show the new message
            openTicketDetail(ticketId); // Re-opens and refreshes the ticket detail view
        })
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to ticket messages!');
            }
            if (status === 'CHANNEL_ERROR') {
                console.error('Subscription error:', err);
            }
        });
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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        document.getElementById('ticketSearch').value = query;
        filterTickets();
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
        console.log('Logging out admin user...');
        
        // Clear saved section from localStorage
        localStorage.removeItem('adminDashboardActiveSection');
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear any stored auth data
        sessionStorage.clear();
        
        // Redirect to staff portal login
        window.location.href = 'staff-portal.html';
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        window.location.href = 'staff-portal.html';
    }
}

// Placeholder functions for future features
function loadCustomers() {
    console.log('Loading customers section...');
    
    // Initialize the customer management system that's defined in the HTML file
    if (typeof initializeCustomers === 'function') {
        console.log('Calling initializeCustomers...');
        initializeCustomers();
    } else {
        // If the function isn't available yet, try again after a short delay
        console.log('initializeCustomers not yet available, trying again...');
        setTimeout(() => {
            if (typeof initializeCustomers === 'function') {
                initializeCustomers();
            } else {
                console.error('Customer management system not found');
                // Show a loading message instead of "coming soon"
                const customersTableData = document.getElementById('customersTableData');
                if (customersTableData) {
                    customersTableData.innerHTML = `
                        <div class="loading">
                            <i class="ph-light ph-spinner"></i>
                            Loading customer management system...
                        </div>
                    `;
                }
            }
        }, 100);
    }
}

function loadAppointments() {
    console.log('Loading appointments section...');
    loadAppointmentsData();
}

/**
 * Load and display appointments
 */
async function loadAppointmentsData() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    
    // Add safety check for the element
    if (!appointmentsTable) {
        console.error('appointmentsTable element not found');
        return;
    }
    
    try {
        const result = await AdminDB.appointments.getAll();
        
        if (result.success) {
            allAppointments = result.data || [];
            displayAppointments(allAppointments);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        
        // Check if appointmentsTableData exists before trying to use it
        const appointmentsTableData = document.getElementById('appointmentsTableData');
        if (appointmentsTableData) {
            appointmentsTableData.innerHTML = `
                <div class="error" style="text-align: center; padding: 2rem;">
                    <i class="ph-light ph-warning"></i>
                    Error loading appointments: ${error.message}
                </div>
            `;
        } else {
            // Fallback to appointmentsTable if appointmentsTableData doesn't exist
            appointmentsTable.innerHTML = `
                <div class="error" style="text-align: center; padding: 2rem;">
                    <i class="ph-light ph-warning"></i>
                    Error loading appointments: ${error.message}
                </div>
            `;
        }
    }
}

/**
 * Display appointments in table
 */
function displayAppointments(appointments) {
    const appointmentsTableData = document.getElementById('appointmentsTableData');
    
    // Add safety check for the element
    if (!appointmentsTableData) {
        console.error('appointmentsTableData element not found');
        return;
    }
    
    if (appointments.length === 0) {
        appointmentsTableData.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: rgba(255, 255, 255, 0.6);">
                <i class="ph-light ph-calendar" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h4>No Appointments Scheduled</h4>
                <p>Create your first appointment to get started.</p>
            </div>
        `;
        return;
    }
    
    const appointmentsHTML = appointments.map(appointment => {
        const customerName = appointment.customers?.full_name || 'Unknown Customer';
        const customerEmail = appointment.customers?.email || '';
        const appointmentDateTime = `${formatDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}`;
        const duration = `${appointment.duration_minutes || 60} min`;
        const appointmentType = appointment.notes ? (appointment.notes.length > 30 ? appointment.notes.substring(0, 30) + '...' : appointment.notes) : 'General Appointment';
        
        return `
            <div class="table-row" ${!appointmentsEditMode ? `onclick="showAppointmentDetail('${appointment.id}')"` : ''}>
                ${appointmentsEditMode ? `<div class="table-cell"><input type="checkbox" class="appointment-checkbox" value="${appointment.id}" onclick="updateSelectAllState('appointment-checkbox','selectAllAppointments')"></div>` : ''}
                <div class="table-cell">
                    <span class="status-badge status-${appointment.status}">${formatAppointmentStatus(appointment.status)}</span>
                </div>
                <div class="table-cell">
                    <div style="font-weight: 500;">${appointmentDateTime}</div>
                    ${isUpcoming(appointment.appointment_date, appointment.appointment_time) ? '<div style="color: #7877c6; font-size: 0.75rem; margin-top: 0.25rem;">Upcoming</div>' : ''}
                </div>
                <div class="table-cell">
                    <div style="font-weight: 500;">${escapeHtml(customerName)}</div>
                    ${customerEmail ? `<div style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem;">${escapeHtml(customerEmail)}</div>` : ''}
                </div>
                <div class="table-cell">${duration}</div>
                <div class="table-cell">${escapeHtml(appointmentType)}</div>
                <div class="table-cell">
                    ${!appointmentsEditMode ? `
                        <div style="display: flex; gap: 0.5rem;">
                            ${appointment.status === 'scheduled' || appointment.status === 'confirmed' ? 
                                `<button class="btn secondary small" onclick="event.stopPropagation(); completeAppointment('${appointment.id}')" title="Mark Complete">
                                    <i class="ph-light ph-check"></i>
                                </button>` : ''
                            }
                            <button class="btn secondary small" onclick="event.stopPropagation(); editAppointment('${appointment.id}')" title="Edit">
                                <i class="ph-light ph-pencil"></i>
                            </button>
                            ${appointment.status !== 'cancelled' ? 
                                `<button class="btn secondary small" onclick="event.stopPropagation(); cancelAppointment('${appointment.id}')" title="Cancel">
                                    <i class="ph-light ph-x"></i>
                                </button>` : ''
                            }
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    appointmentsTableData.innerHTML = appointmentsHTML;
}

/**
 * Filter appointments based on current filters
 */
function filterAppointments() {
    // Add safety checks for filter elements
    const statusFilterElement = document.getElementById('appointmentStatusFilter');
    const sortByElement = document.getElementById('appointmentSortBy');
    const searchElement = document.getElementById('appointmentSearch');
    
    if (!statusFilterElement || !sortByElement) {
        console.error('Appointment filter elements not found');
        return;
    }
    
    const statusFilter = statusFilterElement.value;
    const sortBy = sortByElement.value;
    const searchQuery = searchElement?.value.toLowerCase() || '';
    
    let filtered = [...allAppointments];
    
    // Apply status filter
    if (statusFilter) {
        filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(appointment => {
            const customerName = appointment.customers?.full_name || '';
            const notes = appointment.notes || '';
            return customerName.toLowerCase().includes(searchQuery) ||
                   notes.toLowerCase().includes(searchQuery);
        });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'date_asc':
                const dateTimeA = new Date(`${a.appointment_date}T${a.appointment_time}`);
                const dateTimeB = new Date(`${b.appointment_date}T${b.appointment_time}`);
                return dateTimeA - dateTimeB;
            case 'date_desc':
                const dateTimeA2 = new Date(`${a.appointment_date}T${a.appointment_time}`);
                const dateTimeB2 = new Date(`${b.appointment_date}T${b.appointment_time}`);
                return dateTimeB2 - dateTimeA2;
            case 'customer':
                const nameA = a.customers?.full_name || '';
                const nameB = b.customers?.full_name || '';
                return nameA.localeCompare(nameB);
            case 'status':
                return a.status.localeCompare(b.status);
            default:
                // Default to upcoming appointments first
                const dateTimeDefaultA = new Date(`${a.appointment_date}T${a.appointment_time}`);
                const dateTimeDefaultB = new Date(`${b.appointment_date}T${b.appointment_time}`);
                return dateTimeDefaultA - dateTimeDefaultB;
        }
    });
    
    displayAppointments(filtered);
}

/**
 * Format appointment status for display
 */
function formatAppointmentStatus(status) {
    const statusMap = {
        'scheduled': 'Scheduled',
        'confirmed': 'Confirmed',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

/**
 * Format time (HH:MM format to readable format)
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Check if appointment is upcoming (within next 7 days)
 */
function isUpcoming(appointmentDate, appointmentTime) {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return appointmentDateTime > now && appointmentDateTime <= sevenDaysFromNow;
}

/**
 * Show appointment detail modal/panel
 */
function showAppointmentDetail(appointmentId) {
    const appointment = allAppointments.find(a => a.id === appointmentId);
    if (!appointment) {
        showNotification('Appointment not found', 'error');
        return;
    }
    
    const customerName = appointment.customers?.full_name || 'Unknown Customer';
    const customerEmail = appointment.customers?.email || 'No email';
    const customerPhone = appointment.customers?.phone || 'No phone';
    const appointmentDateTime = `${formatDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}`;
    const duration = `${appointment.duration_minutes || 60} minutes`;
    const endTime = calculateEndTime(appointment.appointment_time, appointment.duration_minutes || 60);
    
    // Create detail modal content
    const detailHTML = `
        <div class="appointment-detail-content">
            <div class="appointment-properties">
                <div class="property-item">
                    <div class="property-label">Status</div>
                    <div class="property-value">
                        <span class="status-badge status-${appointment.status}">${formatAppointmentStatus(appointment.status)}</span>
                    </div>
                </div>
                <div class="property-item">
                    <div class="property-label">Date & Time</div>
                    <div class="property-value">
                        <strong>${appointmentDateTime}</strong>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 0.25rem;">
                            Duration: ${duration} (ends at ${endTime})
                        </div>
                    </div>
                </div>
                <div class="property-item">
                    <div class="property-label">Customer</div>
                    <div class="property-value">
                        <strong>${escapeHtml(customerName)}</strong>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 0.25rem;">
                            📧 ${escapeHtml(customerEmail)}<br>
                            📞 ${escapeHtml(customerPhone)}
                        </div>
                    </div>
                </div>
                <div class="property-item">
                    <div class="property-label">Notes</div>
                    <div class="property-value">
                        ${appointment.notes ? escapeHtml(appointment.notes) : '<em style="color: rgba(255, 255, 255, 0.5);">No notes</em>'}
                    </div>
                </div>
                <div class="property-item">
                    <div class="property-label">Created</div>
                    <div class="property-value">${formatDateTime(appointment.created_at)}</div>
                </div>
                ${appointment.updated_at !== appointment.created_at ? `
                    <div class="property-item">
                        <div class="property-label">Last Updated</div>
                        <div class="property-value">${formatDateTime(appointment.updated_at)}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="appointment-actions" style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: flex-end;">
                ${appointment.status === 'scheduled' || appointment.status === 'confirmed' ? 
                    `<button class="btn success" onclick="completeAppointment('${appointment.id}'); closeModal('appointmentDetailModal');">
                        <i class="ph-light ph-check"></i> Mark Complete
                    </button>` : ''
                }
                <button class="btn secondary" onclick="editAppointment('${appointment.id}'); closeModal('appointmentDetailModal');">
                    <i class="ph-light ph-pencil"></i> Edit
                </button>
                ${appointment.status !== 'cancelled' ? 
                    `<button class="btn danger" onclick="cancelAppointment('${appointment.id}'); closeModal('appointmentDetailModal');">
                        <i class="ph-light ph-x"></i> Cancel
                    </button>` : ''
                }
                <button class="btn secondary" onclick="closeModal('appointmentDetailModal')">Close</button>
            </div>
        </div>
    `;
    
    // Show in a modal (we'll create this modal)
    showAppointmentDetailModal(appointment.id, `Appointment: ${appointmentDateTime}`, detailHTML);
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    const ampm = endHours >= 12 ? 'PM' : 'AM';
    const displayHour = endHours % 12 || 12;
    
    return `${displayHour}:${endMins.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Complete an appointment
 */
async function completeAppointment(appointmentId) {
    if (!confirm('Mark this appointment as completed?')) return;
    
    try {
        const result = await AdminDB.appointments.update(appointmentId, { 
            status: 'completed',
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            showNotification('Appointment marked as completed', 'success');
            await loadAppointmentsData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        showNotification('Error completing appointment: ' + error.message, 'error');
    }
}

/**
 * Cancel an appointment
 */
async function cancelAppointment(appointmentId) {
    if (!confirm('Cancel this appointment? This action cannot be undone.')) return;
    
    try {
        const result = await AdminDB.appointments.update(appointmentId, { 
            status: 'cancelled',
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            showNotification('Appointment cancelled', 'success');
            await loadAppointmentsData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Error cancelling appointment: ' + error.message, 'error');
    }
}

/**
 * Edit an appointment
 */
function editAppointment(appointmentId) {
    const appointment = allAppointments.find(a => a.id === appointmentId);
    if (!appointment) {
        showNotification('Appointment not found', 'error');
        return;
    }
    
    // Pre-fill the edit modal with appointment data
    document.getElementById('editAppointmentId').value = appointment.id;
    document.getElementById('editAppointmentCustomer').value = appointment.customer_id || '';
    document.getElementById('editAppointmentDate').value = appointment.appointment_date;
    document.getElementById('editAppointmentTime').value = appointment.appointment_time;
    document.getElementById('editAppointmentDuration').value = appointment.duration_minutes || 60;
    document.getElementById('editAppointmentStatus').value = appointment.status;
    document.getElementById('editAppointmentNotes').value = appointment.notes || '';
    
    // Load customers dropdown for editing
    loadCustomersDropdownForAppointment('editAppointmentCustomer');
    
    // Show edit modal
    document.getElementById('editAppointmentModal').style.display = 'block';
}

function showAddCustomerModal() {
    const modal = document.getElementById('addCustomerModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        showNotification('Add Customer modal not found', 'error');
    }
}

async function showCreateAppointmentModal() {
    console.log('showCreateAppointmentModal called');
    const modal = document.getElementById('createAppointmentModal');
    console.log('Modal element:', modal);
    modal.style.display = 'block';
    
    // Load customers for dropdown
    console.log('Loading customers for appointment dropdown');
    try {
        await loadCustomersDropdownForAppointment('appointmentCustomer');
        
        // Verify that customers were loaded
        const customerSelect = document.getElementById('appointmentCustomer');
        if (customerSelect && customerSelect.options.length <= 1) {
            console.warn('No customers available in dropdown');
            showNotification('No customers available. Please add customers first.', 'warning');
        }
    } catch (error) {
        console.error('Failed to load customers for appointment:', error);
        showNotification('Failed to load customer list: ' + error.message, 'error');
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;
    
    // Set default time to next available hour
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const timeString = nextHour.toTimeString().slice(0, 5);
    document.getElementById('appointmentTime').value = timeString;
    console.log('Modal setup completed');
}

/**
 * Load customers dropdown for appointments
 */
async function loadCustomersDropdownForAppointment(selectElementId) {
    console.log('loadCustomersDropdownForAppointment called with selectElementId:', selectElementId);
    try {
        console.log('About to call AdminDB.customers.getAll()');
        console.log('AdminDB available:', !!window.AdminDB);
        console.log('AdminDB.customers available:', !!window.AdminDB?.customers);
        console.log('AdminDB.customers.getAll available:', !!window.AdminDB?.customers?.getAll);
        
        const result = await AdminDB.customers.getAll();
        console.log('Customers result:', result);
        
        if (result.success) {
            const select = document.getElementById(selectElementId);
            console.log('Select element found:', select);
            if (select) {
                const optionsHTML = '<option value="">Select Customer</option>' +
                    result.data.map(customer => {
                        const customerName = customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
                        return `<option value="${customer.id}">${customerName} (${customer.email})</option>`;
                    }).join('');
                console.log('Options HTML generated:', optionsHTML);
                select.innerHTML = optionsHTML;
                console.log('Options set successfully');
            } else {
                console.error('Select element not found with ID:', selectElementId);
            }
        } else {
            console.error('Failed to get customers:', result.error);
        }
    } catch (error) {
        console.error('Error loading customers for appointment:', error);
    }
}

/**
 * Ensure AdminDB is properly initialized
 */
function ensureAdminDBInitialized() {
    if (typeof window.AdminDB === 'undefined') {
        console.error('AdminDB is not initialized');
        showNotification('Database connection not ready. Please refresh the page.', 'error');
        return false;
    }
    
    if (!window.AdminDB.appointments) {
        console.error('AdminDB.appointments is not available');
        showNotification('Appointment functions not available. Please refresh the page.', 'error');
        return false;
    }
    
    if (!window.AdminDB.appointments.create) {
        console.error('AdminDB.appointments.create is not available');
        showNotification('Create appointment function not available. Please refresh the page.', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle create appointment form submission
 */
async function handleCreateAppointment(e) {
    e.preventDefault();
    console.log('handleCreateAppointment called');
    
    // Check if AdminDB is properly initialized
    if (!ensureAdminDBInitialized()) {
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn.primary');
    console.log('Submit button found:', submitBtn);
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Creating...';
        
        const formData = {
            customer_id: document.getElementById('appointmentCustomer').value,
            appointment_date: document.getElementById('appointmentDate').value,
            appointment_time: document.getElementById('appointmentTime').value,
            duration_minutes: parseInt(document.getElementById('appointmentDuration').value),
            notes: document.getElementById('appointmentNotes').value,
            status: 'scheduled',
            created_by_staff: true
        };
        
        console.log('Form data collected:', formData);
        
        // Validate required fields
        if (!formData.customer_id) {
            throw new Error('Please select a customer');
        }
        
        if (!formData.appointment_date) {
            throw new Error('Please select a date');
        }
        
        if (!formData.appointment_time) {
            throw new Error('Please select a time');
        }
        
        // Validate date is not in the past
        const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
        if (appointmentDateTime < new Date()) {
            throw new Error('Appointment date and time cannot be in the past');
        }
        
        console.log('About to call AdminDB.appointments.create');
        console.log('AdminDB object:', window.AdminDB);
        console.log('AdminDB.appointments:', window.AdminDB?.appointments);
        console.log('AdminDB.appointments.create:', window.AdminDB?.appointments?.create);
        
        const result = await AdminDB.appointments.create(formData);
        console.log('Create result:', result);
        
        if (result.success) {
            showNotification('Appointment created successfully', 'success');
            closeModal('createAppointmentModal');
            
            // Refresh appointments if we're on that view
            if (currentSection === 'appointments') {
                await loadAppointmentsData();
            }
            
            // Reset form
            e.target.reset();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        showNotification('Error creating appointment: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-light ph-plus"></i> Create Appointment';
    }
}

/**
 * Handle edit appointment form submission
 */
async function handleEditAppointment(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.btn.primary');
    const appointmentId = document.getElementById('editAppointmentId').value;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-light ph-spinner"></i> Updating...';
        
        const formData = {
            customer_id: document.getElementById('editAppointmentCustomer').value,
            appointment_date: document.getElementById('editAppointmentDate').value,
            appointment_time: document.getElementById('editAppointmentTime').value,
            duration_minutes: parseInt(document.getElementById('editAppointmentDuration').value),
            status: document.getElementById('editAppointmentStatus').value,
            notes: document.getElementById('editAppointmentNotes').value,
            updated_at: new Date().toISOString()
        };
        
        // Validate required fields
        if (!formData.customer_id) {
            throw new Error('Please select a customer');
        }
        
        const result = await AdminDB.appointments.update(appointmentId, formData);
        
        if (result.success) {
            showNotification('Appointment updated successfully', 'success');
            closeModal('editAppointmentModal');
            
            // Refresh appointments
            await loadAppointmentsData();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        showNotification('Error updating appointment: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-light ph-check"></i> Update Appointment';
    }
}

/**
 * Show appointment detail modal
 */
function showAppointmentDetailModal(appointmentId, title, content) {
    // Create or update the detail modal
    let modal = document.getElementById('appointmentDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'appointmentDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="closeModal('appointmentDetailModal')">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
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

// --- Appointments Edit Mode Functions ---
function enterAppointmentsEditMode() {
    appointmentsEditMode = true;
    document.getElementById('appointmentsEditBtn').style.display = 'none';
    document.getElementById('appointmentsEditControls').style.display = 'flex';
    document.getElementById('appointmentsCheckboxHeaderCell').style.display = 'block';
    displayAppointments(allAppointments);
}

function exitAppointmentsEditMode() {
    appointmentsEditMode = false;
    document.getElementById('appointmentsEditBtn').style.display = 'block';
    document.getElementById('appointmentsEditControls').style.display = 'none';
    document.getElementById('appointmentsCheckboxHeaderCell').style.display = 'none';
    displayAppointments(allAppointments);
}

async function deleteSelectedAppointments() {
    const checkboxes = document.querySelectorAll('.appointment-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (!confirm('Are you sure you want to delete the selected appointments? This action cannot be undone.')) return;
    
    for (const cb of checkboxes) {
        await AdminDB.appointments.delete(cb.value);
    }
    
    await loadAppointmentsData();
    exitAppointmentsEditMode();
    showNotification(`${checkboxes.length} appointment(s) deleted successfully`, 'success');
}

/**
 * Test function for manual debugging - call from browser console
 */
function testNavigation() {
    console.log('=== NAVIGATION TEST ===');
    
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        const section = item.getAttribute('data-section');
        console.log(`Item ${index}: data-section="${section}", text="${item.textContent.trim()}"`);
    });
    
    // Test switching to tickets
    console.log('Testing switch to tickets...');
    switchSection('tickets');
    
    setTimeout(() => {
        console.log('Testing switch to customers...');
        switchSection('customers');
    }, 1000);
    
    setTimeout(() => {
        console.log('Testing switch back to dashboard...');
        switchSection('dashboard');
    }, 2000);
}

// Make test function globally available
window.testNavigation = testNavigation;

async function updateTicketAssignee(ticketId) {
    const assigneeId = document.getElementById('assignee-dropdown').value;
    const updates = {
        assigned_to: assigneeId || null
    };

    const result = await AdminDB.tickets.update(ticketId, updates);

    if (result.success) {
        showNotification('Ticket assignee updated!', 'success');
        await loadTickets();
    } else {
        showNotification('Error updating assignee: ' + result.error, 'error');
    }
}

/**
 * Test function to debug appointment creation
 */
async function testAppointmentCreation() {
    console.log('=== Testing Appointment Creation ===');
    
    // Test 1: Check if AdminDB is available
    console.log('1. AdminDB available:', !!window.AdminDB);
    console.log('2. AdminDB.appointments available:', !!window.AdminDB?.appointments);
    console.log('3. AdminDB.appointments.create available:', !!window.AdminDB?.appointments?.create);
    
    // Test 2: Check if we can get customers
    try {
        console.log('4. Testing customer retrieval...');
        const customersResult = await AdminDB.customers.getAll();
        console.log('5. Customers result:', customersResult);
    } catch (error) {
        console.error('6. Error getting customers:', error);
    }
    
    // Test 3: Check form elements
    console.log('7. appointmentCustomer element:', document.getElementById('appointmentCustomer'));
    console.log('8. appointmentDate element:', document.getElementById('appointmentDate'));
    console.log('9. appointmentTime element:', document.getElementById('appointmentTime'));
    
    // Test 4: Try creating a test appointment (commented out for safety)
    /*
    try {
        const testData = {
            customer_id: 'test-id',
            appointment_date: '2025-01-20',
            appointment_time: '10:00',
            duration_minutes: 60,
            notes: 'Test appointment',
            status: 'scheduled',
            created_by_staff: true
        };
        console.log('10. Testing appointment creation with test data:', testData);
        const result = await AdminDB.appointments.create(testData);
        console.log('11. Test creation result:', result);
    } catch (error) {
        console.error('12. Error in test creation:', error);
    }
    */
    
    console.log('=== End Test ===');
}

// Add to window for manual testing
window.testAppointmentCreation = testAppointmentCreation;