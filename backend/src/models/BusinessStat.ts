export interface BusinessStat {
    id: string;
    value: number;
    suffix: string;
    label: string;
    icon: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

export interface CreateBusinessStatDto {
    value: number;
    suffix: string;
    label: string;
    icon?: string;
    sort_order?: number;
}

export interface UpdateBusinessStatDto {
    value?: number;
    suffix?: string;
    label?: string;
    icon?: string;
    sort_order?: number;
}
