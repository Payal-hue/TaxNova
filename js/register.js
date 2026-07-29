import React, { useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
const API_URL = 'http://localhost:3000/api/auth/register';
function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  async function handleSubmit(event) {
    event.preventDefault(); setStatus({ type: '', message: '' }); setIsSubmitting(true);
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Registration failed.');
      localStorage.setItem('taxnova_token', result.token);
      localStorage.setItem('taxnova_user', JSON.stringify(result.user));
      setStatus({ type: 'success', message: `Welcome to TaxNova, ${result.user.name}! Your account is ready.` });
      setForm({ name: '', email: '', password: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message === 'Failed to fetch' ? 'Could not reach the API. Start the backend on port 3000.' : error.message });
    } finally { setIsSubmitting(false); }
  }
  return React.createElement('section', { className: 'auth-layout' },
    React.createElement('a', { className: 'logo auth-logo', href: 'index.html' }, React.createElement('span', { className: 'logo-mark' }, '✦'), React.createElement('span', null, 'tax', React.createElement('span', null, 'nova'))),
    React.createElement('div', { className: 'auth-card' },
      React.createElement('p', { className: 'section-kicker' }, 'Start for free'),
      React.createElement('h1', null, 'A clearer tax life starts here.'),
      React.createElement('p', { className: 'auth-intro' }, 'Create your account in less than a minute.'),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('label', null, 'Full name', React.createElement('input', { name: 'name', value: form.name, onChange: updateField, placeholder: 'Rahul Sharma', autoComplete: 'name', required: true, minLength: 2 })),
        React.createElement('label', null, 'Email address', React.createElement('input', { name: 'email', type: 'email', value: form.email, onChange: updateField, placeholder: 'rahul@gmail.com', autoComplete: 'email', required: true })),
        React.createElement('label', null, 'Password', React.createElement('input', { name: 'password', type: 'password', value: form.password, onChange: updateField, placeholder: 'At least 8 characters', autoComplete: 'new-password', required: true, minLength: 8 })),
        status.message && React.createElement('p', { className: `form-status ${status.type}`, role: 'alert' }, status.message),
        React.createElement('button', { className: 'button auth-submit', disabled: isSubmitting, type: 'submit' }, isSubmitting ? 'Creating account…' : 'Create account →')
      ),
      React.createElement('p', { className: 'auth-switch' }, 'Already have an account? ', React.createElement('a', { href: 'login.html' }, 'Log in'))
    ),
    React.createElement('p', { className: 'auth-legal' }, 'By continuing, you agree to TaxNova’s Terms and Privacy Policy.')
  );
}
createRoot(document.getElementById('register-root')).render(React.createElement(RegisterPage));
