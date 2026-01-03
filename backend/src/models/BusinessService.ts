export interface BusinessService {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    description: string;
    features: string[]; // JSONB array in DB
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

export interface CreateBusinessServiceDto {
    title: string;
    description: string;
    features?: string[];
    icon?: string;
    status?: 'active' | 'inactive';
}

export interface UpdateBusinessServiceDto extends Partial<CreateBusinessServiceDto> { }
