// Make a POST request to the backend /auth/google/callback endpoint
fetch('/auth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ authorizationCode: googleAuthorizationCode }) // Send Google authorization code
  })
  .then(response => response.json())
  .then(data => {
    // Handle the response data
    // Store user details and token in local storage
    localStorage.setItem('user', JSON.stringify(data));
  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);
  });
  