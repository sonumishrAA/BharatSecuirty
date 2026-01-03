export interface BusinessBooking {
    id: string;
    service_id: string;
    user_id?: string;
    contact_name: string;
    contact_email: string;
    message?: string;
    attachment_url?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    temp_password?: string;
    company?: string;
    phone?: string;
    service_type?: string;
    additional_info?: string;
    progress?: number;
    admin_notes?: string;
    created_at: Date;
    updated_at: Date;
    // Joined field
    service_title?: string;
}

export interface CreateBookingDto {
    service_id?: string;
    contact_name: string;
    contact_email: string;
    message?: string;
    attachment_url?: string;
    company?: string;
    phone?: string;
    service_type?: string;
    additional_info?: string;
}

export interface UpdateBookingStatusDto {
    status: BusinessBooking['status'];
    progress?: number;
    admin_notes?: string;
}
