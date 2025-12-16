// i18n.js - Simple translation system
const translations = {
    it: {
        'Login': 'Accedi',
        'Email': 'Email',
        'Password': 'Password',
        'Login button': 'Accedi',
        'Signup button': 'Iscriviti',
        'Verifying credentials...': 'Verifico credenziali...',
        'Login successful': 'Login effettuato',
        'Creating account...': 'Creazione account...',
        'Signup successful': 'Iscrizione riuscita. Effettua il login con le credenziali appena create.',
        'Insert email and password to signup': 'Inserisci email e password per iscriverti',
        'Email and password required': 'Email e password sono richieste',
        'Invalid email format': 'Email non valida: deve contenere @',
        'Login failed': 'Login non riuscito',
        'Signup failed': 'Iscrizione fallita',
        'Network error': 'Errore di rete: ',
        'Email already registered': 'Email già registrata',
        'Invalid credentials': 'Credenziali non valide',
        'User created': 'Utente creato',
    },
    en: {
        'Login': 'Login',
        'Email': 'Email',
        'Password': 'Password',
        'Login button': 'Login',
        'Signup button': 'Sign Up',
        'Verifying credentials...': 'Verifying credentials...',
        'Login successful': 'Login successful',
        'Creating account...': 'Creating account...',
        'Signup successful': 'Registration successful. Please login with your credentials.',
        'Insert email and password to signup': 'Please enter email and password to sign up',
        'Email and password required': 'Email and password are required',
        'Invalid email format': 'Invalid email: must contain @',
        'Login failed': 'Login failed',
        'Signup failed': 'Signup failed',
        'Network error': 'Network error: ',
        'Email already registered': 'Email already registered',
        'Invalid credentials': 'Invalid credentials',
        'User created': 'User created',
    },
    es: {
        'Login': 'Iniciar sesión',
        'Email': 'Correo electrónico',
        'Password': 'Contraseña',
        'Login button': 'Iniciar sesión',
        'Signup button': 'Registrarse',
        'Verifying credentials...': 'Verificando credenciales...',
        'Login successful': 'Inicio de sesión exitoso',
        'Creating account...': 'Creando cuenta...',
        'Signup successful': 'Registro exitoso. Inicia sesión con tus credenciales.',
        'Insert email and password to signup': 'Introduce correo y contraseña para registrarte',
        'Email and password required': 'El correo y la contraseña son obligatorios',
        'Invalid email format': 'Correo inválido: debe contener @',
        'Login failed': 'Error al iniciar sesión',
        'Signup failed': 'Error al registrarse',
        'Network error': 'Error de red: ',
        'Email already registered': 'El correo ya está registrado',
        'Invalid credentials': 'Credenciales inválidas',
        'User created': 'Usuario creado',
    },
    fr: {
        'Login': 'Connexion',
        'Email': 'E-mail',
        'Password': 'Mot de passe',
        'Login button': 'Se connecter',
        'Signup button': 'S\'inscrire',
        'Verifying credentials...': 'Vérification des identifiants...',
        'Login successful': 'Connexion réussie',
        'Creating account...': 'Création du compte...',
        'Signup successful': 'Inscription réussie. Connectez-vous avec vos identifiants.',
        'Insert email and password to signup': 'Entrez l\'email et le mot de passe pour vous inscrire',
        'Email and password required': 'L\'email et le mot de passe sont obligatoires',
        'Invalid email format': 'Email invalide : doit contenir @',
        'Login failed': 'Échec de la connexion',
        'Signup failed': 'Échec de l\'inscription',
        'Network error': 'Erreur réseau : ',
        'Email already registered': 'Email déjà enregistré',
        'Invalid credentials': 'Identifiants invalides',
        'User created': 'Utilisateur créé',
    },
    ja: {
        'Login': 'ログイン',
        'Email': 'メール',
        'Password': 'パスワード',
        'Login button': 'ログイン',
        'Signup button': '登録',
        'Verifying credentials...': '認証情報を確認中...',
        'Login successful': 'ログイン成功',
        'Creating account...': 'アカウント作成中...',
        'Signup successful': '登録成功。作成したアカウントでログインしてください。',
        'Insert email and password to signup': '登録するにはメールとパスワードを入力してください',
        'Email and password required': 'メールとパスワードが必要です',
        'Invalid email format': 'メールが無効です。@を含める必要があります',
        'Login failed': 'ログイン失敗',
        'Signup failed': '登録失敗',
        'Network error': 'ネットワークエラー: ',
        'Email already registered': 'メールは既に登録されています',
        'Invalid credentials': '認証情報が無効です',
        'User created': 'ユーザーが作成されました',
    }
};

// Detect language from browser
function detectLanguage() {
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'en';
}

// Get translation
function t(key) {
    const lang = localStorage.getItem('lang') || detectLanguage();
    return (translations[lang] && translations[lang][key]) || key;
}

// Set language (without page reload)
function setLanguage(lang) {
    if (translations[lang]) {
        localStorage.setItem('lang', lang);
        // Update UI without reload
        updateLanguageUI();
        // Dispatch event for other scripts to listen
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
}

// Update all UI elements with new language
function updateLanguageUI() {
    // Update button styles
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const lang = localStorage.getItem('lang') || detectLanguage();
    // set html/body lang attributes to help browser translators
    try{
        if(document && document.documentElement) document.documentElement.lang = lang;
        if(document && document.body) document.body.lang = lang;
    }catch(e){/* ignore when not in browser */}

    const activeBtn = document.querySelector(`.lang-btn[onclick="setLanguage('${lang}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Trigger custom update event that components can listen to
    if (typeof updatePageTranslations === 'function') {
        updatePageTranslations();
    }
}

// Get available languages
function getAvailableLanguages() {
    return Object.keys(translations);
}
