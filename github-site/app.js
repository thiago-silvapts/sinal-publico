const state = {
  screen: 'home',
  name: 'Camila',
  signedIn: false,
  mic: true,
  camera: true,
  room: 'SP-4821',
  toast: null,
};

const app = document.querySelector('#app');

function icon(symbol) { return `<span class="icon" aria-hidden="true">${symbol}</span>`; }
function toast(message, tone = 'info') {
  state.toast = { message, tone };
  render();
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => { state.toast = null; render(); }, 3600);
}
function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function go(screen) { state.screen = screen; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function header() {
  return `<header class="topbar"><button class="brand" data-action="home"><span class="brand-mark">✋</span><span><b>Sinal Público</b><small>comunicação que inclui</small></span></button><div class="top-actions"><button class="help" aria-label="Ajuda">?</button><button class="avatar" data-action="account">${state.name.slice(0, 1)}</button></div></header>`;
}
function nav() {
  return `<nav class="bottom-nav"><button class="active" data-action="home"><b>✦</b><small>Início</small></button><button data-action="call"><b>▣</b><small>Chamadas</small></button><button data-action="account"><b>♙</b><small>Conta</small></button></nav>`;
}
function home() {
  return `<div class="screen">${header()}<main class="content">
    <section class="hero"><span class="eyebrow">● ATENDIMENTO EM LIBRAS</span><h1>A comunicação<br><em>começa aqui.</em></h1><p>Conecte-se a um serviço público ou privado com um intérprete ao seu lado.</p><span class="hello">✋<small>Olá, ${esc(state.name)}</small></span><button class="primary light" data-action="create-call">▣ Criar nova chamada　→</button><button class="text light-text" data-action="join-focus">Já tenho um código　›</button></section>
    <section class="trust"><div>♢ <b>Protegido<small>Conexão segura</small></b></div><div>♡ <b>Com intérprete<small>Atendimento humano</small></b></div><div>◎ <b>Onde precisar<small>Público e privado</small></b></div></section>
    <div class="section-title"><div><span>ACESSAR ATENDIMENTO</span><h2>Qual é o próximo passo?</h2></div><b>01 <i>/ 02</i></b></div>
    <section class="card join" id="join-card"><div class="card-icon">⌕</div><div><h3>Entrar com código</h3><p>Recebeu um código do estabelecimento? Digite abaixo para entrar.</p></div><form data-form="join"><input name="room" placeholder="Ex.: 4821" maxlength="8" aria-label="Código da sala"><button class="primary" type="submit">Entrar　→</button></form></section>
    <section class="card interpreter"><div class="interpreter-icon">✋</div><div><span class="online">● Intérprete disponível</span><h3>Você não está sozinho</h3><p>Peça apoio em Libras para ser compreendido.</p></div><button class="round">›</button></section>
    <div class="section-title history"><div><span>SEU HISTÓRICO</span><h2>Chamadas recentes</h2></div><button class="link">Ver tudo　→</button></div>
    <section class="recent"><div><b>UB</b><span><strong>UBS Vila Madalena</strong><small>Atendimento em Libras</small></span><time>Hoje, 10:42　›</time></div><div><b>DP</b><span><strong>Defensoria Pública</strong><small>Orientação jurídica</small></span><time>Ontem, 16:18　›</time></div></section>
    <section class="install"><b>▣</b><div><span>SEMPRE À MÃO</span><h3>Instale o Sinal Público</h3><p>Abra mais rápido, mesmo quando estiver sem sinal forte.</p></div><button data-action="install">Instalar</button></section>
    ${!state.signedIn ? `<section class="account-card"><div><span>TENHA MAIS CONTROLE</span><h3>Crie sua conta gratuita</h3><p>Salve seus atendimentos e encontre tudo com facilidade.</p></div><div><button class="outline" data-action="login">Entrar</button><button class="primary compact" data-action="signup">Criar conta</button></div></section>` : ''}
  </main>${nav()}</div>`;
}
function auth(mode) {
  const signup = mode === 'signup';
  return `<div class="screen auth-screen"><header class="topbar"><button class="back" data-action="home">←</button><span class="auth-step">${signup ? 'CRIAR CONTA' : 'ENTRAR'}</span><button class="help">?</button></header><main class="content auth-content"><div class="auth-mark">✋ <span>SINAL PÚBLICO</span></div><div class="auth-title"><span class="eyebrow">● ACESSO SEGURO</span><h1>${signup ? 'Faça parte de uma<br><em>comunicação inclusiva.</em>' : 'Que bom ter<br><em>você de volta.</em>'}</h1><p>${signup ? 'Crie sua conta para encontrar atendimentos e intérpretes com mais facilidade.' : 'Entre para acompanhar suas chamadas e pedir apoio quando precisar.'}</p></div><button class="oauth" data-action="oauth"><b>M</b> Entrar com conta Manus　→</button><div class="divider">ou continue com seus dados</div><form class="auth-form" data-form="${signup ? 'signup' : 'login'}">${signup ? '<label>Nome completo<input name="name" placeholder="Como podemos chamar você?" required></label><label>Telefone<input name="phone" placeholder="(11) 99999-0000" required></label><label>Email<input name="email" type="email" placeholder="voce@email.com" required></label>' : '<label>Email ou telefone<input name="identity" placeholder="voce@email.com" required></label>'}<label>Senha<input name="password" type="password" minlength="6" placeholder="Mínimo de 6 caracteres" required></label>${signup ? '<label class="consent"><input type="checkbox" required checked> Concordo com os termos de uso e a política de privacidade.</label>' : ''}<button class="primary submit" type="submit">${signup ? 'Criar minha conta' : 'Entrar na conta'}　→</button></form><p class="switch">${signup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button data-action="${signup ? 'login' : 'signup'}">${signup ? 'Entrar' : 'Criar conta'}</button></p><p class="note">▣ Demonstração de interface. A autenticação real usa a conta Manus.</p></main></div>`;
}
function call() {
  return `<div class="screen call-screen"><header class="call-top"><button class="back dark" data-action="home">←</button><span>● AO VIVO　<b>${state.room}</b></span><button class="more">•••</button></header><main class="call-content"><section class="stage"><span class="protected">♢ Protegida</span><div class="remote"><div class="person">♧<b>Central de Atendimento</b><small>UBS Vila Madalena</small></div><label>● Vídeo do atendimento</label></div><div class="interpreter-video"><span>● intérprete</span><b>✋</b><strong>Rafaela</strong><small>Intérprete de Libras</small></div><div class="local ${state.camera ? '' : 'off'}"><b>${state.camera ? 'C' : '◌'}</b><small>Você</small></div></section><section class="call-status"><b>⌁</b><span><strong>Conexão excelente</strong><small>⌁ Vídeo em alta qualidade</small></span><time>◷ 04:32</time></section><div class="call-message">◌ O intérprete está acompanhando esta conversa.</div></main><div class="controls"><div><button data-action="toggle-mic" class="${state.mic ? 'on' : ''}">${state.mic ? '♩' : '×'}<small>${state.mic ? 'Mutar' : 'Ativar'}</small></button><button data-action="toggle-camera" class="${state.camera ? 'on' : ''}">${state.camera ? '▣' : '×'}<small>${state.camera ? 'Câmera' : 'Sem vídeo'}</small></button><button>◌<small>Mensagem</small></button><button>?</button><small>Ajuda</small></div><button class="end" data-action="end-call">× Encerrar chamada</button></div></div>`;
}
function render() {
  app.innerHTML = state.screen === 'home' ? home() : state.screen === 'call' ? call() : auth(state.screen);
  if (state.toast) app.insertAdjacentHTML('beforeend', `<div class="toast ${state.toast.tone}">${esc(state.toast.message)} <button data-action="close-toast">×</button></div>`);
  bind();
}
function bind() {
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'home') go('home');
    if (action === 'login' || action === 'signup') go(action);
    if (action === 'account') state.signedIn ? toast('Sua conta está ativa neste dispositivo.') : go('login');
    if (action === 'call' || action === 'create-call') { state.room = 'SP-4821'; go('call'); toast('Sala criada. O intérprete foi convidado.', 'success'); }
    if (action === 'toggle-mic') { state.mic = !state.mic; render(); }
    if (action === 'toggle-camera') { state.camera = !state.camera; render(); }
    if (action === 'end-call') { go('home'); toast('Chamada encerrada. Até a próxima!'); }
    if (action === 'join-focus') document.querySelector('#join-card input')?.focus();
    if (action === 'install') toast("No celular, use o menu do navegador e escolha 'Adicionar à tela inicial'.");
    if (action === 'oauth') toast('O login Manus será conectado na versão com backend.');
    if (action === 'close-toast') { state.toast = null; render(); }
  }));
  document.querySelectorAll('[data-form]').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (form.dataset.form === 'join') {
      if (!data.room || String(data.room).trim().length < 4) return toast('Digite o código de acesso enviado pelo estabelecimento.', 'error');
      state.room = `SP-${String(data.room).replace(/\D/g, '').slice(-4) || '4821'}`; go('call'); return;
    }
    if (form.dataset.form === 'signup') state.name = String(data.name).trim().split(' ')[0] || 'Camila';
    state.signedIn = true; go('home'); toast(form.dataset.form === 'signup' ? 'Conta criada com sucesso.' : 'Conta conectada.', 'success');
  }));
}

render();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => undefined));
