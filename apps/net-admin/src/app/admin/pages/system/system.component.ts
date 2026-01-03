import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiMapComponent } from './components/api-map.component';
import { DbExplorerComponent } from './components/db-explorer.component';
import { FileExplorerComponent } from './components/file-explorer.component';

@Component({
    selector: 'app-system-dashboard',
    standalone: true,
    imports: [CommonModule, ApiMapComponent, DbExplorerComponent, FileExplorerComponent],
    template: `
    <div class="system-dashboard">
      <header class="page-header">
        <h1>⚙️ System Backend</h1>
        <p>Explore internal APIs, Database Tables, and File Storage</p>
      </header>
      
      <div class="tabs">
        <button 
            [class.active]="activeTab === 'api'" 
            (click)="activeTab = 'api'">
            🔌 API Map
        </button>
        <button 
            [class.active]="activeTab === 'db'" 
            (click)="activeTab = 'db'">
            💾 Database
        </button>
        <button 
            [class.active]="activeTab === 'files'" 
            (click)="activeTab = 'files'">
            📁 File Storage
        </button>
      </div>

      <div class="tab-content">
        @if (activeTab === 'api') {
            <app-api-map></app-api-map>
        }
        @if (activeTab === 'db') {
            <app-db-explorer></app-db-explorer>
        }
        @if (activeTab === 'files') {
            <app-file-explorer></app-file-explorer>
        }
      </div>
    </div>
  `,
    styles: [`
    .system-dashboard { padding: 0; }
    .page-header { padding: 20px; background: #0f172a; margin-bottom: 20px; border-radius: 8px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 10px; }
    .page-header p { margin: 5px 0 0; color: #94a3b8; font-size: 0.9rem; }
    
    .tabs { display: flex; gap: 10px; padding: 0 20px; margin-bottom: 20px; border-bottom: 1px solid #334155; }
    .tabs button {
        background: transparent; border: none; padding: 10px 20px; color: #94a3b8; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
    }
    .tabs button:hover { color: #e2e8f0; }
    .tabs button.active { color: #0ea5e9; border-bottom-color: #0ea5e9; }
    
    .tab-content { padding: 0 20px; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SystemComponent {
    activeTab: 'api' | 'db' | 'files' = 'api';
}
