import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="not-found-page">
            <!-- Background Effects -->
            <div class="bg-effects">
                <div class="orb orb-1"></div>
                <div class="orb orb-2"></div>
                <div class="grid-overlay"></div>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="error-code">
                    <span class="digit">4</span>
                    <span class="zero-container">
                        <span class="zero">0</span>
                        <span class="glitch-effect"></span>
                    </span>
                    <span class="digit">4</span>
                </div>

                <h1 class="title">Page Not Found</h1>
                
                <p class="description">
                    The page you're looking for doesn't exist or has been moved.<br>
                    Let's get you back on track.
                </p>

                <div class="actions">
                    <a routerLink="/" class="btn-primary">
                        <span class="material-icons-round">home</span>
                        Back to Home
                    </a>
                    <a routerLink="/blog" class="btn-secondary">
                        <span class="material-icons-round">article</span>
                        Browse Articles
                    </a>
                </div>

                <!-- Security Decoration -->
                <div class="security-badge">
                    <span class="material-icons-round">shield</span>
                    <span>Protected by Bharat Security</span>
                </div>
            </div>

            <!-- Animated Elements -->
            <div class="floating-elements">
                <div class="element e1">🔒</div>
                <div class="element e2">🛡️</div>
                <div class="element e3">🔐</div>
            </div>
        </div>
    `,
    styles: [`
        @import url('https://fonts.googleapis.com/css2?family=Material+Icons+Round');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .not-found-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050510;
            position: relative;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }

        // Background Effects
        .bg-effects {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
        }

        .orb-1 {
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%);
            top: -200px;
            right: -100px;
            animation: float 8s ease-in-out infinite;
        }

        .orb-2 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
            bottom: -200px;
            left: -100px;
            animation: float 10s ease-in-out infinite reverse;
        }

        .grid-overlay {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 60px 60px;
            opacity: 0.5;
        }

        // Content
        .content {
            text-align: center;
            z-index: 10;
            padding: 40px;
        }

        .error-code {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 30px;
        }

        .digit {
            font-size: clamp(80px, 15vw, 180px);
            font-weight: 800;
            color: transparent;
            background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #00f2fe 100%);
            background-clip: text;
            -webkit-background-clip: text;
            text-shadow: 0 0 60px rgba(0, 242, 254, 0.3);
            animation: pulse 2s ease-in-out infinite;
        }

        .zero-container {
            position: relative;
        }

        .zero {
            font-size: clamp(80px, 15vw, 180px);
            font-weight: 800;
            color: transparent;
            background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
            background-clip: text;
            -webkit-background-clip: text;
            animation: glitch 3s ease-in-out infinite;
        }

        .glitch-effect {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                transparent 40%,
                rgba(0, 242, 254, 0.2) 40%,
                rgba(0, 242, 254, 0.2) 60%,
                transparent 60%
            );
            animation: scan 4s linear infinite;
        }

        .title {
            font-size: clamp(24px, 5vw, 42px);
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 20px;
            letter-spacing: -0.5px;
        }

        .description {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.7;
            max-width: 450px;
            margin: 0 auto 40px;
        }

        .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;

            .material-icons-round {
                font-size: 20px;
            }
        }

        .btn-primary {
            background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
            color: #050510;
            box-shadow: 0 4px 20px rgba(0, 242, 254, 0.3);

            &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 30px rgba(0, 242, 254, 0.4);
            }
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #00f2fe;
            border: 1px solid rgba(0, 242, 254, 0.3);

            &:hover {
                background: rgba(0, 242, 254, 0.1);
                border-color: #00f2fe;
                transform: translateY(-3px);
            }
        }

        .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 60px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 50px;
            color: rgba(255, 255, 255, 0.4);
            font-size: 13px;

            .material-icons-round {
                font-size: 16px;
                color: #00f2fe;
            }
        }

        // Floating Elements
        .floating-elements {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .element {
            position: absolute;
            font-size: 30px;
            opacity: 0.3;
            animation: float 6s ease-in-out infinite;
        }

        .e1 { top: 15%; left: 10%; animation-delay: 0s; }
        .e2 { top: 25%; right: 15%; animation-delay: 2s; }
        .e3 { bottom: 20%; left: 20%; animation-delay: 4s; }

        // Animations
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        @keyframes glitch {
            0%, 100% { transform: translate(0); }
            10% { transform: translate(-2px, 2px); }
            20% { transform: translate(2px, -2px); }
            30% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            50% { transform: translate(0); }
        }

        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(400%); }
        }

        // Responsive
        @media (max-width: 600px) {
            .actions {
                flex-direction: column;
                align-items: center;
            }

            .btn-primary, .btn-secondary {
                width: 100%;
                max-width: 280px;
                justify-content: center;
            }
        }
    `]
})
export class NotFoundComponent { }
