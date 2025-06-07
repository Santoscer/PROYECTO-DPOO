function toggleChatbot() {
  const chatbot = document.getElementById('chatbot');
  const isVisible = window.getComputedStyle(chatbot).display !== 'none';
  chatbot.style.display = isVisible ? 'none' : 'flex';
}
window.toggleChatbot = toggleChatbot;

function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  setTimeout(() => {
    const response = getBotResponse(message);
    appendMessage('bot', response);
  }, 500);
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(input) {
  input = input.toLowerCase();

  if (input.includes('hola')) {
    return '¡Hola! ¿Tienes alguna duda sobre el sistema de riego automatizado?';
  }
  if (input.includes('que es el riego automatizado')) {
    return 'El riego automatizado es un sistema que riega las plantas de forma eficiente y sin intervención manual.';
  }
  if (input.includes('como funciona')) {
    return 'Nuestro sistema detecta el porcentaje de humedad mediante un sensor y activa la bomba de riego solo cuando es necesario.';
  }
  if (
    input.includes('el sensor funciona con todo tipo de plantas') ||
    input.includes('cada cuánto')
  ) {
    return 'Sí, nuestro sensor sirve para cualquier planta en la que desees utilizarlo.';
  }
  if (input.includes('beneficios') || input.includes('ventajas')) {
    return 'Mayor eficiencia en el uso del agua, ahorro económico, aumento de la producción y mejor calidad de los productos.';
  }
  if (input.includes('cada cuanto mide la humedad')) {
    return 'La humedad es medida cada 3 segundos.';
  }
  if (
    input.includes('cuanto es el porcentaje de humedad requerido para que no haya riego') ||
    input.includes('humedad')
  ) {
    return 'Si el sensor detecta más del 60% de humedad, no se activará el riego.';
  }
  if (input.includes('no detecta el arduino')) {
    return 'Prueba desconectando y volviendo a conectar el cable del Arduino.';
  }
  if (input.includes('gracias')) {
    return '¡Con mucho gusto! ¿Tienes alguna otra duda?';
  }
  if (input.includes('adios')) {
    return '¡Hasta luego!';
  }
  return 'No tengo información sobre eso aún. ¿Podrías intentar reformular tu pregunta sobre el sistema de riego automático?';
}
