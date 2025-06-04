// Admin Dashboard JavaScript - Zendesk Style Layout
let currentView = 'unsolved-tickets';
let currentTicketId = null;
let allTickets = [];
let allCustomers = [];
let allContacts = [];
let allAppointments = [];
let allCancellationRequests = [];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    
    // Check admin authentication
    if (!AdminAuth.getCurrentAdmin()) {
        console.log('No admin session found, redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }

    initializeDashboard();
});

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Setup UI components
        setupEventHandlers();
        
        // Load admin info
        await loadAdminInfo();
        
        // Load initial data
        await loadDashboardData();
        
        // Set up auto-refresh
        setupAutoRefresh();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showNotification('Failed to initialize dashboard', 'error');
    }
}

// Setup all event handlers
function setupEventHandlers() {
    // Navigation handlers
    setupNavigationHandlers();
    
    // Modal handlers
    setupModalHandlers();
    
    // Form handlers
    setupFormHandlers();
    
    // Search handlers
    setupSearchHandlers();
    
    // Table handlers
    setupTableHandlers();
    
    // Ticket detail handlers
    setupTicketDetailHandlers();
}

// Setup navigation event handlers
function setupNavigationHandlers() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
    
    // Sign out
    document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);
    
    // Refresh current view
    document.getElementById('refreshCurrentView')?.addEventListener('click', function() {
        refreshCurrentView();
    });
}

// Setup modal event handlers
function setupModalHandlers() {
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Ticket detail sidebar close
    document.querySelector('.close-detail-sidebar')?.addEventListener('click', function() {
        document.getElementById('ticketDetailSidebar').style.display = 'none';
    });
}

// Setup form event handlers
function setupFormHandlers() {
    // Create ticket form
    const createTicketForm = document.getElementById('createTicketForm');
    if (createTicketForm) {
        createTicketForm.addEventListener('submit', handleCreateTicket);
    }
    
    // Create ticket button
    document.getElementById('createTicketBtn')?.addEventListener('click', function() {
        showCreateTicketModal();
    });
    
    // Reply form
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', handleReplySubmit);
    }
    
    // Reply type buttons
    document.querySelectorAll('.reply-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.reply-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Setup search handlers
function setupSearchHandlers() {
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
    }
    
    // Filter handlers
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('priorityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sortBy')?.addEventListener('change', applySorting);
}

// Setup table handlers
function setupTableHandlers() {
    // Select all checkbox
    document.getElementById('selectAllTickets')?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.tickets-table tbody input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = this.checked);
        updateBulkActions();
    });
    
    // Bulk actions
    document.getElementById('applyBulkAction')?.addEventListener('click', handleBulkAction);
}

// Setup ticket detail handlers
function setupTicketDetailHandlers() {
    // Property updates
    document.getElementById('ticketStatusSelect')?.addEventListener('change', function() {
        updateTicketProperty('status', this.value);
    });
    
    document.getElementById('ticketPrioritySelect')?.addEventListener('change', function() {
        updateTicketProperty('priority', this.value);
    });
    
    document.getElementById('ticketTypeSelect')?.addEventListener('change', function() {
        updateTicketProperty('type', this.value);
    });
    
    // Tag input
    document.getElementById('addTagInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTicketTag(this.value.trim());
            this.value = '';
        }
    });
}

// Load admin information
async function loadAdminInfo() {
    try {
        const admin = AdminAuth.getCurrentAdmin();
        if (admin && admin.name) {
            document.getElementById('adminName').textContent = admin.name;
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        showLoading();
        
        // Load all data in parallel
        const [tickets, customers, contacts, appointments, cancellationRequests] = await Promise.all([
            AdminDB.tickets.getAll(),
            AdminDB.customers.getAll(),
            AdminDB.contacts.getAll(),
            AdminDB.appointments.getAll(),
            AdminDB.appointmentCancellationRequests.getAll()
        ]);
        
        // Store data globally
        allTickets = tickets || [];
        allCustomers = customers || [];
        allContacts = contacts || [];
        allAppointments = appointments || [];
        allCancellationRequests = cancellationRequests || [];
        
        // Update UI
        updateDashboardStats();
        updateSidebarCounts();
        updateCurrentView();
        
        // Load customers into create ticket dropdown
        loadCustomerDropdown();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        hideLoading();
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const activeTickets = allTickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
    const pendingContacts = allContacts.filter(c => c.status === 'pending').length;
    
    // Update sidebar stats
    document.getElementById('sidebarActiveTickets').textContent = activeTickets;
    document.getElementById('sidebarPendingContacts').textContent = pendingContacts;
}

// Update sidebar counts
function updateSidebarCounts() {
    const now = new Date();
    
    // Ticket counts
    const unsolvedTickets = allTickets.filter(t => t.status === 'new' || t.status === 'in_progress').length;
    const unassignedTickets = allTickets.filter(t => !t.assigned_to && t.status !== 'completed' && t.status !== 'cancelled').length;
    const recentlySolved = allTickets.filter(t => {
        if (t.status !== 'completed') return false;
        const completedDate = new Date(t.completed_at || t.updated_at);
        const daysDiff = (now - completedDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
    }).length;
    const pendingTickets = allTickets.filter(t => t.status === 'new').length;
    
    // Contact and customer counts
    const contactSubmissions = allContacts.filter(c => c.status === 'pending').length;
    const allCustomersCount = allCustomers.length;
    
    // Appointment counts
    const upcomingAppointments = allAppointments.filter(a => {
        const appointmentDate = new Date(a.appointment_date + 'T' + a.appointment_time);
        return appointmentDate > now && a.status !== 'cancelled';
    }).length;
    const cancellationRequestsCount = allCancellationRequests.filter(r => r.status === 'pending').length;
    const allAppointmentsCount = allAppointments.length;
    
    // Update counts in sidebar
    document.getElementById('unsolvedTicketsCount').textContent = unsolvedTickets;
    document.getElementById('unassignedTicketsCount').textContent = unassignedTickets;
    document.getElementById('allTicketsCount').textContent = allTickets.length;
    document.getElementById('recentlySolvedCount').textContent = recentlySolved;
    document.getElementById('pendingTicketsCount').textContent = pendingTickets;
    document.getElementById('contactSubmissionsCount').textContent = contactSubmissions;
    document.getElementById('allCustomersCount').textContent = allCustomersCount;
    document.getElementById('upcomingAppointmentsCount').textContent = upcomingAppointments;
    document.getElementById('cancellationRequestsCount').textContent = cancellationRequestsCount;
    document.getElementById('allAppointmentsCount').textContent = allAppointmentsCount;
}

// Switch between views
function switchView(view) {
    currentView = view;
    
    // Update active navigation item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });
    
    // Update view title and content
    updateCurrentView();
}

// Update current view content
function updateCurrentView() {
    const viewTitle = document.getElementById('currentViewTitle');
    const viewCount = document.getElementById('currentViewCount');
    
    // Hide all list views
    document.querySelectorAll('.list-view').forEach(view => {
        view.classList.remove('active');
    });
    
    let filteredData = [];
    let viewTitleText = '';
    let countText = '';
    
    switch (currentView) {
        case 'unsolved-tickets':
            filteredData = allTickets.filter(t => t.status === 'new' || t.status === 'in_progress');
            viewTitleText = 'Your unsolved tickets';
            countText = `${filteredData.length} tickets`;
            showTicketListView(filteredData);
            break;
            
        case 'unassigned-tickets':
            filteredData = allTickets.filter(t => !t.assigned_to && t.status !== 'completed' && t.status !== 'cancelled');
            viewTitleText = 'Unassigned tickets';
            countText = `${filteredData.length} tickets`;
            showTicketListView(filteredData);
            break;
            
        case 'all-tickets':
            filteredData = allTickets;
            viewTitleText = 'All tickets';
            countText = `${filteredData.length} tickets`;
            showTicketListView(filteredData);
            break;
            
        case 'recently-solved':
            const now = new Date();
            filteredData = allTickets.filter(t => {
                if (t.status !== 'completed') return false;
                const completedDate = new Date(t.completed_at || t.updated_at);
                const daysDiff = (now - completedDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            });
            viewTitleText = 'Recently solved tickets';
            countText = `${filteredData.length} tickets`;
            showTicketListView(filteredData);
            break;
            
        case 'pending-tickets':
            filteredData = allTickets.filter(t => t.status === 'new');
            viewTitleText = 'Pending tickets';
            countText = `${filteredData.length} tickets`;
            showTicketListView(filteredData);
            break;
            
        case 'contact-submissions':
            filteredData = allContacts;
            viewTitleText = 'Contact submissions';
            countText = `${filteredData.length} submissions`;
            showContactListView(filteredData);
            break;
            
        case 'all-customers':
            filteredData = allCustomers;
            viewTitleText = 'All customers';
            countText = `${filteredData.length} customers`;
            showCustomerListView(filteredData);
            break;
            
        case 'upcoming-appointments':
            const upcoming = allAppointments.filter(a => {
                const appointmentDate = new Date(a.appointment_date + 'T' + a.appointment_time);
                return appointmentDate > new Date() && a.status !== 'cancelled';
            });
            filteredData = upcoming;
            viewTitleText = 'Upcoming appointments';
            countText = `${filteredData.length} appointments`;
            showAppointmentListView(filteredData);
            break;
            
        case 'cancellation-requests':
            filteredData = allCancellationRequests;
            viewTitleText = 'Cancellation requests';
            countText = `${filteredData.length} requests`;
            showCancellationRequestsView(filteredData);
            break;
            
        case 'all-appointments':
            filteredData = allAppointments;
            viewTitleText = 'All appointments';
            countText = `${filteredData.length} appointments`;
            showAppointmentListView(filteredData);
            break;
    }
    
    viewTitle.textContent = viewTitleText;
    viewCount.textContent = countText;
}

// Show ticket list view
function showTicketListView(tickets) {
    const ticketListView = document.getElementById('ticketListView');
    const ticketsTableBody = document.getElementById('ticketsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    ticketListView.classList.add('active');
    
    if (tickets.length === 0) {
        ticketsTableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    ticketsTableBody.innerHTML = tickets.map(ticket => {
        const customer = allCustomers.find(c => c.id === ticket.customer_id);
        const customerName = customer ? customer.name : 'Unknown Customer';
        const customerEmail = customer ? customer.email : '';
        
        const createdDate = new Date(ticket.created_at);
        const timeAgo = getTimeAgo(createdDate);
        
        const typeClass = ticket.service_type ? `type-${ticket.service_type.toLowerCase().replace(/\s+/g, '-')}` : 'type-question';
        
        return `
            <tr data-ticket-id="${ticket.id}" class="ticket-row">
                <td class="checkbox-col">
                    <input type="checkbox" value="${ticket.id}">
                </td>
                <td class="id-col">#${ticket.id}</td>
                <td class="subject-col">
                    <a href="#" class="ticket-subject" onclick="openTicketDetail(${ticket.id})">${escapeHtml(ticket.title)}</a>
                </td>
                <td class="requester-col">
                    <div class="requester-info">
                        <div class="requester-name">${escapeHtml(customerName)}</div>
                        <div class="requester-email">${escapeHtml(customerEmail)}</div>
                    </div>
                </td>
                <td class="requested-col">${timeAgo}</td>
                <td class="type-col">
                    <span class="type-badge ${typeClass}">${ticket.service_type || 'Question'}</span>
                </td>
                <td class="priority-col">
                    <span class="priority-badge priority-${ticket.priority}">${capitalizeFirst(ticket.priority)}</span>
                </td>
                <td class="status-col">
                    <span class="status-badge status-${ticket.status}">${getStatusDisplay(ticket.status)}</span>
                </td>
                <td class="actions-col">
                    <button class="btn-icon" onclick="openTicketDetail(${ticket.id})" title="View ticket">
                        <i class="ph-light ph-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editTicket(${ticket.id})" title="Edit ticket">
                        <i class="ph-light ph-pencil-simple"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add click handlers for rows
    document.querySelectorAll('.ticket-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                const ticketId = this.dataset.ticketId;
                openTicketDetail(parseInt(ticketId));
            }
        });
    });
    
    // Add checkbox change handlers
    document.querySelectorAll('.tickets-table tbody input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

// Show contact list view (placeholder)
function showContactListView(contacts) {
    // For now, redirect to ticket view - you can implement this later
    console.log('Contact list view - showing', contacts.length, 'contacts');
    // Implementation would be similar to ticket list view
}

// Show customer list view (placeholder)
function showCustomerListView(customers) {
    // For now, redirect to ticket view - you can implement this later
    console.log('Customer list view - showing', customers.length, 'customers');
    // Implementation would be similar to ticket list view
}

// Show appointment list view (placeholder)
function showAppointmentListView(appointments) {
    // For now, redirect to ticket view - you can implement this later
    console.log('Appointment list view - showing', appointments.length, 'appointments');
    // Implementation would be similar to ticket list view
}

// Show cancellation requests view (placeholder)
function showCancellationRequestsView(requests) {
    // For now, redirect to ticket view - you can implement this later
    console.log('Cancellation requests view - showing', requests.length, 'requests');
    // Implementation would be similar to ticket list view
}

// Open ticket detail modal
async function openTicketDetail(ticketId) {
    try {
        currentTicketId = ticketId;
        const ticket = allTickets.find(t => t.id === ticketId);
        const customer = allCustomers.find(c => c.id === ticket.customer_id);
        
        if (!ticket) {
            showNotification('Ticket not found', 'error');
            return;
        }
        
        // Update modal content
        document.getElementById('modalTicketSubject').textContent = ticket.title;
        document.getElementById('modalTicketId').textContent = `#${ticket.id}`;
        document.getElementById('modalTicketCreated').textContent = `Created ${getTimeAgo(new Date(ticket.created_at))}`;
        document.getElementById('modalTicketStatus').textContent = getStatusDisplay(ticket.status);
        document.getElementById('modalTicketPriority').textContent = capitalizeFirst(ticket.priority);
        document.getElementById('modalTicketType').textContent = ticket.service_type || 'Question';
        document.getElementById('modalTicketCreatedDate').textContent = getTimeAgo(new Date(ticket.created_at));
        
        // Update customer info
        if (customer) {
            document.getElementById('modalCustomerName').textContent = customer.name;
            document.getElementById('modalCustomerEmail').textContent = customer.email;
            document.getElementById('modalCustomerPhone').textContent = customer.phone || 'N/A';
            document.getElementById('modalCustomerLocation').textContent = customer.address || 'N/A';
        }
        
        // Load conversation
        await loadTicketConversation(ticketId);
        
        // Show modal
        document.getElementById('ticketDetailModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error opening ticket detail:', error);
        showNotification('Failed to load ticket details', 'error');
    }
}

// Load ticket conversation
async function loadTicketConversation(ticketId) {
    try {
        const messages = await AdminDB.messages.getByTicketId(ticketId);
        const conversationDiv = document.getElementById('conversationMessages');
        
        if (!messages || messages.length === 0) {
            conversationDiv.innerHTML = `
                <div class="conversation-message staff-message">
                    <div class="message-header">
                        <span class="message-author">System</span>
                        <span class="message-time">Ticket created</span>
                    </div>
                    <div class="message-content">
                        This ticket was created and is ready for your response.
                    </div>
                </div>
            `;
            return;
        }
        
        conversationDiv.innerHTML = messages.map(message => {
            const isFromStaff = message.is_from_staff;
            const isInternal = message.is_internal;
            const messageClass = isInternal ? 'internal-message' : (isFromStaff ? 'staff-message' : 'customer-message');
            
            return `
                <div class="conversation-message ${messageClass}">
                    <div class="message-header">
                        <span class="message-author">
                            ${escapeHtml(isFromStaff ? (message.staff_name || 'Staff') : message.customer_name || 'Customer')}
                            ${isInternal ? '<span class="internal-badge">Internal</span>' : ''}
                        </span>
                        <span class="message-time">${getTimeAgo(new Date(message.created_at))}</span>
                    </div>
                    <div class="message-content">
                        ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
        
    } catch (error) {
        console.error('Error loading conversation:', error);
        showNotification('Failed to load conversation', 'error');
    }
}

// Handle reply form submission
async function handleReplySubmit(e) {
    e.preventDefault();
    
    if (!currentTicketId) {
        showNotification('No ticket selected', 'error');
        return;
    }
    
    const message = document.getElementById('replyMessage').value.trim();
    if (!message) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    const isInternal = document.querySelector('.reply-type-btn.active').dataset.type === 'internal';
    const solveTicket = document.getElementById('solveTicket').checked;
    
    try {
        const admin = AdminAuth.getCurrentAdmin();
        
        // Create message
        await AdminDB.messages.create({
            ticket_id: currentTicketId,
            message: message,
            is_from_staff: true,
            is_internal: isInternal,
            staff_name: admin.name || 'Staff'
        });
        
        // Update ticket status if solving
        if (solveTicket) {
            await AdminDB.tickets.update(currentTicketId, {
                status: 'completed',
                completed_at: new Date().toISOString()
            });
        }
        
        // Clear form
        document.getElementById('replyMessage').value = '';
        document.getElementById('solveTicket').checked = false;
        
        // Reload conversation and data
        await loadTicketConversation(currentTicketId);
        await loadDashboardData();
        
        showNotification('Reply sent successfully', 'success');
        
    } catch (error) {
        console.error('Error sending reply:', error);
        showNotification('Failed to send reply', 'error');
    }
}

// Show create ticket modal
async function showCreateTicketModal() {
    await loadCustomerDropdown();
    document.getElementById('createTicketModal').style.display = 'flex';
}

// Load customers into dropdown
async function loadCustomerDropdown() {
    const customerSelect = document.getElementById('ticketCustomer');
    if (!customerSelect) return;
    
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    
    allCustomers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} (${customer.email})`;
        customerSelect.appendChild(option);
    });
}

// Handle create ticket form submission
async function handleCreateTicket(e) {
    e.preventDefault();
    
    console.log('Creating ticket...');
    
    const admin = AdminAuth.getCurrentAdmin();
    
    const formData = {
        customer_id: document.getElementById('ticketCustomer').value,
        title: document.getElementById('ticketTitle').value.trim(),
        description: document.getElementById('ticketDescription').value.trim(),
        priority: document.getElementById('ticketPriority').value,
        status: document.getElementById('ticketStatus').value,
        service_type: document.getElementById('ticketType').value
    };

    // Add staff notes to description if provided
    const staffNotes = document.getElementById('ticketNotes').value.trim();
    if (staffNotes) {
        formData.staff_notes = staffNotes;
    }

    // Validation
    if (!formData.customer_id) {
        showNotification('Please select a customer', 'error');
        return;
    }
    
    if (formData.title.length < 5) {
        showNotification('Title must be at least 5 characters long', 'error');
        return;
    }
    
    if (formData.description.length < 20) {
        showNotification('Description must be at least 20 characters long', 'error');
        return;
    }

    try {
        console.log('Creating ticket with data:', formData);
        
        // Create the ticket
        const newTicket = await AdminDB.tickets.create(formData);
        console.log('Ticket created successfully:', newTicket);
        
        // Assign to current admin if checkbox is checked
        if (document.getElementById('ticketAssignToMe').checked) {
            await AdminDB.tickets.update(newTicket.id, {
                assigned_to: admin.email
            });
        }
        
        // Close modal and reset form
        document.getElementById('createTicketModal').style.display = 'none';
        document.getElementById('createTicketForm').reset();
        
        // Refresh data
        await loadDashboardData();
        
        showNotification('Ticket created successfully!', 'success');
        
        // Open the new ticket
        setTimeout(() => {
            openTicketDetail(newTicket.id);
        }, 500);
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        let errorMessage = 'Failed to create ticket';
        
        if (error.message && error.message.includes('could not find the')) {
            errorMessage = 'Database schema error. Please run the column fix script first.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
    }
}

// Handle global search
function handleGlobalSearch(searchTerm) {
    console.log('Searching for:', searchTerm);
    // Implementation for global search across all data
    // This would filter the current view based on the search term
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const priorityFilter = document.getElementById('priorityFilter')?.value;
    
    // Re-filter current view data
    updateCurrentView();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortBy')?.value;
    
    // Re-sort current view data
    updateCurrentView();
}

// Update bulk actions visibility
function updateBulkActions() {
    const checkedBoxes = document.querySelectorAll('.tickets-table tbody input[type="checkbox"]:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

// Handle bulk actions
function handleBulkAction() {
    const action = document.querySelector('.bulk-action-select').value;
    const checkedBoxes = document.querySelectorAll('.tickets-table tbody input[type="checkbox"]:checked');
    const ticketIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (!action || ticketIds.length === 0) {
        showNotification('Please select an action and tickets', 'error');
        return;
    }
    
    console.log('Bulk action:', action, 'on tickets:', ticketIds);
    // Implementation for bulk actions
}

// Update ticket property
async function updateTicketProperty(property, value) {
    if (!currentTicketId) return;
    
    try {
        const updateData = {};
        updateData[property] = value;
        
        if (property === 'status' && value === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }
        
        await AdminDB.tickets.update(currentTicketId, updateData);
        
        // Update local data
        const ticketIndex = allTickets.findIndex(t => t.id === currentTicketId);
        if (ticketIndex !== -1) {
            Object.assign(allTickets[ticketIndex], updateData);
        }
        
        // Update UI
        updateDashboardStats();
        updateSidebarCounts();
        updateCurrentView();
        
        showNotification(`Ticket ${property} updated`, 'success');
        
    } catch (error) {
        console.error(`Error updating ticket ${property}:`, error);
        showNotification(`Failed to update ticket ${property}`, 'error');
    }
}

// Add ticket tag
function addTicketTag(tag) {
    if (!tag || !currentTicketId) return;
    
    const tagsContainer = document.getElementById('ticketTags');
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${escapeHtml(tag)}
        <button class="tag-remove" onclick="removeTicketTag(this)">×</button>
    `;
    tagsContainer.appendChild(tagElement);
}

// Remove ticket tag
function removeTicketTag(button) {
    button.closest('.tag').remove();
}

// Refresh current view
async function refreshCurrentView() {
    await loadDashboardData();
    showNotification('Data refreshed', 'success');
}

// Handle sign out
function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        AdminAuth.signOut();
        window.location.href = 'admin-login.html';
    }
}

// Setup auto-refresh
function setupAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(async () => {
        try {
            await loadDashboardData();
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, 5 * 60 * 1000);
}

// Utility functions
function showLoading() {
    // You can implement a loading spinner here
    console.log('Loading...');
}

function hideLoading() {
    console.log('Loading complete');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="ph-light ${type === 'success' ? 'ph-check-circle' : type === 'error' ? 'ph-warning-circle' : 'ph-info'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add close handler
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusDisplay(status) {
    const statusMap = {
        'new': 'New',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global functions for onclick handlers
window.openTicketDetail = openTicketDetail;
window.editTicket = function(ticketId) {
    console.log('Edit ticket:', ticketId);
    // Implementation for editing tickets
};
window.removeTicketTag = removeTicketTag; 