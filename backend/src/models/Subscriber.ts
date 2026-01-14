export interface Subscriber {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at: Date;
    updated_at: Date;
}

export interface CreateSubscriberDto {
    email: string;
}
