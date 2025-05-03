<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - SpyderNet IT</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <script src="https://www.recaptcha.net/recaptcha/api.js" async defer></script>
    <script>
        window.onload = function() {
            var forms = document.getElementsByTagName('form');
            for (var i = 0; i < forms.length; i++) {
                forms[i].addEventListener('submit', function(event) {
                    var response = grecaptcha.getResponse();
                    if (response.length === 0) {
                        event.preventDefault();
                        alert('Please check the reCAPTCHA box to verify you are not a robot.');
                        return false;
                    }
                });
            }
        };
    </script>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">
                <a href="index.php">
                    <img src="img/spydernet-logo.png" alt="SpyderNet IT Logo">
                </a>
            </div>
            <nav>
                <ul>
                    <li><a href="index.php" <?php if($currentPage == 'home') echo 'class="active"'; ?>>Home</a></li>
                    <li><a href="services.php" <?php if($currentPage == 'services') echo 'class="active"'; ?>>Services</a></li>
                    <li><a href="about.php" <?php if($currentPage == 'about') echo 'class="active"'; ?>>About</a></li>
                    <li><a href="contact.php" <?php if($currentPage == 'contact') echo 'class="active"'; ?>>Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>
</body>
</html> 