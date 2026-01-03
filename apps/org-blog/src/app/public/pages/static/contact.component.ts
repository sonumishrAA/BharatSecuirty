import { Component } from '@angular/core';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [],
    template: `
    <div class="contact-page static-page">
      <div class="container">
        <section class="static-hero">
          <span class="static-line"></span>
          <h1>Contact <span>Us</span></h1>
          <p>Get in touch with the BharatSecurity team.</p>
        </section>

        <div class="static-content">
          <p>Have questions, suggestions, or want to report something? We'd love to hear from you.</p>

          <div class="contact-info">
            <div class="contact-card">
              <span class="icon">📧</span>
              <h3>Email</h3>
              <p>contact&#64;bharatsecurity.org</p>
            </div>
            <div class="contact-card">
              <span class="icon">🐦</span>
              <h3>Twitter</h3>
              <p>&#64;BharatSecurity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./static.component.scss']
})
export class ContactComponent { }
