export interface CaseStudy {
    id: string;
    title: string;
    slug: string;
    client_name: string;
    client_logo?: string;
    industry: string;
    challenge: string;
    solution: string;
    impact: string;
    result_metrics?: string;
    cover_image_url?: string;
    featured: boolean;
    sort_order: number;
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

export interface CreateCaseStudyDto {
    title: string;
    client_name: string;
    client_logo?: string;
    industry: string;
    challenge: string;
    solution: string;
    impact: string;
    result_metrics?: string;
    cover_image_url?: string;
    featured?: boolean;
    sort_order?: number;
    status?: 'active' | 'inactive';
}

export interface UpdateCaseStudyDto {
    title?: string;
    client_name?: string;
    client_logo?: string;
    industry?: string;
    challenge?: string;
    solution?: string;
    impact?: string;
    result_metrics?: string;
    cover_image_url?: string;
    featured?: boolean;
    sort_order?: number;
    status?: 'active' | 'inactive';
}
