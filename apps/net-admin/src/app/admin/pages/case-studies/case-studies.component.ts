import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments';

interface CaseStudy {
    id: string;
    title: string;
    slug: string;
    client_name: string;
    client_logo: string;
    industry: string;
    challenge: string;
    solution: string;
    impact: string;
    result_metrics: string;
    cover_image_url: string;
    featured: boolean;
    sort_order: number;
    status: 'active' | 'inactive';
}

@Component({
    selector: 'app-case-studies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './case-studies.component.html',
    styleUrl: './case-studies.component.scss'
})
export class CaseStudiesComponent implements OnInit {
    caseStudies: CaseStudy[] = [];
    editingCase: CaseStudy | null = null;
    isCreating = false;
    newCase: Partial<CaseStudy> = this.getEmptyCase();
    loading = false;
    error = '';

    private apiUrl = `${environment.apiUrl}/business`;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadCaseStudies();
    }

    getEmptyCase(): Partial<CaseStudy> {
        return {
            title: '',
            client_name: '',
            client_logo: '🏢',
            industry: '',
            challenge: '',
            solution: '',
            impact: '',
            result_metrics: '',
            cover_image_url: '',
            featured: false,
            sort_order: 0,
            status: 'active'
        };
    }

    loadCaseStudies(): void {
        this.loading = true;
        const token = localStorage.getItem('token');
        this.http.get<CaseStudy[]>(`${this.apiUrl}/case-studies/all`, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (data) => {
                this.caseStudies = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load case studies';
                this.loading = false;
            }
        });
    }

    startCreate(): void {
        this.isCreating = true;
        this.editingCase = null;
        this.newCase = this.getEmptyCase();
        this.newCase.sort_order = this.caseStudies.length + 1;
    }

    cancelCreate(): void {
        this.isCreating = false;
        this.newCase = this.getEmptyCase();
    }

    createCase(): void {
        const token = localStorage.getItem('token');
        this.http.post<CaseStudy>(`${this.apiUrl}/case-studies`, this.newCase, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (cs) => {
                this.caseStudies.unshift(cs);
                this.isCreating = false;
                this.newCase = this.getEmptyCase();
            },
            error: () => this.error = 'Failed to create case study'
        });
    }

    startEdit(cs: CaseStudy): void {
        this.editingCase = { ...cs };
        this.isCreating = false;
    }

    cancelEdit(): void {
        this.editingCase = null;
    }

    saveCase(): void {
        if (!this.editingCase) return;
        const token = localStorage.getItem('token');
        this.http.put<CaseStudy>(`${this.apiUrl}/case-studies/${this.editingCase.id}`, this.editingCase, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (updated) => {
                const index = this.caseStudies.findIndex(c => c.id === updated.id);
                if (index >= 0) this.caseStudies[index] = updated;
                this.editingCase = null;
            },
            error: () => this.error = 'Failed to update case study'
        });
    }

    deleteCase(cs: CaseStudy): void {
        if (!confirm(`Delete "${cs.title}"?`)) return;
        const token = localStorage.getItem('token');
        this.http.delete(`${this.apiUrl}/case-studies/${cs.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: () => {
                this.caseStudies = this.caseStudies.filter(c => c.id !== cs.id);
            },
            error: () => this.error = 'Failed to delete case study'
        });
    }

    toggleStatus(cs: CaseStudy): void {
        const newStatus = cs.status === 'active' ? 'inactive' : 'active';
        const token = localStorage.getItem('token');
        this.http.put<CaseStudy>(`${this.apiUrl}/case-studies/${cs.id}`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (updated) => {
                const index = this.caseStudies.findIndex(c => c.id === cs.id);
                if (index >= 0) this.caseStudies[index] = updated;
            },
            error: () => this.error = 'Failed to toggle status'
        });
    }
}
