import { Component } from '@angular/core';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [],
    template: `
    <div class="privacy-page static-page">
      <div class="container">
        <section class="static-hero">
          <span class="static-line"></span>
          <h1>Privacy <span>Policy</span></h1>
          <p>How we collect, use, and protect your information.</p>
        </section>

        <div class="static-content">
          <h2>Information We Collect</h2>
          <p>We may collect information such as your name, email address, and usage data when you interact with our platform.</p>

          <h2>How We Use Your Information</h2>
          <p>Your information is used to provide and improve our services, send updates, and ensure platform security.</p>

          <h2>Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information.</p>

          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time.</p>

          <h2>Contact</h2>
          <p>For privacy-related inquiries, please contact us at privacy&#64;bharatsecurity.org</p>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./static.component.scss']
})
export class PrivacyComponent { }
