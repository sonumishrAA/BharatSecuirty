import { Component } from '@angular/core';

@Component({
    selector: 'app-terms',
    standalone: true,
    imports: [],
    template: `
    <div class="terms-page static-page">
      <div class="container">
        <section class="static-hero">
          <span class="static-line"></span>
          <h1>Terms & <span>Conditions</span></h1>
          <p>Please read these terms carefully before using our platform.</p>
        </section>

        <div class="static-content">
          <h2>Acceptance of Terms</h2>
          <p>By accessing BharatSecurity, you agree to be bound by these terms and conditions.</p>

          <h2>Use of Content</h2>
          <p>All content is provided for educational purposes. You may not reproduce or redistribute without permission.</p>

          <h2>Disclaimer</h2>
          <p>Information is provided "as is" without warranties. We are not responsible for actions taken based on our content.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance.</p>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./static.component.scss']
})
export class TermsComponent { }
