import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tool {
    name: string;
    icon: string;
    category: string;
    description: string;
}

@Component({
    selector: 'app-arsenal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './arsenal.component.html',
    styleUrl: './arsenal.component.scss'
})
export class ArsenalComponent {
    // Hardcoded Tools & Technologies (as per user requirement)
    tools: Tool[] = [
        // Penetration Testing
        { name: 'Burp Suite', icon: '🔧', category: 'Penetration Testing', description: 'Web vulnerability scanner and proxy' },
        { name: 'Metasploit', icon: '⚔️', category: 'Penetration Testing', description: 'Exploitation framework' },
        { name: 'Nmap', icon: '🗺️', category: 'Penetration Testing', description: 'Network discovery and security auditing' },
        { name: 'SQLMap', icon: '💉', category: 'Penetration Testing', description: 'SQL injection automation' },

        // Vulnerability Scanning
        { name: 'Nessus', icon: '📊', category: 'Vulnerability Scanning', description: 'Comprehensive vulnerability scanner' },
        { name: 'OpenVAS', icon: '🔍', category: 'Vulnerability Scanning', description: 'Open source vulnerability assessment' },
        { name: 'Qualys', icon: '☁️', category: 'Vulnerability Scanning', description: 'Cloud-based security platform' },

        // Network Analysis
        { name: 'Wireshark', icon: '📡', category: 'Network Analysis', description: 'Network protocol analyzer' },
        { name: 'tcpdump', icon: '📦', category: 'Network Analysis', description: 'Command-line packet analyzer' },

        // Operating Systems
        { name: 'Kali Linux', icon: '🐧', category: 'Operating Systems', description: 'Security-focused Linux distribution' },
        { name: 'Parrot OS', icon: '🦜', category: 'Operating Systems', description: 'Security and privacy focused OS' },

        // Programming
        { name: 'Python', icon: '🐍', category: 'Programming', description: 'Security automation and scripting' },
        { name: 'Bash', icon: '💻', category: 'Programming', description: 'Shell scripting for automation' },
        { name: 'Go', icon: '🔷', category: 'Programming', description: 'High-performance security tools' },

        // Forensics
        { name: 'Autopsy', icon: '🔬', category: 'Forensics', description: 'Digital forensics platform' },
        { name: 'Volatility', icon: '🧠', category: 'Forensics', description: 'Memory forensics framework' },

        // Cloud Security
        { name: 'AWS Security Hub', icon: '🔒', category: 'Cloud Security', description: 'AWS security posture management' },
        { name: 'Prowler', icon: '🦉', category: 'Cloud Security', description: 'AWS security best practices' },
    ];

    get categories(): string[] {
        return [...new Set(this.tools.map(t => t.category))];
    }

    getToolsByCategory(category: string): Tool[] {
        return this.tools.filter(t => t.category === category);
    }
}
