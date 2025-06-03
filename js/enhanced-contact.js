// Enhanced Contact Form - Updated for Staff-Only Ticket Creation
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
            
            // Update form messaging for logged-in users
            updateFormForLoggedInUser();
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

// Update form for logged-in users
function updateFormForLoggedInUser() {
    // Update form heading and description
    const formHeading = document.querySelector('.contact-content h2');
    const formDescription = document.querySelector('.contact-content p');
    
    if (formHeading) {
        formHeading.textContent = 'Contact Our Support Team';
    }
    
    if (formDescription) {
        formDescription.textContent = 'Send us a message and our staff will review your request. If needed, we\'ll create a service ticket and you\'ll be notified through your customer portal.';
    }
    
    // Remove priority field if it exists (since customers can't create tickets)
    const priorityField = document.getElementById('priorityField');
    if (priorityField) {
        priorityField.remove();
    }
    
    // Update submit button text
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="ph-light ph-envelope"></i> Send Message to Support';
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
    submitButton.innerHTML = '<i class="ph-light ph-spinner"></i> Sending...';
    
    try {
        // Check if user is logged in
        const user = await SpyderNetDB.auth.getCurrentUser();
        
        if (user) {
            // Save contact submission with customer reference
            await saveContactSubmission(formData, user);
        } else {
            // Save regular contact submission
            await saveContactSubmission(formData, null);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showContactMessage('An error occurred. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Save contact submission to database
async function saveContactSubmission(formData, user) {
    try {
        let customer = null;
        if (user) {
            const customerResult = await SpyderNetDB.db.customers.getByUserId(user.id);
            if (customerResult.success) {
                customer = customerResult.data;
            }
        }
        
        // Prepare submission data
        const submissionData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            is_from_customer: !!customer,
            customer_id: customer ? customer.id : null
        };
        
        // Save to database
        const result = await SpyderNetDB.db.contactSubmissions.create(submissionData);
        
        if (result.success) {
            if (customer) {
                showContactMessage(
                    'Message sent successfully! Our support team will review your request and may create a service ticket if needed. You\'ll be notified through your customer portal.',
                    'success'
                );
                
                // Show portal link
                showPortalLink();
            } else {
                showContactMessage(
                    'Thank you for your message! We\'ll get back to you within 24 hours. For faster service and to track requests, consider creating a customer account.',
                    'success'
                );
                
                // Show signup prompt
                showSignupPrompt();
            }
            
            // Reset form
            document.getElementById('contactForm').reset();
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error saving contact submission:', error);
        showContactMessage('Error sending message: ' + error.message, 'error');
    }
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

// Show portal link after message submission
function showPortalLink() {
    const portalLink = document.createElement('div');
    portalLink.className = 'portal-link-container';
    portalLink.innerHTML = `
        <div class="glass-card" style="margin-top: 20px; text-align: center;">
            <h4>Check Your Customer Portal</h4>
            <p>Visit your customer portal to view any service tickets our team creates and track your requests.</p>
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
            <h4>Want to Track Your Requests?</h4>
            <p>Create a customer account to track service requests, view service history, and schedule appointments.</p>
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