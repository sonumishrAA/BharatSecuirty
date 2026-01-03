import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemService } from '../../../../core/services/system.service';

@Component({
    selector: 'app-db-explorer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="db-explorer">
      <!-- SIDEBAR -->
      <div class="db-sidebar">
        <h3>Tables</h3>
        <ul class="table-list">
          @for (table of tables; track table) {
            <li 
                (click)="loadTable(table)"
                [class.active]="currentTable === table">
                <span class="icon">📄</span> {{ table }}
            </li>
          }
        </ul>
      </div>

      <!-- CONTENT -->
      <div class="db-content">
        @if (currentTable) {
          <div class="table-header">
            <h3>{{ currentTable }}</h3>
            <span class="count">{{ tableData.length }} records (showing 100 max)</span>
          </div>

          <div class="data-grid-wrapper">
             @if (loading) {
                 <div class="loading">Loading data...</div>
             } @else if (tableData.length === 0) {
                 <div class="empty">No records found</div>
             } @else {
                 <table class="data-table">
                   <thead>
                     <tr>
                       @for (col of columns; track col) {
                         <th>{{ col }}</th>
                       }
                     </tr>
                   </thead>
                   <tbody>
                     @for (row of tableData; track $index) {
                       <tr>
                         @for (col of columns; track col) {
                           <td [title]="row[col]">
                             <div class="cell-content">{{ formatValue(row[col]) }}</div>
                           </td>
                         }
                       </tr>
                     }
                   </tbody>
                 </table>
             }
          </div>
        } @else {
          <div class="empty-state">
            <span class="icon">⬅️</span>
            <p>Select a table to view data</p>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .db-explorer { display: grid; grid-template-columns: 250px 1fr; gap: 20px; height: calc(100vh - 140px); }
    .db-sidebar { background: #1e293b; border-radius: 8px; padding: 15px; overflow-y: auto; }
    .db-sidebar h3 { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.1em; }
    .table-list { list-style: none; padding: 0; margin: 0; }
    .table-list li { 
        padding: 10px 12px; border-radius: 6px; cursor: pointer; color: #cbd5e1; margin-bottom: 4px; transition: all 0.2s; font-size: 0.9rem;
        display: flex; align-items: center; gap: 8px;
    }
    .table-list li:hover { background: #334155; color: white; }
    .table-list li.active { background: #0ea5e9; color: white; }
    
    .db-content { background: #1e293b; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
    .table-header { padding: 15px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .table-header h3 { margin: 0; font-size: 1.1rem; color: white; }
    .count { font-size: 0.8rem; color: #94a3b8; }
    
    .data-grid-wrapper { overflow: auto; flex: 1; padding: 0; }
    .data-table { width: 100%; border-collapse: collapse; white-space: nowrap; font-size: 0.85rem; }
    .data-table th { position: sticky; top: 0; background: #0f172a; color: #94a3b8; padding: 10px 15px; text-align: left; z-index: 10; border-bottom: 1px solid #334155; }
    .data-table td { padding: 8px 15px; border-bottom: 1px solid #334155; max-width: 300px; color: #cbd5e1; }
    .cell-content { overflow: hidden; text-overflow: ellipsis; }
    
    .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; }
    .empty-state .icon { font-size: 2rem; margin-bottom: 10px; }
  `]
})
export class DbExplorerComponent implements OnInit {
    private systemService = inject(SystemService);
    tables: string[] = [];
    currentTable = '';
    tableData: any[] = [];
    columns: string[] = [];
    loading = false;

    ngOnInit() {
        this.systemService.getTables().subscribe(tables => {
            this.tables = tables;
        });
    }

    loadTable(table: string) {
        this.currentTable = table;
        this.loading = true;
        this.tableData = [];
        this.columns = [];

        this.systemService.getTableData(table).subscribe({
            next: (data) => {
                this.tableData = data;
                if (data.length > 0) {
                    this.columns = Object.keys(data[0]);
                }
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    formatValue(val: any): string {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    }
}
