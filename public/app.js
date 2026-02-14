const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');

function appendMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = `${role === 'user' ? 'You' : 'Bot'}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) {
    return;
  }

  appendMessage(message, 'user');
  input.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    if (!response.ok) {
      appendMessage(data.error || 'An unexpected error occurred.', 'assistant');
      return;
    }

    appendMessage(data.response, 'assistant');
  } catch (error) {
    appendMessage(`Request failed: ${error.message}`, 'assistant');
  }
});
