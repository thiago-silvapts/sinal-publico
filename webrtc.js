// Sinal Público v12 - Módulo WebRTC P2P e Sinalização Firebase
(function() {
  const firebaseConfig = {
    databaseURL: "https://sinal-publico-default-rtdb.firebaseio.com"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

  let localStream = null;
  let peerConnection = null;
  let currentFacingMode = 'user';
  let isAudioMuted = false;
  let isVideoDisabled = false;
  let roomRef = null;

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  function getAdaptiveVideoConstraints() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    const effectiveType = connection.effectiveType || '4g';
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

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
      roomRef = database.ref(`rooms/${roomCode}`);

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

      // Gerenciamento de ICE Candidates
      const candidatesRef = isHost ? roomRef.child('hostCandidates') : roomRef.child('guestCandidates');
      const remoteCandidatesRef = isHost ? roomRef.child('guestCandidates') : roomRef.child('hostCandidates');

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          candidatesRef.push(event.candidate.toJSON());
        }
      };

      remoteCandidatesRef.on('child_added', (snapshot) => {
        const candidate = new RTCIceCandidate(snapshot.val());
        peerConnection.addIceCandidate(candidate);
      });

      if (isHost) {
        // Criar Oferta
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await roomRef.child('offer').set({
          type: offer.type,
          sdp: offer.sdp
        });

        // Ouvir Resposta do Convidado
        roomRef.child('answer').on('value', async (snapshot) => {
          const answer = snapshot.val();
          if (answer && !peerConnection.currentRemoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });
      } else {
        // Obter Oferta do Host e Enviar Resposta
        roomRef.child('offer').once('value', async (snapshot) => {
          const offer = snapshot.val();
          if (offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await roomRef.child('answer').set({
              type: answer.type,
              sdp: answer.sdp
            });
          }
        });
      }

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
    if (roomRef) {
      roomRef.off();
      roomRef.remove();
      roomRef = null;
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