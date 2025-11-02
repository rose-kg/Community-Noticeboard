const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');

loginForm.onsubmit = function(e) {
  e.preventDefault();
  errorDiv.style.display = 'none';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  
  // Use secure API login
  const password = passwordInput.value;
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
  
  setTimeout(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', result.token);
        window.location.href = 'admin.html';
      } else {
        errorDiv.textContent = 'Invalid password. Please try again.';
        errorDiv.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    } catch (error) {
      errorDiv.textContent = 'Login failed. Please try again.';
      errorDiv.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  }, 700);
};