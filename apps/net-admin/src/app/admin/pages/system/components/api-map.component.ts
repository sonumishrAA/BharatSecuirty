import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemService, RouteInfo } from '../../../../core/services/system.service';

@Component({
    selector: 'app-api-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="api-map-container">
      <h3>API Routes</h3>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            @for (route of routes; track route.method + route.path) {
              <tr [class.admin-route]="route.path.includes('admin')">
                <td><span class="badge" [class]="getBadgeClass(route.method)">{{ route.method }}</span></td>
                <td class="code-font">{{ route.path }}</td>
                <td>
                    @if (route.path.includes('admin')) {
                        <span class="tag admin">Admin</span>
                    } @else if (route.path.includes('auth')) {
                        <span class="tag auth">Auth</span>
                    } @else {
                        <span class="tag public">Public</span>
                    }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .api-map-container { padding: 20px; background: #1e293b; border-radius: 8px; }
    .data-table { width: 100%; border-collapse: collapse; color: #e2e8f0; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
    .data-table th { color: #94a3b8; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .badge.GET { background: #0ea5e9; color: white; }
    .badge.POST { background: #22c55e; color: white; }
    .badge.PUT { background: #f59e0b; color: white; }
    .badge.DELETE { background: #ef4444; color: white; }
    .code-font { font-family: monospace; color: #cbd5e1; }
    .tag { padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; border: 1px solid currentColor; }
    .tag.admin { color: #f472b6; border-color: #f472b6; }
    .tag.auth { color: #fbbf24; border-color: #fbbf24; }
    .tag.public { color: #94a3b8; border-color: #94a3b8; }
    .admin-route { background: rgba(244, 114, 182, 0.05); }
  `]
})
export class ApiMapComponent implements OnInit {
    private systemService = inject(SystemService);
    routes: RouteInfo[] = [];

    ngOnInit() {
        this.systemService.getRoutes().subscribe(data => {
            this.routes = data.sort((a, b) => a.path.localeCompare(b.path));
        });
    }

    getBadgeClass(method: string): string {
        return method;
    }
}
