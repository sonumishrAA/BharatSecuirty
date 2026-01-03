export interface BusinessTestimonial {
    id: string;
    client_name: string;
    company?: string;
    content: string;
    rating: number;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateBusinessTestimonialDto {
    client_name: string;
    company?: string;
    content: string;
    rating?: number;
    avatar_url?: string;
}
