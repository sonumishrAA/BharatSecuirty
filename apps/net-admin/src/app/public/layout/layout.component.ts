import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class PublicLayoutComponent { }
