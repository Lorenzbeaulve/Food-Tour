document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('auth-form');
    const signupBtn = document.getElementById('signup-btn');
    const message = document.getElementById('message');

    // Update UI text on language change
    function updateUIText() {
        document.getElementById('title').textContent = t('Login');
        document.getElementById('email-label').textContent = t('Email');
        document.getElementById('password-label').textContent = t('Password');
        document.getElementById('login-btn').textContent = t('Login button');
        document.getElementById('signup-btn').textContent = t('Signup button');
    }

    function showMessage(text, isError = false){
        if(!message) return;
        message.textContent = text;
        message.style.color = isError ? '#b91c1c' : 'var(--muted)';
    }

    // Function to update all translations
    window.updatePageTranslations = function() {
        updateUIText();
    };

    updateUIText();

    // Listen for language changes
    window.addEventListener('languageChanged', function() {
        updateUIText();
    });

    if(authForm){
        authForm.addEventListener('submit', async function(e){
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            showMessage(t('Verifying credentials...'));
            try{
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if(res.ok){
                    // redirect to success page
                    window.location.href = '/success.html';
                } else {
                    const j = await res.json().catch(()=>({message:t('Login failed')}));
                    showMessage(j.message || t('Login failed'), true);
                }
            }catch(err){
                showMessage(t('Network error') + err.message, true);
            }
        });
    }

    if(signupBtn){
        signupBtn.addEventListener('click', async function(){
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            if(!email || !password){ showMessage(t('Insert email and password to signup'), true); return; }
            showMessage(t('Creating account...'));
            try{
                const res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if(res.ok){
                    showMessage(t('Signup successful'));
                    authForm.reset();
                } else {
                    const j = await res.json().catch(()=>({message:t('Signup failed')}));
                    showMessage(j.message || t('Signup failed'), true);
                }
            }catch(err){
                showMessage(t('Network error') + err.message, true);
            }
        });
    }
});