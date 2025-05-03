<?php
$pageTitle = "Home";
$currentPage = "home";
include('components/header.php');
?>

<section class="hero">
    <div class="container">
        <h2>Welcome to SpyderNet IT - Your IT Solutions Provider</h2>
        <a href="#contact" class="btn">GET EXPERT HELP TODAY ↓</a>
    </div>
</section>

<section class="section-title">
    <div class="container">
        <h2><span class="icon-wrench">🔧</span> Why Choose SpyderNet IT?</h2>
    </div>
</section>

<section class="about-preview">
    <div class="container">
        <div class="about-content">
            <div class="about-card">
                <img src="img/tech-support.png" alt="IT Support">
                <h3><span class="icon-yellow">💡</span> Fast, Reliable Help — Right When You Need It</h3>
                <p>No more waiting on hold or guessing what's wrong. Whether your Wi-Fi's down, your devices aren't syncing, or your network needs a pro setup, we show up fast and get the job done right the first time.</p>
            </div>
            <div class="about-card">
                <img src="img/keyboard.png" alt="Tech Made Simple">
                <h3><span class="icon-pink">🧠</span> Tech Made Simple — No Geek Speak</h3>
                <p>We break down the fix in plain English, walk you through the process, and never upsell what you don't need. Our goal? Make your tech work for <em>you</em>, not the other way around.</p>
            </div>
            <div class="about-card">
                <img src="img/spydernet-logo-white.png" alt="SpyderNet IT Logo">
                <h3><span class="icon-teal">📞</span> Let's Get You Back Online — Today</h3>
                <p>Reach out now for a free consultation or same-day service in your area. We're local, honest, and ready to help.</p>
            </div>
        </div>
    </div>
</section>

<section class="second-cta">
    <div class="container">
        <h2>Reliable Tech Solutions. Trusted Local Support.</h2>
        <a href="#contact" class="btn">Make An Appointment! ↓</a>
    </div>
</section>

<?php 
include('components/contact-form.php');
include('components/reviews.php');
include('components/footer.php');
?> 