
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments';

interface Subscriber {
    id: string;
    email: string;
    created_at: string;
}

@Component({
    selector: 'app-subscribers',
    standalone: true,
    imports: [CommonModule, DatePipe],
    template: `
    <div class="page-header">
      <h1>Newsletter Subscribers</h1>
      <div class="actions">
        <span class="count-badge">{{ subscribers().length }} Subscribers</span>
      </div>
    </div>

    <div class="content-card">
        @if (loading()) {
            <div class="loading-state">Loading subscribers...</div>
        } @else if (subscribers().length === 0) {
            <div class="empty-state">No subscribers found yet.</div>
        } @else {
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Subscribed Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (sub of subscribers(); track sub.id) {
                        <tr>
                            <td>
                                <div class="cell-primary">{{ sub.email }}</div>
                            </td>
                            <td>{{ sub.created_at | date:'mediumDate' }}</td>
                            <td>
                                <span class="status-badge active">Subscribed</span>
                            </td>
                        </tr>
                        }
                    </tbody>
                </table>
            </div>
        }
    </div>
  `,
    styles: [`
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        
        h1 { margin: 0; font-size: 24px; font-weight: 700; color: #fff; }
    }

    .count-badge {
        background: rgba(255,255,255,0.1);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        color: #94a3b8;
    }

    .content-card {
        background: #1e293b;
        border-radius: 12px;
        border: 1px solid #334155;
        overflow: hidden;
    }

    .loading-state, .empty-state {
        padding: 40px;
        text-align: center;
        color: #94a3b8;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            text-align: left;
            padding: 16px 24px;
            border-bottom: 1px solid #334155;
            color: #e2e8f0;
        }

        th {
            background: #0f172a;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
        }

        tr:last-child td { border-bottom: none; }
    }

    .cell-primary {
        font-weight: 500;
        color: #fff;
    }

    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        
        &.active {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
        }
    }
  `]
})
export class SubscribersComponent implements OnInit {
    subscribers = signal<Subscriber[]>([]);
    loading = signal(true);
    private http = inject(HttpClient);

    ngOnInit() {
        this.fetchSubscribers();
    }

    fetchSubscribers() {
        this.loading.set(true);
        this.http.get<Subscriber[]>(`${environment.apiUrl}/subscribers`).subscribe({
            next: (data) => {
                this.subscribers.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load subscribers', err);
                this.loading.set(false);
            }
        });
    }
}
