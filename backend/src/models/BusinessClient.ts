export interface BusinessClient {
    id: string;
    name: string;
    logo_url?: string;
    website_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateBusinessClientDto {
    name: string;
    logo_url?: string;
    website_url?: string;
}
