// SpyderNet IT Admin Authentication System
const AdminAuth = {
    // Sign in admin user
    async signIn(email, password) {
        try {
            // First authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (authError) throw authError;
            
            // Check if user is an admin
            const adminResult = await this.verifyAdminStatus(authData.user.id);
            
            if (!adminResult.success) {
                // Sign out if not an admin
                await supabase.auth.signOut();
                throw new Error('Access denied. Admin privileges required.');
            }
            
            // Store admin info in session
            sessionStorage.setItem('spydernet_admin', JSON.stringify({
                user_id: authData.user.id,
                admin_id: adminResult.admin.id,
                email: adminResult.admin.email,
                full_name: adminResult.admin.full_name,
                role: adminResult.admin.role,
                logged_in_at: new Date().toISOString()
            }));
            
            return { 
                success: true, 
                admin: adminResult.admin,
                user: authData.user
            };
            
        } catch (error) {
            console.error('Admin sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out admin
    async signOut() {
        try {
            // Clear session storage
            sessionStorage.removeItem('spydernet_admin');
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Admin sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // Verify if user has admin status
    async verifyAdminStatus(userId) {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();
            
            if (error) {
                console.error('Admin verification error:', error);
                return { success: false, error: 'Not authorized as admin user' };
            }
            
            return { success: true, admin: data };
            
        } catch (error) {
            console.error('Admin verification error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current admin user
    getCurrentAdmin() {
        try {
            const adminData = sessionStorage.getItem('spydernet_admin');
            return adminData ? JSON.parse(adminData) : null;
        } catch (error) {
            console.error('Error getting current admin:', error);
            return null;
        }
    },

    // Check if user is logged in as admin
    async isLoggedIn() {
        try {
            // Check session storage first
            const adminData = this.getCurrentAdmin();
            if (!adminData) return false;
            
            // Verify with Supabase auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.id !== adminData.user_id) {
                // Clear invalid session
                sessionStorage.removeItem('spydernet_admin');
                return false;
            }
            
            // Re-verify admin status
            const adminResult = await this.verifyAdminStatus(user.id);
            if (!adminResult.success) {
                // Clear invalid admin session
                sessionStorage.removeItem('spydernet_admin');
                await supabase.auth.signOut();
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Admin login check error:', error);
            return false;
        }
    },

    // Require admin authentication (redirect if not logged in)
    async requireAuth() {
        const isLoggedIn = await this.isLoggedIn();
        if (!isLoggedIn) {
            window.location.href = 'staff-portal.html';
            return false;
        }
        return true;
    },

    // Check if current admin has specific role
    hasRole(requiredRole) {
        const admin = this.getCurrentAdmin();
        if (!admin) return false;
        
        const roleHierarchy = {
            'admin': 3,
            'staff': 2,
            'technician': 1
        };
        
        const currentLevel = roleHierarchy[admin.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return currentLevel >= requiredLevel;
    }
};

// Admin Database Operations
const AdminDB = {
    // Contact Submissions
    contactSubmissions: {
        async getAll() {
            try {
                const { data, error } = await supabase
                    .from('contact_submissions')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting contact submissions:', error);
                return { success: false, error: error.message };
            }
        },

        async markAsProcessed(submissionId, ticketId = null) {
            try {
                const { data, error } = await supabase
                    .from('contact_submissions')
                    .update({ 
                        processed: true,
                        ticket_id: ticketId,
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', submissionId)
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error marking submission as processed:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Tickets (Admin can create/modify)
    tickets: {
        async getAll() {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .select(`
                        *,
                        customers (
                            id,
                            full_name,
                            email,
                            phone
                        )
                    `)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting all tickets:', error);
                return { success: false, error: error.message };
            }
        },

        async create(ticketData) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .insert([ticketData])
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error creating ticket:', error);
                return { success: false, error: error.message };
            }
        },

        async update(ticketId, updates) {
            try {
                const { data, error } = await supabase
                    .from('service_tickets')
                    .update(updates)
                    .eq('id', ticketId)
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error updating ticket:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Messages (Admin can send staff messages)
    messages: {
        async getByTicketId(ticketId) {
            try {
                const { data, error } = await supabase
                    .from('ticket_messages')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: true });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting messages:', error);
                return { success: false, error: error.message };
            }
        },

        async create(messageData, isInternal = false) {
            try {
                const admin = AdminAuth.getCurrentAdmin();
                const { data, error } = await supabase
                    .from('ticket_messages')
                    .insert([{
                        ...messageData,
                        is_from_staff: true,
                        is_internal: isInternal,
                        staff_name: admin?.full_name || 'Staff'
                    }])
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error creating message:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Customers
    customers: {
        async getAll() {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting customers:', error);
                return { success: false, error: error.message };
            }
        },

        async getById(customerId) {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', customerId)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting customer:', error);
                return { success: false, error: error.message };
            }
        },

        async update(customerId, updates) {
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', customerId)
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error updating customer:', error);
                return { success: false, error: error.message };
            }
        }
    },

    // Appointments
    appointments: {
        async getAll() {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        customers (
                            id,
                            full_name,
                            email,
                            phone
                        ),
                        service_tickets (
                            id,
                            title
                        )
                    `)
                    .order('appointment_date', { ascending: true });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error getting appointments:', error);
                return { success: false, error: error.message };
            }
        },

        async update(appointmentId, updates) {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .update(updates)
                    .eq('id', appointmentId)
                    .select();
                
                if (error) throw error;
                return { success: true, data: data[0] };
            } catch (error) {
                console.error('Error updating appointment:', error);
                return { success: false, error: error.message };
            }
        }
    }
};

// Export for global access
window.AdminAuth = AdminAuth;
window.AdminDB = AdminDB; 