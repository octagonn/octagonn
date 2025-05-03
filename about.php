<?php
$pageTitle = "About Us";
$currentPage = "about";
include('components/header.php');
?>

<section class="hero">
    <div class="container">
        <h2>About SpyderNet IT</h2>
        <p>Your trusted partner for comprehensive IT solutions</p>
    </div>
</section>

<section class="about-section">
    <div class="container">
        <div class="about-content">
            <div class="about-text">
                <h3>Our Story</h3>
                <p>SpyderNet IT was founded with a clear mission: to provide businesses and individuals with reliable, efficient, and secure IT solutions that enable growth and success. We've evolved from a small local IT support company to a comprehensive technology service provider serving clients across multiple industries.</p>
                <p>Our journey has been driven by a commitment to excellence, innovation, and exceptional customer service. We understand that technology is constantly changing, and we stay at the forefront of industry trends to ensure our clients receive the most advanced solutions available.</p>
                <h3>Our Approach</h3>
                <p>At SpyderNet IT, we believe that technology should work for you, not against you. Our approach is centered around understanding your unique needs and challenges, then developing customized solutions that align with your goals.</p>
                <p>We don't just fix IT problems – we prevent them from happening in the first place. Our proactive approach to IT management ensures your systems are always running optimally, minimizing downtime and maximizing productivity.</p>
            </div>
            <div class="about-image">
                <img src="img/about-main.jpg" alt="SpyderNet IT Office">
            </div>
        </div>
    </div>
</section>

<section class="team-section">
    <div class="container">
        <h2>Our Technology Services</h2>
        <div class="team-grid">
            <div class="team-member">
                <img src="img/network.jpg" alt="Network Infrastructure">
                <h3>Network Infrastructure</h3>
                <p>We design, implement, and maintain robust network solutions that ensure optimal performance, scalability, and security for your business.</p>
            </div>
            <div class="team-member">
                <img src="img/security.jpg" alt="Cybersecurity">
                <h3>Cybersecurity</h3>
                <p>Protect your business with our advanced security solutions, including threat detection, prevention, and rapid response to security incidents.</p>
            </div>
            <div class="team-member">
                <img src="img/cloud.jpg" alt="Cloud Services">
                <h3>Cloud Services</h3>
                <p>Transform your business with our cloud solutions that improve collaboration, reduce costs, and enhance data accessibility.</p>
            </div>
            <div class="team-member">
                <img src="img/support.jpg" alt="Technical Support">
                <h3>Technical Support</h3>
                <p>Get reliable help when you need it with our responsive support team, ready to solve your IT challenges quickly and efficiently.</p>
            </div>
        </div>
    </div>
</section>

<section class="second-cta">
    <div class="container">
        <h2>Ready to Work With Us?</h2>
        <p>Contact our team today to learn how we can help</p>
        <a href="contact.php" class="btn">Get in Touch</a>
    </div>
</section>

<?php 
include('components/contact-form.php');
include('components/reviews.php');
include('components/footer.php');
?> 