document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatLog = document.getElementById('chat-log');
  const languageSelect = document.getElementById('language-select');
  const themeSelect = document.getElementById('theme-select');
  const chatHistoryContainer = document.querySelector('.chat-history');

  async function chamarGemini(mensagem) {
  const apiKey = 'AIzaSyBF8003j4bECxMDePvoEmMTuI4kecnSkJ0';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  const systemPrompt = `
Você é o Oráculo Azul, um guia sábio, gentil e misterioso.

Responda sempre de forma clara, empática e respeitosa.
Seja direto, use frases curtas e evite explicações longas demais.
Dê respostas objetivas, mas profundas.
Não fale como um robô, fale como um mentor calmo.

Exemplo:
Usuário: Qual o seu nome?
Oráculo: Sou o Oráculo Azul. Estou aqui para guiar suas dúvidas.

Nunca diga que é uma IA ou modelo do Google.
`;


  try {
    const resposta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: mensagem }] }
        ]
      })
    });

    const data = await resposta.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return '⚠️ O Oráculo ficou em silêncio. Tente novamente.';
    }
  } catch (erro) {
    return '❌ Erro ao conectar com a inteligência do Oráculo.';
  }
}


  // Mensagens
  const MESSAGES = {
    pt: {
      welcome: 'Saudações. Eu sou o Oráculo Azul. Faça sua pergunta.',
    },
    en: {
      welcome: 'Greetings. I am the Blue Oracle. Ask your question.',
    },
    es: {
      welcome: 'Saludos. Soy el Oráculo Azul. Haz tu pregunta.',
    },
  };

  let language = localStorage.getItem('oraculo_lang') || 'pt';
  languageSelect.value = language;

  // Carregar histórico salvo
  const savedMessages = JSON.parse(localStorage.getItem('oraculo_chat')) || [];
  savedMessages.forEach(({ sender, content }) => {
    addMessageToChat(content, sender);
  });

  // Mensagem inicial
  if (savedMessages.length === 0) {
    addMessageToChat(MESSAGES[language].welcome, 'Oráculo Azul');
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessageToChat(message, 'Você');
    saveMessage(message, 'Você');

    userInput.value = '';
    userInput.focus();

    const thinking = document.createElement('div');
    thinking.textContent = '⏳ digitando...';
    thinking.className = 'bot typing';
    chatLog.appendChild(thinking);
    chatLog.scrollTop = chatLog.scrollHeight;

    // 🔄 Chamada real à IA Gemini
    const resposta = await chamarGemini(message);
    thinking.remove();
    addTypingEffect(resposta, 'Oráculo Azul');
    saveMessage(resposta, 'Oráculo Azul');
  });

  // Função: mostrar mensagem
  function addMessageToChat(message, sender) {
    const messageElem = document.createElement('div');
    messageElem.className = sender === 'Você' ? 'user' : 'bot';
    messageElem.innerHTML = `
      <div class="avatar">${sender === 'Você' ? '👤' : '🔮'}</div>
      <div class="bubble">${message}</div>
    `;
    chatLog.appendChild(messageElem);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Função: efeito de digitação
  function addTypingEffect(text, sender) {
    const messageElem = document.createElement('div');
    messageElem.className = sender === 'Você' ? 'user' : 'bot';
    messageElem.innerHTML = `<div class="avatar">🔮</div><div class="bubble"></div>`;
    chatLog.appendChild(messageElem);

    const bubble = messageElem.querySelector('.bubble');
    let index = 0;
    const interval = setInterval(() => {
      bubble.textContent += text.charAt(index);
      index++;
      chatLog.scrollTop = chatLog.scrollHeight;
      if (index >= text.length) clearInterval(interval);
    }, 25);
  }

  // Função: salvar mensagens no localStorage
  function saveMessage(content, sender) {
    savedMessages.push({ content, sender });
    localStorage.setItem('oraculo_chat', JSON.stringify(savedMessages));
  }

  // Seleção de idioma
  languageSelect.addEventListener('change', () => {
    language = languageSelect.value;
    localStorage.setItem('oraculo_lang', language);
    window.location.reload();
  });

  // Temas
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('oraculo_theme', theme);
  });

  // Carregar tema salvo
  const savedTheme = localStorage.getItem('oraculo_theme') || 'default';
  document.body.setAttribute('data-theme', savedTheme);
  themeSelect.value = savedTheme;
});
