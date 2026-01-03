import { Request, Response } from 'express';

export class ContentController {

    async getServices(req: Request, res: Response) {
        const services = [
            {
                id: '1',
                title: 'Cyber Security Audits',
                description: 'Comprehensive security assessments for your infrastructure.',
                icon: 'shield-check',
                slug: 'cyber-security-audits'
            },
            {
                id: '2',
                title: 'Penetration Testing',
                description: 'Ethical hacking to identify vulnerabilities before attackers do.',
                icon: 'bug',
                slug: 'penetration-testing'
            },
            {
                id: '3',
                title: 'Incident Response',
                description: 'Rapid response team to handle security breaches and data loss.',
                icon: 'siren',
                slug: 'incident-response'
            }
        ];
        res.json(services);
    }

    async getCaseStudies(req: Request, res: Response) {
        const caseStudies = [
            {
                id: '1',
                title: 'FinTech Security Overhaul',
                client: 'PaySafe India',
                description: 'Securing payment gateways for a leading fintech startup.',
                image_url: 'https://picsum.photos/800/600?random=1',
                slug: 'fintech-security-overhaul'
            },
            {
                id: '2',
                title: 'Healthcare Data Protection',
                client: 'MedSecure',
                description: 'HIPAA compliant infrastructure setup for a hospital network.',
                image_url: 'https://picsum.photos/800/600?random=2',
                slug: 'healthcare-data-protection'
            }
        ];
        res.json(caseStudies);
    }

    async getHomepage(req: Request, res: Response) {
        res.json({
            hero: {
                title: 'Securing India\'s Digital Future',
                subtitle: 'Advanced cybersecurity solutions for modern enterprises.',
                cta_text: 'Get Started',
                cta_link: '/contact'
            },
            about_preview: {
                title: 'Who We Are',
                content: 'BharatSecurity is a leading provider of focused cyber defense services...'
            }
        });
    }

    async getStatistics(req: Request, res: Response) {
        res.json([
            { label: 'Clients Protected', value: '500+' },
            { label: 'Threats Blocked', value: '1M+' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Experts', value: '50+' }
        ]);
    }

    async getTestimonials(req: Request, res: Response) {
        res.json([
            {
                id: '1',
                name: 'Rahul Sharma',
                role: 'CTO, TechCorp',
                content: 'BharatSecurity transformed our security posture completely. Highly recommended!',
                avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
                id: '2',
                name: 'Priya Patel',
                role: 'Director, FinServe',
                content: 'Their incident response time is unmatched. A true partner in security.',
                avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
            }
        ]);
    }

    async getClientLogos(req: Request, res: Response) {
        res.json([
            { id: '1', name: 'Client A', url: 'https://placehold.co/200x100?text=Client+A' },
            { id: '2', name: 'Client B', url: 'https://placehold.co/200x100?text=Client+B' },
            { id: '3', name: 'Client C', url: 'https://placehold.co/200x100?text=Client+C' },
            { id: '4', name: 'Client D', url: 'https://placehold.co/200x100?text=Client+D' }
        ]);
    }

    async getTechnologies(req: Request, res: Response) {
        res.json([
            { id: '1', name: 'Angular', icon_url: 'https://placehold.co/100x100?text=NG' },
            { id: '2', name: 'Node.js', icon_url: 'https://placehold.co/100x100?text=Node' },
            { id: '3', name: 'PostgreSQL', icon_url: 'https://placehold.co/100x100?text=PG' },
            { id: '4', name: 'Docker', icon_url: 'https://placehold.co/100x100?text=Docker' }
        ]);
    }

    async getProcessSteps(req: Request, res: Response) {
        res.json([
            { step: 1, title: 'Assessment', description: 'We analyze your current security posture.' },
            { step: 2, title: 'Strategy', description: 'Developing a tailored security roadmap.' },
            { step: 3, title: 'Implementation', description: 'Deploying advanced defense mechanisms.' },
            { step: 4, title: 'Monitoring', description: '24/7 surveillance and threat hunting.' }
        ]);
    }
}

export const contentController = new ContentController();
