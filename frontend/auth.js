const API_BASE = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (showSignupLink) showSignupLink.addEventListener('click', toggleForms);
    if (showLoginLink) showLoginLink.addEventListener('click', toggleForms);
});

function toggleForms(e) {
    if (e) e.preventDefault();
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (token && user) {
            window.location.href = '/dashboard';
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) { showNotification('Please fill in all fields','error'); return; }
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Signing in...'; loginBtn.disabled = true;
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showNotification('Login successful! Redirecting...','success');
            setTimeout(()=> window.location.href='/dashboard', 800);
        } else {
            showNotification(data.message || 'Login failed','error');
        }
    } catch (err) {
        console.error(err); showNotification('Network error. Is the server running?','error');
    } finally { loginBtn.textContent = originalText; loginBtn.disabled = false; }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (!name || !email || !password || !confirmPassword) { showNotification('Please fill in all fields','error'); return; }
    if (password !== confirmPassword) { showNotification('Passwords do not match','error'); return; }
    if (password.length < 6) { showNotification('Password must be at least 6 characters long','error'); return; }
    const signupBtn = e.target.querySelector('button[type="submit"]');
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Creating Account...'; signupBtn.disabled = true;
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Account created successfully! Please login.','success');
            toggleForms({preventDefault:()=>{}});
            document.getElementById('signup-form').reset();
        } else {
            showNotification(data.message || 'Registration failed','error');
        }
    } catch (err) {
        console.error(err); showNotification('Network error. Is the server running?','error');
    } finally { signupBtn.textContent = originalText; signupBtn.disabled = false; }
}

function showNotification(message, type='success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type==='error'?'error':''}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(()=> notification.style.transform='translateX(0)',100);
    setTimeout(()=> { notification.style.transform='translateX(150%)'; setTimeout(()=> notification.remove(),300); }, 3000);
}
