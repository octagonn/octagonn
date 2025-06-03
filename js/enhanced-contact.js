// Enhanced Contact Form with Ticket Creation
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkUserStatus();
    
    // Setup form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
});

// Check user authentication status
async function checkUserStatus() {
    try {
        const user = await SpyderNetDB.auth.getCurrentUser();
        const loginSection = document.getElementById('loginPrompt');
        const customerInfo = document.getElementById('customerInfo');
        
        if (user) {
            // User is logged in - show customer info section
            if (loginSection) loginSection.style.display = 'none';
            if (customerInfo) {
                customerInfo.style.display = 'block';
                await loadCustomerInfo(user);
            }
            
            // Update form for ticket creation
            updateFormForTicketCreation();
        } else {
            // User not logged in - show login prompt
            if (loginSection) loginSection.style.display = 'block';
            if (customerInfo) customerInfo.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking user status:', error);
        // If Supabase isn't loaded or there's an error, treat as not logged in
        const loginSection = document.getElementById('loginPrompt');
        const customerInfo = document.getElementById('customerInfo');
        if (loginSection) loginSection.style.display = 'block';
        if (customerInfo) customerInfo.style.display = 'none';
    }
}

// Load customer information
async function loadCustomerInfo(user) {
    try {
        const customerResult = await SpyderNetDB.db.customers.getByUserId(user.id);
        if (customerResult.success) {
            const customer = customerResult.data;
            
            // Update customer info display
            document.getElementById('customerName').textContent = customer.full_name || 'Customer';
            document.getElementById('customerEmail').textContent = customer.email;
            
            // Pre-fill form fields
            const nameField = document.querySelector('input[name="name"]');
            const emailField = document.querySelector('input[name="email"]');
            const phoneField = document.querySelector('input[name="phone"]');
            
            if (nameField) nameField.value = customer.full_name || '';
            if (emailField) emailField.value = customer.email || '';
            if (phoneField) phoneField.value = customer.phone || '';
            
            // Make customer fields readonly since they're logged in
            if (nameField) nameField.readOnly = true;
            if (emailField) emailField.readOnly = true;
        }
    } catch (error) {
        console.error('Error loading customer info:', error);
    }
}

// Update form for ticket creation
function updateFormForTicketCreation() {
    // Update form heading and description
    const formHeading = document.querySelector('.contact-content h2');
    const formDescription = document.querySelector('.contact-content p');
    
    if (formHeading) {
        formHeading.textContent = 'Create Service Request';
    }
    
    if (formDescription) {
        formDescription.textContent = 'Submit a new service request. We\'ll create a ticket and get back to you soon.';
    }
    
    // Add priority field
    addPriorityField();
    
    // Update submit button text
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="ph-light ph-ticket"></i> Create Service Ticket';
    }
}

// Add priority field to form
function addPriorityField() {
    const messageGroup = document.querySelector('.form-group:has(textarea[name="message"])');
    if (messageGroup && !document.getElementById('priorityField')) {
        const priorityGroup = document.createElement('div');
        priorityGroup.className = 'form-group';
        priorityGroup.id = 'priorityField';
        priorityGroup.innerHTML = `
            <label for="priority">Priority Level:</label>
            <select name="priority" id="priority" required>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
            </select>
        `;
        
        messageGroup.parentNode.insertBefore(priorityGroup, messageGroup);
    }
}

// Handle contact form submission
async function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitButton.disabled = true;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="ph-light ph-spinner"></i> Processing...';
    
    try {
        // Check if user is logged in
        const user = await SpyderNetDB.auth.getCurrentUser();
        
        if (user) {
            // Create service ticket
            await createServiceTicket(formData, user);
        } else {
            // Send regular contact form (you can implement email sending here)
            await sendRegularContact(formData);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showContactMessage('An error occurred. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Create service ticket for logged-in users
async function createServiceTicket(formData, user) {
    try {
        // Get customer data
        const customerResult = await SpyderNetDB.db.customers.getByUserId(user.id);
        if (!customerResult.success) {
            throw new Error('Could not find customer data');
        }
        
        const customer = customerResult.data;
        
        // Prepare ticket data
        const ticketData = {
            customer_id: customer.id,
            title: formData.get('subject') || 'Service Request',
            description: formData.get('message'),
            priority: formData.get('priority') || 'normal',
            status: 'new'
        };
        
        // Create ticket
        const ticketResult = await SpyderNetDB.db.tickets.create(ticketData);
        
        if (ticketResult.success) {
            const ticket = ticketResult.data;
            showContactMessage(
                `Service ticket created successfully! Ticket ID: #${ticket.id.slice(-8)}. You can track this ticket in your customer portal.`,
                'success'
            );
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Show portal link
            showPortalLink();
            
        } else {
            throw new Error(ticketResult.error);
        }
        
    } catch (error) {
        console.error('Error creating service ticket:', error);
        showContactMessage('Error creating service ticket: ' + error.message, 'error');
    }
}

// Send regular contact form (for non-logged-in users)
async function sendRegularContact(formData) {
    // This would typically send an email or save to a database
    // For now, we'll just show a success message
    console.log('Regular contact form submission:', Object.fromEntries(formData));
    
    showContactMessage(
        'Thank you for your message! We\'ll get back to you within 24 hours. For faster service, consider creating an account to track your requests.',
        'success'
    );
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Show signup prompt
    showSignupPrompt();
}

// Show contact message
function showContactMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.contact-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="ph-light ${type === 'success' ? 'ph-check-circle' : type === 'error' ? 'ph-warning-circle' : 'ph-info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Insert after form
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Auto-hide after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 10000);
    }
}

// Show portal link after ticket creation
function showPortalLink() {
    const portalLink = document.createElement('div');
    portalLink.className = 'portal-link-container';
    portalLink.innerHTML = `
        <div class="glass-card" style="margin-top: 20px; text-align: center;">
            <h4>Track Your Service Request</h4>
            <p>Visit your customer portal to view ticket status and schedule appointments.</p>
            <a href="customer-portal.html" class="btn btn-primary">
                <i class="ph-light ph-arrow-right"></i>
                Go to Customer Portal
            </a>
        </div>
    `;
    
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(portalLink, form.nextSibling.nextSibling);
}

// Show signup prompt for non-logged-in users
function showSignupPrompt() {
    const signupPrompt = document.createElement('div');
    signupPrompt.className = 'signup-prompt-container';
    signupPrompt.innerHTML = `
        <div class="glass-card" style="margin-top: 20px; text-align: center;">
            <h4>Want to Track Your Request?</h4>
            <p>Create a customer account to track your service requests, view history, and schedule appointments.</p>
            <a href="login.html" class="btn btn-primary">
                <i class="ph-light ph-user-plus"></i>
                Create Account
            </a>
        </div>
    `;
    
    const form = document.getElementById('contactForm');
    const nextElement = form.nextSibling.nextSibling || form.nextSibling;
    form.parentNode.insertBefore(signupPrompt, nextElement);
} 