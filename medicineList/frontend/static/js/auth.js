// Authentication functionality

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerModal = document.getElementById('registerModal');
const showRegisterModalBtn = document.getElementById('showRegisterModal');
const closeRegisterModalBtn = document.getElementById('closeRegisterModal');

// Modal functionality
if (showRegisterModalBtn) {
    showRegisterModalBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.classList.add('active');
    });
}

if (closeRegisterModalBtn) {
    closeRegisterModalBtn.addEventListener('click', function() {
        registerModal.classList.remove('active');
    });
}

// Close modal when clicking outside
if (registerModal) {
    registerModal.addEventListener('click', function(e) {
        if (e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && registerModal.classList.contains('active')) {
        registerModal.classList.remove('active');
    }
});

// Login form handler
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Register form handler
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

async function handleLogin(event) {
    event.preventDefault();
    
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Get form data
    const formData = new FormData(event.target);
    const data = {
        patient_id: formData.get('patient_id'),
        password: formData.get('password')
    };
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: new URLSearchParams(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Show success message
            successMessage.textContent = result.message;
            successMessage.style.display = 'block';
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/home/';
            }, 1000);
        } else {
            // Show error message
            errorMessage.textContent = result.message || 'Login failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Network error. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const errorMessage = document.getElementById('registerErrorMessage');
    const successMessage = document.getElementById('registerSuccessMessage');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Get form data
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        age: formData.get('age'),
        email: formData.get('email'),
        patient_id: formData.get('patient_id'),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password')
    };
    
    // Validate passwords match
    if (data.password !== data.confirm_password) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (data.password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: new URLSearchParams({
                name: data.name,
                age: data.age,
                email: data.email,
                patient_id: data.patient_id,
                password: data.password
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Show success message
            successMessage.textContent = result.message;
            successMessage.style.display = 'block';
            
            // Clear form
            registerForm.reset();
            
            // Close modal and redirect to login after a short delay
            setTimeout(() => {
                registerModal.classList.remove('active');
                // Show success on login page
                const loginSuccess = document.getElementById('successMessage');
                loginSuccess.textContent = 'Account created! Please log in.';
                loginSuccess.style.display = 'block';
            }, 2000);
        } else {
            // Show error message
            errorMessage.textContent = result.message || 'Registration failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = 'Network error. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
}

// Check if user is logged in
async function isLoggedIn() {
    try {
        const response = await fetch('/home/', {
            method: 'GET',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const response = await fetch('/home/', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            return { authenticated: true };
        }
        return { authenticated: false };
    } catch (error) {
        console.error('Error getting current user:', error);
        return { authenticated: false };
    }
}

// Helper function to get CSRF token from cookies
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// Logout function
async function logout() {
    try {
        // Clear all localStorage data to prevent data leakage between users
        localStorage.clear();
        
        // Prepare headers with CSRF token
        const headers = {};
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        // Call backend logout to clear session
        await fetch('/api/logout/', {
            method: 'POST',
            headers: headers,
            credentials: 'include'
        });
        
        // Redirect to login page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, clear localStorage and redirect
        localStorage.clear();
        window.location.href = '/';
    }
}

// Make logout globally accessible
window.logout = logout;

// Redirect to login if not authenticated (for protected pages)
async function requireAuth() {
    const authenticated = await isLoggedIn();
    if (!authenticated) {
        window.location.href = '/';
    }
}
