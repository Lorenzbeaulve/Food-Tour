// auth.js - client-side login/signup handlers
// API base (frontend may be served from a different origin/port)

const API_BASE = window.API_BASE || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            clearLoginError();
            if (!email || !password) return setLoginError('Inserisci email e password');
            try {
                const res = await fetch(API_BASE + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok && data && data.success) {
                    // redirect to success page
                    window.location.href = 'success.html';
                } else if (data && data.msg) {
                    setLoginError(data.msg);
                } else {
                    setLoginError('Login fallito');
                }
            } catch (err) {
                console.error(err);
                setLoginError('Errore di rete durante il login');
            }
        });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('name').value.trim();
            const cognome = document.getElementById('surname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            clearSignupError();
            if (!email || !password || !nome || !cognome) return setSignupError('Compila tutti i campi richiesti');
            try {
                const res = await fetch(API_BASE + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, nome, cognome })
                });
                const data = await res.json();
                if (res.ok && data && data.success) {
                    // show success message then redirect
                    setSignupError('Registrazione avvenuta. Reindirizzamento al login...');
                    setTimeout(()=> window.location.href = 'index.html', 1200);
                } else if (data && data.msg) {
                    setSignupError(data.msg);
                } else {
                    setSignupError('Registrazione fallita');
                }
            } catch (err) {
                console.error(err);
                setSignupError('Errore di rete durante la registrazione');
            }
        });
    }
});

// Inline error helpers
function setLoginError(msg){
    const el = document.getElementById('login-error');
    if(el){ el.textContent = msg; el.style.display = 'block'; }
    else alert(msg);
}
function clearLoginError(){
    const el = document.getElementById('login-error'); if(el){ el.textContent = ''; el.style.display = 'none'; }
}
function setSignupError(msg){
    const el = document.getElementById('signup-error');
    if(el){ el.textContent = msg; el.style.display = 'block'; }
    else alert(msg);
}
function clearSignupError(){
    const el = document.getElementById('signup-error'); if(el){ el.textContent = ''; el.style.display = 'none'; }
}
