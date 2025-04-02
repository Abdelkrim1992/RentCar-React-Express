// Simple script to login as admin and store token in localStorage

const loginAdmin = async () => {
  try {
    // Login request
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      // Store token in localStorage
      localStorage.setItem('ether_auth_token', data.token);
      
      // Store user data in localStorage
      localStorage.setItem('ether_auth_user', JSON.stringify(data.data));
      
      console.log('Admin login successful!');
      console.log('Token stored in localStorage:', data.token);
      console.log('User data stored in localStorage:', data.data);
      
      // Redirect to admin dashboard
      window.location.href = '/admin';
    } else {
      console.error('Login failed:', data);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
};

// Execute login
loginAdmin();