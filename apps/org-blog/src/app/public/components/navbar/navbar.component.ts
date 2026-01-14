import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BusinessService, Service } from '@core/services/business.service';
import { environment } from '@environments';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
    open = signal(false);
    scrolled = signal(false);
    services = signal<Service[]>([]);

    // Environment links
    businessUrl = environment.businessUrl;

    private businessService = inject(BusinessService);

    ngOnInit(): void {
        this.fetchServices();
    }

    fetchServices(): void {
        this.businessService.getServices().subscribe({
            next: (data) => {
                this.services.set(data);
            },
            error: (err) => console.error('Failed to load services', err)
        });
    }

    @HostListener('window:scroll', [])
    onScroll(): void {
        this.scrolled.set(window.scrollY > 10);
    }

    @HostListener('window:resize', [])
    onResize(): void {
        if (window.innerWidth > 1024 && this.open()) {
            this.open.set(false);
        }
    }

    toggleMenu(): void {
        this.open.update(v => !v);

        // Prevent body scroll when menu is open
        if (this.open()) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu(): void {
        this.open.set(false);
        document.body.style.overflow = '';
    }
}
