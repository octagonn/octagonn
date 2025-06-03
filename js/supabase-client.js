// Supabase Client Configuration
const SUPABASE_URL = 'https://zlskmowbxeurzoisqlkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc2ttb3dieGV1cnpvaXNxbGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Nzg2NjksImV4cCI6MjA2NDU1NDY2OX0.55NUR0EMGGzM43XKTFNcFLVJRK4zQwkg-h7jC7w-N40'

// Import Supabase (we'll add this via CDN in HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Authentication helpers
const auth = {
    // Sign up new customer
    async signUp(email, password, fullName) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            })
            
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            
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

    // Service ticket operations
    tickets: {
        async create(ticketData) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .insert([ticketData])
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Create ticket error:', error)
                return { success: false, error: error.message }
            }
        },

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

        async updateStatus(ticketId, status) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .update({ 
                        status,
                        updated_at: new Date().toISOString(),
                        ...(status === 'completed' && { completed_at: new Date().toISOString() })
                    })
                    .eq('id', ticketId)
                    .select()
                
                if (error) throw error
                return { success: true, data: data[0] }
            } catch (error) {
                console.error('Update ticket error:', error)
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
    }
}

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

    // Format status for display
    formatStatus(status) {
        const statusMap = {
            'new': 'New',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'scheduled': 'Scheduled',
            'confirmed': 'Confirmed'
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
            'confirmed': 'status-confirmed'
        }
        return colorMap[status] || 'status-default'
    }
}

// Export for use in other files
window.SpyderNetDB = {
    supabase,
    auth,
    db,
    utils
} 