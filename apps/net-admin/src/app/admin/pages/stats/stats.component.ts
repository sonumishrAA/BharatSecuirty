import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments';

interface Stat {
    id: string;
    value: number;
    suffix: string;
    label: string;
    icon: string;
    sort_order: number;
}

@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
    stats: Stat[] = [];
    editingStat: Stat | null = null;
    isCreating = false;
    newStat: Partial<Stat> = { value: 0, suffix: '+', label: '', icon: '📊', sort_order: 0 };
    loading = false;
    error = '';

    private apiUrl = `${environment.apiUrl}/business`;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;
        this.http.get<Stat[]>(`${this.apiUrl}/home-stats`).subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load stats';
                this.loading = false;
            }
        });
    }

    startCreate(): void {
        this.isCreating = true;
        this.editingStat = null;
        this.newStat = { value: 0, suffix: '+', label: '', icon: '📊', sort_order: this.stats.length + 1 };
    }

    cancelCreate(): void {
        this.isCreating = false;
        this.newStat = { value: 0, suffix: '+', label: '', icon: '📊', sort_order: 0 };
    }

    createStat(): void {
        const token = localStorage.getItem('token');
        this.http.post<Stat>(`${this.apiUrl}/home-stats`, this.newStat, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (stat) => {
                this.stats.push(stat);
                this.isCreating = false;
                this.newStat = { value: 0, suffix: '+', label: '', icon: '📊', sort_order: 0 };
            },
            error: () => this.error = 'Failed to create stat'
        });
    }

    startEdit(stat: Stat): void {
        this.editingStat = { ...stat };
        this.isCreating = false;
    }

    cancelEdit(): void {
        this.editingStat = null;
    }

    saveStat(): void {
        if (!this.editingStat) return;
        const token = localStorage.getItem('token');
        this.http.put<Stat>(`${this.apiUrl}/home-stats/${this.editingStat.id}`, this.editingStat, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (updated) => {
                const index = this.stats.findIndex(s => s.id === updated.id);
                if (index >= 0) this.stats[index] = updated;
                this.editingStat = null;
            },
            error: () => this.error = 'Failed to update stat'
        });
    }

    deleteStat(stat: Stat): void {
        if (!confirm(`Delete "${stat.label}"?`)) return;
        const token = localStorage.getItem('token');
        this.http.delete(`${this.apiUrl}/home-stats/${stat.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: () => {
                this.stats = this.stats.filter(s => s.id !== stat.id);
            },
            error: () => this.error = 'Failed to delete stat'
        });
    }
}
