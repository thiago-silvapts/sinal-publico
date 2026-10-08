// Sinal Público v12 - Lógica de Aplicação
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

async function createRoom() {
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById('display-room-code').innerText = `SALA: ${roomCode}`;
  showScreen('screen-call');
  
  if (window.WebRTCManager) {
    await window.WebRTCManager.initCall(roomCode, true);
  }
}

async function joinRoom() {
  const roomCode = document.getElementById('room-code-input').value.trim();
  if (roomCode.length !== 6) {
    alert("Por favor, digite um código de sala válido de 6 dígitos.");
    return;
  }
  
  document.getElementById('display-room-code').innerText = `SALA: ${roomCode}`;
  showScreen('screen-call');

  if (window.WebRTCManager) {
    await window.WebRTCManager.initCall(roomCode, false);
  }
}

function toggleAudio() {
  if (window.WebRTCManager) {
    const isMuted = window.WebRTCManager.toggleAudio();
    document.getElementById('btn-toggle-mic').innerText = isMuted ? '🎙️ Ativar Mic' : '🎙️ Mutar Mic';
  }
}

function toggleVideo() {
  if (window.WebRTCManager) {
    const isDisabled = window.WebRTCManager.toggleVideo();
    document.getElementById('btn-toggle-cam').innerText = isDisabled ? '📷 Ligar Cam' : '📷 Desligar Cam';
  }
}

async function switchCamera() {
  if (window.WebRTCManager) {
    await window.WebRTCManager.switchCamera();
  }
}

function endCall() {
  if (window.WebRTCManager) {
    window.WebRTCManager.endCall();
  }
  showScreen('screen-dashboard');
}