document.addEventListener('DOMContentLoaded', function() {
    const text = document.querySelector('h1');
    let isLarge = false;

    text.addEventListener('click', function() {
        if (isLarge) {
            text.style.fontSize = '16px';
        } else {
            text.style.fontSize = '48px';
        }
        isLarge = !isLarge;
    });
});