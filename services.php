<?php
$pageTitle = "Services";
$currentPage = "services";
include('components/header.php');
?>

<section class="hero">
    <div class="container">
        <h2>Our IT Services</h2>
        <p>Comprehensive solutions tailored to your business needs</p>
    </div>
</section>

<section class="services-section">
    <div class="container">
        <div id="managed-it" class="service-item">
            <h3>Managed IT Services</h3>
            <div class="service-item-content">
                <div class="service-item-image">
                    <img src="img/managed-it.jpg" alt="Managed IT Services">
                </div>
                <div class="service-item-text">
                    <p>Our comprehensive Managed IT Services provide proactive monitoring, maintenance, and support for your entire IT infrastructure. We handle everything from routine updates to complex troubleshooting, allowing you to focus on your core business operations.</p>
                    <p>Our services include:</p>
                    <ul>
                        <li>24/7 Network Monitoring</li>
                        <li>Help Desk Support</li>
                        <li>Server Management</li>
                        <li>Desktop Support</li>
                        <li>Software Updates and Patch Management</li>
                        <li>Data Backup and Recovery</li>
                        <li>IT Strategy Planning</li>
                    </ul>
                    <a href="contact.php" class="btn">Get a Quote</a>
                </div>
            </div>
        </div>

        <div id="cybersecurity" class="service-item">
            <h3>Cybersecurity Solutions</h3>
            <div class="service-item-content">
                <div class="service-item-image">
                    <img src="img/cybersecurity.jpg" alt="Cybersecurity Solutions">
                </div>
                <div class="service-item-text">
                    <p>Protect your business from evolving cyber threats with our comprehensive security solutions. We implement multiple layers of protection to safeguard your valuable data and systems from unauthorized access, malware, and other security breaches.</p>
                    <p>Our cybersecurity services include:</p>
                    <ul>
                        <li>Network Security Assessment</li>
                        <li>Endpoint Protection</li>
                        <li>Firewall Management</li>
                        <li>Email Security</li>
                        <li>Security Awareness Training</li>
                        <li>Data Encryption</li>
                        <li>Incident Response Planning</li>
                        <li>Compliance Management</li>
                    </ul>
                    <a href="contact.php" class="btn">Secure Your Business</a>
                </div>
            </div>
        </div>

        <div id="cloud-services" class="service-item">
            <h3>Cloud Services</h3>
            <div class="service-item-content">
                <div class="service-item-image">
                    <img src="img/cloud-services.jpg" alt="Cloud Services">
                </div>
                <div class="service-item-text">
                    <p>Harness the power of cloud technology to transform your business operations. Our cloud services provide scalable, flexible solutions that improve collaboration, reduce costs, and enhance data accessibility from anywhere in the world.</p>
                    <p>Our cloud services include:</p>
                    <ul>
                        <li>Cloud Migration Strategy</li>
                        <li>Microsoft 365 Implementation and Support</li>
                        <li>Google Workspace Solutions</li>
                        <li>AWS and Azure Cloud Management</li>
                        <li>Cloud Backup and Disaster Recovery</li>
                        <li>Virtual Desktop Infrastructure (VDI)</li>
                        <li>Cloud Security</li>
                    </ul>
                    <a href="contact.php" class="btn">Cloud Consultation</a>
                </div>
            </div>
        </div>

        <div id="network-infrastructure" class="service-item">
            <h3>Network Infrastructure</h3>
            <div class="service-item-content">
                <div class="service-item-image">
                    <img src="img/network-infrastructure.jpg" alt="Network Infrastructure">
                </div>
                <div class="service-item-text">
                    <p>Build a robust, reliable network infrastructure that supports your business operations. We design, implement, and maintain network solutions that ensure optimal performance, scalability, and security for your organization.</p>
                    <p>Our network services include:</p>
                    <ul>
                        <li>Network Design and Implementation</li>
                        <li>Wireless Network Solutions</li>
                        <li>VPN Setup and Management</li>
                        <li>Network Troubleshooting</li>
                        <li>Performance Optimization</li>
                        <li>Network Security</li>
                        <li>Cabling and Hardware Installation</li>
                    </ul>
                    <a href="contact.php" class="btn">Network Consultation</a>
                </div>
            </div>
        </div>
    </div>
</section>

<?php 
include('components/reviews.php');
?>

<section class="second-cta">
    <div class="container">
        <h2>Need Customized IT Solutions?</h2>
        <p>Contact us today for a free consultation</p>
        <a href="#contact" class="btn">Get in Touch</a>
    </div>
</section>

<?php 
include('components/contact-form.php');
include('components/footer.php');
?> 