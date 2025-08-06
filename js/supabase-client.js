// Supabase Client Configuration
const SUPABASE_URL = 'https://zlskmowbxeurzoisqlkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc2ttb3dieGV1cnpvaXNxbGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Nzg2NjksImV4cCI6MjA2NDU1NDY2OX0.55NUR0EMGGzM43XKTFNcFLVJRK4zQwkg-h7jC7w-N40'

// Initialize Supabase client with error checking
let supabase;

function initializeSupabase() {
    try {
        console.log('Attempting to initialize Supabase...');
        console.log('Supabase URL:', SUPABASE_URL);
        console.log('Window.supabase available:', typeof window.supabase);
        
        // Check if Supabase is loaded
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase library not loaded. Make sure to include the CDN script.');
            return false;
        }
        
        // Create the client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('Supabase client initialized successfully:', supabase);
        
        // Dispatch a custom event to signal that Supabase is ready
        document.dispatchEvent(new Event('supabase-ready'));
        
        // Test connection
        testConnection();
        
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return false;
    }
}

// Test Supabase connection
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Supabase connection test failed:', error);
        } else {
            console.log('Supabase connection test successful:', data);
        }
    } catch (error) {
        console.error('Supabase connection test error:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - attempting Supabase initialization');
    // Small delay to ensure Supabase CDN is loaded
    setTimeout(() => {
        if (!initializeSupabase()) {
            console.log('First initialization failed, retrying...');
            // Try again after a short delay
            setTimeout(() => {
                initializeSupabase();
            }, 1000);
        }
    }, 100);
});

// Alternative initialization for manual calling
if (typeof window.supabase !== 'undefined') {
    console.log('Supabase available immediately, initializing...');
    initializeSupabase();
}

// Authentication helpers
const auth = {
    // Sign up new customer
    async signUp(email, password, fullName) {
        try {
            console.log('Attempting sign up for:', email);
            
            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            })
            
            console.log('Sign up response:', { data, error });
            
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: error.message }
        }
    },

    // Sign in existing customer
    async signIn(email, password) {
        try {
            console.log('Attempting sign in for:', email);
            
            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            
            console.log('Sign in response:', { data, error });
            
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: error.message }
        }
    },

    // Sign out
    async signOut() {
        try {
            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Sign out error:', error)
            return { success: false, error: error.message }
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            if (!supabase) {
                console.error('Supabase client not initialized');
                return null;
            }
            
            const { data: { user } } = await supabase.auth.getUser()
            return user
        } catch (error) {
            console.error('Get user error:', error)
            return null
        }
    },

    // Check if user is logged in
    async isLoggedIn() {
        const user = await this.getCurrentUser()
        return !!user
    }
}

// Database helpers
const db = {
    // Customer operations
    customers: {
        async create(customerData) {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .insert([customerData])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create customer error:', error)
                return { success: false, error: error.message }
            }
        },

        async getByUserId(userId) {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('user_id', userId)
                    .single()
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get customer error:', error)
                return { success: false, error: error.message }
            }
        },

        async update(customerId, updates) {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', customerId)
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Update customer error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Service ticket operations (READ ONLY for customers)
    tickets: {
        async getByCustomerId(customerId) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .select('*')
                    .eq('customer_id', customerId)
                    .order('created_at', { ascending: false })
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get tickets error:', error)
                return { success: false, error: error.message }
            }
        },

        async getById(ticketId) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .select('*')
                    .eq('id', ticketId)
                    .single()
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get ticket error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Ticket messages for customer-staff communication
    messages: {
        async getByTicketId(ticketId) {
            try {
                const { data, error } = await supabase
                    .from('ticket_messages')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .eq('is_internal', false) // Only show non-internal messages to customers
                    .order('created_at', { ascending: true })
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get messages error:', error)
                return { success: false, error: error.message }
            }
        },

        async create(messageData) {
            try {
                const { data, error } = await supabase
                    .from('ticket_messages')
                    .insert([{
                        ...messageData,
                        is_from_staff: false,
                        is_internal: false
                    }])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create message error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Contact form submissions
    contactSubmissions: {
        async create(submissionData) {
            try {
                const { data, error } = await supabase
                    .from('contact_submissions')
                    .insert([submissionData])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create contact submission error:', error)
                return { success: false, error: error.message }
            }
        },

        async getByCustomerId(customerId) {
            try {
                const { data, error } = await supabase
                    .from('contact_submissions')
                    .select('*')
                    .eq('customer_id', customerId)
                    .order('created_at', { ascending: false })
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get contact submissions error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Appointment operations
    appointments: {
        async create(appointmentData) {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .insert([appointmentData])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create appointment error:', error)
                return { success: false, error: error.message }
            }
        },

        async getByCustomerId(customerId) {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('customer_id', customerId)
                    .order('appointment_date', { ascending: true })
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get appointments error:', error)
                return { success: false, error: error.message }
            }
        },

        async getAvailableSlots(date) {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('appointment_time')
                    .eq('appointment_date', date)
                    .eq('status', 'scheduled')
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get available slots error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Appointment cancellation request operations (customer-facing)
    appointmentCancellationRequests: {
        async create(requestData) {
            try {
                const { data, error } = await supabase
                    .from('appointment_cancellation_requests')
                    .insert([{
                        appointment_id: requestData.appointment_id,
                        customer_id: requestData.customer_id,
                        reason: requestData.reason,
                        status: 'requested'
                    }])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create appointment cancellation request error:', error)
                return { success: false, error: error.message }
            }
        },

        async getByCustomerId(customerId) {
            try {
                const { data, error } = await supabase
                    .from('appointment_cancellation_requests')
                    .select('*')
                    .eq('customer_id', customerId)
                    .order('created_at', { ascending: false })
                
                if (error) throw error
                return { success: true, data }
            } catch (error) {
                console.error('Get appointment cancellation requests error:', error)
                return { success: false, error: error.message }
            }
        },

        async update(requestId, updates) {
            try {
                const { data, error } = await supabase
                    .from('appointment_cancellation_requests')
                    .update(updates)
                    .eq('id', requestId)
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Update appointment cancellation request error:', error)
                return { success: false, error: error.message }
            }
        }
    },

    // Ticket attachments
    attachments: {
        async create(attachmentData) {
            try {
                const { data, error } = await supabase
                    .from('ticket_attachments')
                    .insert([attachmentData])
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Create attachment error:', error);
                return { success: false, error: error.message };
            }
        },

        async getByTicketId(ticketId) {
            try {
                const { data, error } = await supabase
                    .from('ticket_attachments')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // Create signed URLs for each attachment
                const attachmentsWithUrls = await Promise.all(data.map(async (attachment) => {
                    const { data: urlData, error: urlError } = await supabase
                        .storage
                        .from('ticket-attachments')
                        .createSignedUrl(attachment.file_path, 60); // URL is valid for 60 seconds

                    if (urlError) {
                        console.error('Error creating signed URL for', attachment.file_path, urlError);
                        return { ...attachment, url: null, error: urlError.message };
                    }

                    return {
                        ...attachment,
                        url: urlData.signedUrl
                    };
                }));

                return { success: true, data: attachmentsWithUrls };
            } catch (error) {
                console.error('Get attachments error:', error);
                return { success: false, error: error.message };
            }
        }
    }
}

// Storage helpers
const storage = {
    async uploadFile(bucket, filePath, file) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('File upload error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Utility functions
const utils = {
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    },

    // Format time for display
    formatTime(dateString) {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    },

    // Format status for display
    formatStatus(status) {
        const statusMap = {
            'new': 'New',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'scheduled': 'Scheduled',
            'confirmed': 'Confirmed',
            'requested': 'Requested',
            'approved': 'Approved',
            'rejected': 'Rejected'
        }
        return statusMap[status] || status
    },

    // Get status color class
    getStatusColor(status) {
        const colorMap = {
            'new': 'status-new',
            'in_progress': 'status-progress',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled',
            'scheduled': 'status-scheduled',
            'confirmed': 'status-confirmed',
            'requested': 'status-requested',
            'approved': 'status-approved',
            'rejected': 'status-rejected'
        }
        return colorMap[status] || 'status-default'
    }
}

// Export for use in other files
window.SpyderNetDB = {
    supabase,
    auth,
    db,
    storage,
    utils
} 