const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');

loginForm.onsubmit = function(e) {
  e.preventDefault();
  errorDiv.style.display = 'none';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  
  setTimeout(() => { 
    const password = passwordInput.value;
    if (password === 'admin123') {
      localStorage.setItem('adminAuthenticated', 'true');
      window.location.href = 'admin.html';
    } else {
      errorDiv.textContent = 'Invalid password. Please try again.';
      errorDiv.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  }, 700);
};