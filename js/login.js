import React, { useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
const API_URL = 'http://localhost:3000/api/auth/login';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  async function handleSubmit(event) {
    event.preventDefault(); setStatus({ type: '', message: '' }); setIsSubmitting(true);
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Login failed.');
      localStorage.setItem('taxnova_token', result.token);
      localStorage.setItem('taxnova_user', JSON.stringify(result.user));
      setStatus({ type: 'success', message: `Welcome back, ${result.user.name}!` });
      // The dashboard will use this token as: Authorization: Bearer <token>.
      window.location.href = 'dashboard.html';
    } catch (error) {
      setStatus({ type: 'error', message: error.message === 'Failed to fetch' ? 'Could not reach the API. Start the backend on port 3000.' : error.message });
    } finally { setIsSubmitting(false); }
  }
  return React.createElement('section', { className: 'auth-layout' },
    React.createElement('a', { className: 'logo auth-logo', href: 'index.html' }, React.createElement('span', { className: 'logo-mark' }, '✦'), React.createElement('span', null, 'tax', React.createElement('span', null, 'nova'))),
    React.createElement('div', { className: 'auth-card' },
      React.createElement('p', { className: 'section-kicker' }, 'Welcome back'),
      React.createElement('h1', null, 'Your numbers are waiting.'),
      React.createElement('p', { className: 'auth-intro' }, 'Log in to continue to your TaxNova workspace.'),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('label', null, 'Email address', React.createElement('input', { name: 'email', type: 'email', value: form.email, onChange: updateField, placeholder: 'rahul@gmail.com', autoComplete: 'email', required: true })),
        React.createElement('label', null, 'Password', React.createElement('input', { name: 'password', type: 'password', value: form.password, onChange: updateField, placeholder: 'Your password', autoComplete: 'current-password', required: true })),
        status.message && React.createElement('p', { className: `form-status ${status.type}`, role: 'alert' }, status.message),
        React.createElement('button', { className: 'button auth-submit', disabled: isSubmitting, type: 'submit' }, isSubmitting ? 'Logging in…' : 'Log in →')
      ),
      React.createElement('p', { className: 'auth-switch' }, 'New to TaxNova? ', React.createElement('a', { href: 'register.html' }, 'Create an account'))
    ),
    React.createElement('p', { className: 'auth-legal' }, 'Your account is protected with secure password hashing and JWT authentication.')
  );
}
createRoot(document.getElementById('login-root')).render(React.createElement(LoginPage));
