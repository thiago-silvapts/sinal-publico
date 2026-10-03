// Sinal Público v12 - Módulo WebRTC P2P e Adaptação de Mídia
(function() {
  const firebaseConfig = {
    databaseURL: "https://sinal-publico-default-rtdb.firebaseio.com" // Servidor público de teste/sinalização
  };

  let localStream = null;
  let peerConnection = null;
  let currentFacingMode = 'user';
  let isAudioMuted = false;
  let isVideoDisabled = false;

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Cálculo de Qualidade com base na Conexão e Dispositivo
  function getAdaptiveVideoConstraints() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    const effectiveType = connection.effectiveType || '4g';
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    console.log(`Detectado: Conexão ${effectiveType}, Cores CPU: ${hardwareConcurrency}`);

    let width = { ideal: 1280 };
    let height = { ideal: 720 };
    let frameRate = { ideal: 30 };

    if (effectiveType === '2g' || effectiveType === 'slow-2g' || hardwareConcurrency < 2) {
      width = { ideal: 480 };
      height = { ideal: 360 };
      frameRate = { ideal: 15 };
    } else if (effectiveType === '3g' || hardwareConcurrency < 4) {
      width = { ideal: 640 };
      height = { ideal: 480 };
      frameRate = { ideal: 24 };
    }

    // Atualiza o indicador de métricas na tela
    const metricsEl = document.getElementById('network-metrics');
    if (metricsEl) {
      metricsEl.innerText = `● ${effectiveType.toUpperCase()} | ${frameRate.ideal} FPS | ${height.ideal}p`;
    }

    return {
      width,
      height,
      frameRate,
      facingMode: currentFacingMode
    };
  }

  async function initCall(roomCode, isHost) {
    try {
      const constraints = {
        video: getAdaptiveVideoConstraints(),
        audio: true
      };

      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById('local-video').srcObject = localStream;

      peerConnection = new RTCPeerConnection(rtcConfig);

      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
        }
      };

      console.log(`Atendimento iniciado na sala ${roomCode}. Host: ${isHost}`);
    } catch (err) {
      console.error("Erro ao inicializar mídia/WebRTC:", err);
      alert("Falha ao acessar câmera/microfone ou rede. Verifique as permissões do seu navegador.");
    }
  }

  function toggleAudio() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        isAudioMuted = !isAudioMuted;
        audioTrack.enabled = !isAudioMuted;
        return isAudioMuted;
      }
    }
    return false;
  }

  function toggleVideo() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        isVideoDisabled = !isVideoDisabled;
        videoTrack.enabled = !isVideoDisabled;
        return isVideoDisabled;
      }
    }
    return false;
  }

  async function switchCamera() {
    if (!localStream) return;
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    
    localStream.getTracks().forEach(track => track.stop());

    const constraints = {
      video: getAdaptiveVideoConstraints(),
      audio: true
    };

    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('local-video').srcObject = localStream;

    if (peerConnection) {
      const videoSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(localStream.getVideoTracks()[0]);
      }
    }
  }

  function endCall() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    document.getElementById('local-video').srcObject = null;
    document.getElementById('remote-video').srcObject = null;
  }

  window.WebRTCManager = {
    initCall,
    toggleAudio,
    toggleVideo,
    switchCamera,
    endCall
  };
})();
