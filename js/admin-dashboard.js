// SpyderNet IT Admin Dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check admin authentication
    const authResult = await AdminAuth.requireAuth();
    if (!authResult) return;

    // Initialize dashboard
    init();
});

// Global state
let currentData = {
    contacts: [],
    tickets: [],
    customers: [],
    appointments: []
};

// Initialize dashboard
async function init() {
    setupEventListeners();
    displayAdminInfo();
    initializeTabs(); // Ensure clean tab state
    hideAllModals(); // Ensure all modals are hidden
    await loadAllData();
    updateStats();
}

// Initialize tabs - ensure only the first tab is active
function initializeTabs() {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-header').forEach(header => {
        header.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Set first tab as active
    const firstTabHeader = document.querySelector('.tab-header[data-tab="contacts"]');
    const firstTabContent = document.getElementById('contactsTab');
    
    if (firstTabHeader && firstTabContent) {
        firstTabHeader.classList.add('active');
        firstTabContent.classList.add('active');
    }
}

// Hide all modals on page load
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sign out
    document.getElementById('signOutBtn').addEventListener('click', async function() {
        if (confirm('Are you sure you want to sign out?')) {
            await AdminAuth.signOut();
            window.location.href = 'staff-portal.html';
        }
    });

    // Tab switching
    document.querySelectorAll('.tab-header').forEach(header => {
        header.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Refresh buttons
    document.getElementById('refreshContacts').addEventListener('click', () => loadContacts());
    document.getElementById('refreshTickets').addEventListener('click', () => loadTickets());
    document.getElementById('refreshCustomers').addEventListener('click', () => loadCustomers());
    document.getElementById('refreshAppointments').addEventListener('click', () => loadAppointments());

    // Create ticket button
    document.getElementById('createTicketBtn').addEventListener('click', showCreateTicketModal);

    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Create ticket form
    document.getElementById('createTicketForm').addEventListener('submit', handleCreateTicket);

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Display admin info
function displayAdminInfo() {
    const admin = AdminAuth.getCurrentAdmin();
    if (admin) {
        document.getElementById('adminName').textContent = admin.full_name;
    }
}

// Load all data
async function loadAllData() {
    await Promise.all([
        loadContacts(),
        loadTickets(),
        loadCustomers(),
        loadAppointments()
    ]);
}

// Load contact submissions
async function loadContacts() {
    showLoading('contactsTableBody');
    
    const result = await AdminDB.contactSubmissions.getAll();
    if (result.success) {
        currentData.contacts = result.data;
        renderContactsTable();
    } else {
        showError('contactsTableBody', 'Failed to load contact submissions');
    }
}

// Load tickets
async function loadTickets() {
    showLoading('ticketsTableBody');
    
    const result = await AdminDB.tickets.getAll();
    if (result.success) {
        currentData.tickets = result.data;
        renderTicketsTable();
    } else {
        showError('ticketsTableBody', 'Failed to load tickets');
    }
}

// Load customers
async function loadCustomers() {
    showLoading('customersTableBody');
    
    const result = await AdminDB.customers.getAll();
    if (result.success) {
        currentData.customers = result.data;
        renderCustomersTable();
    } else {
        showError('customersTableBody', 'Failed to load customers');
    }
}

// Load appointments
async function loadAppointments() {
    showLoading('appointmentsTableBody');
    
    const result = await AdminDB.appointments.getAll();
    if (result.success) {
        currentData.appointments = result.data;
        renderAppointmentsTable();
    } else {
        showError('appointmentsTableBody', 'Failed to load appointments');
    }
}

// Update dashboard stats
function updateStats() {
    // Pending contacts
    const pendingContacts = currentData.contacts.filter(c => !c.processed).length;
    document.getElementById('pendingContactsCount').textContent = pendingContacts;

    // Active tickets
    const activeTickets = currentData.tickets.filter(t => t.status !== 'closed').length;
    document.getElementById('activeTicketsCount').textContent = activeTickets;

    // Upcoming appointments
    const now = new Date();
    const upcomingAppointments = currentData.appointments.filter(a => 
        new Date(a.appointment_date) > now && a.status !== 'cancelled'
    ).length;
    document.getElementById('upcomingAppointmentsCount').textContent = upcomingAppointments;

    // Total customers
    document.getElementById('totalCustomersCount').textContent = currentData.customers.length;
}

// Switch tabs
function switchTab(tabName) {
    // Update tab headers
    document.querySelectorAll('.tab-header').forEach(header => {
        header.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Render contacts table
function renderContactsTable() {
    const tbody = document.getElementById('contactsTableBody');
    
    if (currentData.contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No contact submissions found</td></tr>';
        return;
    }

    tbody.innerHTML = currentData.contacts.map(contact => `
        <tr>
            <td>${formatDate(contact.created_at)}</td>
            <td>${escapeHtml(contact.full_name)}</td>
            <td>
                <div>${escapeHtml(contact.email)}</div>
                <div class="text-secondary">${escapeHtml(contact.phone || 'N/A')}</div>
            </td>
            <td>${escapeHtml(contact.service_type || 'General')}</td>
            <td>
                <span class="status-badge ${contact.processed ? 'status-completed' : 'status-pending'}">
                    ${contact.processed ? 'Processed' : 'Pending'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewContactDetails('${contact.id}')" title="View Details">
                        <i class="ph-light ph-eye"></i>
                    </button>
                    ${!contact.processed ? `
                        <button class="btn-icon" onclick="createTicketFromContact('${contact.id}')" title="Create Ticket">
                            <i class="ph-light ph-ticket"></i>
                        </button>
                        <button class="btn-icon" onclick="markContactProcessed('${contact.id}')" title="Mark Processed">
                            <i class="ph-light ph-check"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Render tickets table
function renderTicketsTable() {
    const tbody = document.getElementById('ticketsTableBody');
    
    if (currentData.tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No tickets found</td></tr>';
        return;
    }

    tbody.innerHTML = currentData.tickets.map(ticket => `
        <tr>
            <td>#${ticket.id.slice(-8)}</td>
            <td>${escapeHtml(ticket.customers?.full_name || 'Unknown')}</td>
            <td>${escapeHtml(ticket.title)}</td>
            <td>
                <span class="status-badge status-${ticket.status}">
                    ${capitalizeFirst(ticket.status)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${ticket.priority}">
                    ${capitalizeFirst(ticket.priority)}
                </span>
            </td>
            <td>${formatDate(ticket.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewTicketDetails('${ticket.id}')" title="View Details">
                        <i class="ph-light ph-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editTicket('${ticket.id}')" title="Edit Ticket">
                        <i class="ph-light ph-pencil-simple"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render customers table
function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    
    if (currentData.customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = currentData.customers.map(customer => `
        <tr>
            <td>${escapeHtml(customer.full_name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
            <td>${escapeHtml(customer.address || 'N/A')}</td>
            <td>${formatDate(customer.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewCustomerTickets('${customer.id}')" title="View Tickets">
                        <i class="ph-light ph-ticket"></i>
                    </button>
                    <button class="btn-icon" onclick="editCustomer('${customer.id}')" title="Edit Customer">
                        <i class="ph-light ph-pencil-simple"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render appointments table
function renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (currentData.appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No appointments found</td></tr>';
        return;
    }

    tbody.innerHTML = currentData.appointments.map(appointment => `
        <tr>
            <td>
                <div>${formatDateTime(appointment.appointment_date)}</div>
                <div class="text-secondary">${appointment.duration} minutes</div>
            </td>
            <td>${escapeHtml(appointment.customers?.full_name || 'Unknown')}</td>
            <td>${escapeHtml(appointment.service_type)}</td>
            <td>
                ${appointment.service_tickets ? 
                    `<a href="#" onclick="viewTicketDetails('${appointment.ticket_id}')">#${appointment.service_tickets.id.slice(-8)}</a>` : 
                    'N/A'
                }
            </td>
            <td>
                <span class="status-badge status-${appointment.status}">
                    ${capitalizeFirst(appointment.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editAppointment('${appointment.id}')" title="Edit Appointment">
                        <i class="ph-light ph-pencil-simple"></i>
                    </button>
                    <button class="btn-icon" onclick="cancelAppointment('${appointment.id}')" title="Cancel">
                        <i class="ph-light ph-x"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show create ticket modal
async function showCreateTicketModal() {
    // Load customers for dropdown
    const customerSelect = document.getElementById('ticketCustomer');
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    
    currentData.customers.forEach(customer => {
        customerSelect.innerHTML += `<option value="${customer.id}">${escapeHtml(customer.full_name)} (${escapeHtml(customer.email)})</option>`;
    });

    document.getElementById('createTicketModal').style.display = 'flex';
}

// Handle create ticket form
async function handleCreateTicket(e) {
    e.preventDefault();
    
    const formData = {
        customer_id: document.getElementById('ticketCustomer').value,
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        priority: document.getElementById('ticketPriority').value,
        status: 'open',
        created_by_staff: true,
        staff_notes: document.getElementById('ticketNotes').value || null
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    const result = await AdminDB.tickets.create(formData);
    
    if (result.success) {
        document.getElementById('createTicketModal').style.display = 'none';
        document.getElementById('createTicketForm').reset();
        showNotification('Ticket created successfully!', 'success');
        await loadTickets();
        updateStats();
    } else {
        showNotification('Failed to create ticket: ' + result.error, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Ticket';
}

// Action functions
async function viewContactDetails(contactId) {
    const contact = currentData.contacts.find(c => c.id === contactId);
    if (!contact) return;

    const content = `
        <div class="contact-details">
            <div class="detail-section">
                <h4>Contact Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Name:</label>
                        <span>${escapeHtml(contact.full_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${escapeHtml(contact.email)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone:</label>
                        <span>${escapeHtml(contact.phone || 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Service Type:</label>
                        <span>${escapeHtml(contact.service_type || 'General')}</span>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <h4>Message</h4>
                <div class="message-content">
                    ${escapeHtml(contact.message).replace(/\n/g, '<br>')}
                </div>
            </div>
            <div class="detail-section">
                <h4>Submission Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Submitted:</label>
                        <span>${formatDateTime(contact.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge ${contact.processed ? 'status-completed' : 'status-pending'}">
                            ${contact.processed ? 'Processed' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>
            ${!contact.processed ? `
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="createTicketFromContact('${contact.id}')">
                        <i class="ph-light ph-ticket"></i>
                        Create Ticket
                    </button>
                    <button class="btn btn-secondary" onclick="markContactProcessed('${contact.id}')">
                        <i class="ph-light ph-check"></i>
                        Mark Processed
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('contactDetailsContent').innerHTML = content;
    document.getElementById('contactDetailsModal').style.display = 'flex';
}

async function createTicketFromContact(contactId) {
    const contact = currentData.contacts.find(c => c.id === contactId);
    if (!contact) return;

    // Pre-fill create ticket form
    document.getElementById('ticketTitle').value = `${contact.service_type || 'Service Request'} - ${contact.full_name}`;
    document.getElementById('ticketDescription').value = contact.message;
    
    // Find customer by email
    const customer = currentData.customers.find(c => c.email === contact.email);
    if (customer) {
        document.getElementById('ticketCustomer').value = customer.id;
    }

    // Close contact modal and show ticket modal
    document.getElementById('contactDetailsModal').style.display = 'none';
    await showCreateTicketModal();
}

async function markContactProcessed(contactId) {
    if (!confirm('Mark this contact submission as processed?')) return;

    const result = await AdminDB.contactSubmissions.markAsProcessed(contactId);
    
    if (result.success) {
        showNotification('Contact marked as processed', 'success');
        await loadContacts();
        updateStats();
    } else {
        showNotification('Failed to update contact', 'error');
    }
}

// Utility functions
function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<tr><td colspan="10" class="loading">Loading...</td></tr>';
}

function showError(elementId, message) {
    document.getElementById(elementId).innerHTML = `<tr><td colspan="10" class="error">${message}</td></tr>`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Placeholder functions for other actions
async function viewTicketDetails(ticketId) {
    showNotification('Ticket details view - Coming soon!', 'info');
}

async function editTicket(ticketId) {
    showNotification('Ticket editing - Coming soon!', 'info');
}

async function viewCustomerTickets(customerId) {
    showNotification('Customer ticket view - Coming soon!', 'info');
}

async function editCustomer(customerId) {
    showNotification('Customer editing - Coming soon!', 'info');
}

async function editAppointment(appointmentId) {
    showNotification('Appointment editing - Coming soon!', 'info');
}

async function cancelAppointment(appointmentId) {
    if (!confirm('Cancel this appointment?')) return;
    showNotification('Appointment cancellation - Coming soon!', 'info');
} 