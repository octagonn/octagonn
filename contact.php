<?php
$pageTitle = "Contact Us";
$currentPage = "contact";
include('components/header.php');
?>

<section class="hero">
    <div class="container">
        <h2>Contact Us</h2>
        <p>Reach out to discuss your IT needs</p>
    </div>
</section>

<?php include('components/contact-form.php'); ?>

<section class="map-section">
    <div class="container">
        <h3 style="text-align: center; margin-bottom: 20px;">Find Us</h3>
        <div class="map-container" style="height: 400px; margin-bottom: 50px;">
            <!-- Replace with an actual map if available -->
            <div style="width: 100%; height: 100%; background-color: #222; display: flex; justify-content: center; align-items: center; border-radius: 10px;">
                <p>Map placeholder - Replace with Google Maps or other map service</p>
            </div>
        </div>
    </div>
</section>

<?php 
include('components/reviews.php');
include('components/footer.php');
?> 