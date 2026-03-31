
// Interfaccia Customer per entità cliente
export interface Customer {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string; 
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string; 
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
}

// Interfaccia per i parametri di query dei clienti
export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

// Interfaccia per la risposta paginata dei clienti
export interface PaginateResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }   
}
