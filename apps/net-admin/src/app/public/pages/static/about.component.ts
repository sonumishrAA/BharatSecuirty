import { Component } from '@angular/core';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [],
    template: `
    <div class="about-page static-page">
      <div class="container">
        <section class="static-hero">
          <span class="static-line"></span>
          <h1>About <span>BharatSecurity</span></h1>
          <p>Your trusted source for cyber awareness, OSINT intelligence, and scam protection resources.</p>
        </section>

        <div class="static-content">
          <p>
            BharatSecurity is a platform dedicated to spreading cyber awareness across India
            and beyond. We believe that digital literacy and security knowledge should be
            accessible to everyone.
          </p>

          <div class="features-grid">
            <div class="feature-card">
              <span class="icon">🛡️</span>
              <h3>Cyber Safety</h3>
              <p>Tips and guides to protect yourself online.</p>
            </div>
            <div class="feature-card">
              <span class="icon">🔍</span>
              <h3>OSINT Guides</h3>
              <p>Learn open-source intelligence techniques.</p>
            </div>
            <div class="feature-card">
              <span class="icon">⚠️</span>
              <h3>Scam Alerts</h3>
              <p>Stay informed about the latest scams and frauds.</p>
            </div>
            <div class="feature-card">
              <span class="icon">📚</span>
              <h3>Resources</h3>
              <p>Curated tools and materials for security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./static.component.scss']
})
export class AboutComponent { }
