import { Component, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    open = signal(false);
    scrolled = signal(false);

    @ViewChild('navLinks') navLinksRef!: ElementRef;
    private tl: gsap.core.Timeline | null = null;

    @HostListener('window:scroll', [])
    onScroll(): void {
        this.scrolled.set(window.scrollY > 10);
    }

    @HostListener('window:resize', [])
    onResize(): void {
        if (window.innerWidth > 768 && this.open()) {
            this.closeMenu();
            gsap.set(this.navLinksRef.nativeElement, { clearProps: 'all' });
        }
    }

    toggleMenu(): void {
        if (this.tl && this.tl.isActive()) return;

        this.open.update(v => !v);
        const isOpen = this.open();
        const nav = this.navLinksRef.nativeElement;
        const links = nav.querySelectorAll('a');

        if (isOpen) {
            // Open Animation
            this.tl = gsap.timeline();

            this.tl.set(nav, {
                height: 0,
                display: 'flex',
                opacity: 0,
                padding: 0
            })
                .to(nav, {
                    height: 'auto',
                    duration: 0.4,
                    padding: '24px',
                    opacity: 1,
                    ease: 'power2.out'
                })
                .fromTo(links,
                    { y: -20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'back.out(1.7)' },
                    '-=0.2'
                );
        } else {
            // Close Animation
            this.tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(nav, { clearProps: 'all' });
                }
            });

            this.tl.to(links, {
                y: -10,
                opacity: 0,
                stagger: 0.03,
                duration: 0.2,
                ease: 'power2.in'
            })
                .to(nav, {
                    height: 0,
                    opacity: 0,
                    padding: 0,
                    duration: 0.3,
                    ease: 'power2.in'
                }, '-=0.1');
        }
    }

    closeMenu(): void {
        if (this.open()) {
            this.toggleMenu();
        }
    }
}
