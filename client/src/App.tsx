import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Eye,
  EyeOff,
  Globe2,
  Hand,
  HeartHandshake,
  KeyRound,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  MoreHorizontal,
  Phone,
  PhoneOff,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
  UserRound,
  Trash2,
  UsersRound,
  Video,
  Wifi,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

type Screen = "home" | "login" | "signup" | "account" | "call";
type ToastTone = "success" | "info" | "error";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Profile = { name: string; phone: string; email: string; city: string; state: string };
type IbgeState = { id: number; sigla: string; nome: string };
type IbgeCity = { id: number; nome: string };

const recentCalls = [
  { place: "UBS Vila Madalena", detail: "Atendimento em Libras", time: "Hoje, 10:42", initials: "UB" },
  { place: "Defensoria Pública", detail: "Orientação jurídica", time: "Ontem, 16:18", initials: "DP" },
];

function App() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountName, setAccountName] = useState("Camila");
  const [profile, setProfile] = useState<Profile>({ name: "Camila", phone: "", email: "", city: "", state: "" });
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [roomInput, setRoomInput] = useState("");
  const [roomCode, setRoomCode] = useState("SP-4821");
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", state: "", identity: "", password: "" });

  useEffect(() => {
    if (user?.name) {
      setAccountName(user.name.split(" ")[0]);
      setIsLoggedIn(true);
      setProfile((current) => ({ ...current, name: user.name ?? current.name, email: user.email ?? current.email }));
    }
  }, [user]);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((response) => response.json())
      .then((data: IbgeState[]) => setStates(data))
      .catch(() => showToast("Não foi possível carregar os estados do IBGE.", "error"));
  }, []);

  useEffect(() => {
    const uf = screen === "account" ? profile.state : form.state;
    if (!uf) { setCities([]); return; }
    setCitiesLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((response) => response.json())
      .then((data: IbgeCity[]) => setCities(data))
      .catch(() => showToast("Não foi possível carregar as cidades do IBGE.", "error"))
      .finally(() => setCitiesLoading(false));
  }, [screen, form.state, profile.state]);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const showToast = (message: string, tone: ToastTone = "info") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3600);
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.identity.trim() || !/^\d{8}$/.test(form.password)) {
      showToast("Informe seu email ou telefone e uma senha com exatamente 8 dígitos.", "error");
      return;
    }
    setAccountName(form.identity.includes("@") ? "Camila" : "Camila");
    setProfile((current) => ({ ...current, email: form.identity.includes("@") ? form.identity : current.email, phone: form.identity.includes("@") ? current.phone : form.identity }));
    setIsLoggedIn(true);
    setScreen("home");
    showToast("Conta conectada. Que bom ter você por aqui!", "success");
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.city || !form.state || !/^\d{8}$/.test(form.password)) {
      showToast("Preencha nome, telefone, email, cidade, estado e uma senha com exatamente 8 dígitos.", "error");
      return;
    }
    setAccountName(form.name.trim().split(" ")[0]);
    setProfile({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), city: form.city, state: form.state });
    setIsLoggedIn(true);
    setScreen("home");
    showToast("Conta criada com sucesso. Seu atendimento está mais perto.", "success");
  };

  const handleManusLogin = () => {
    try {
      startLogin();
    } catch {
      showToast("O login integrado ainda não está configurado neste ambiente.", "info");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Keep the prototype usable when no session exists.
    }
    setIsLoggedIn(false);
    setScreen("home");
    showToast("Você saiu da conta.", "info");
  };

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.phone.trim() || !profile.email.trim() || !profile.city || !profile.state) {
      showToast("Preencha todos os dados do perfil para salvar.", "error");
      return;
    }
    setAccountName(profile.name.trim().split(" ")[0]);
    setProfile((current) => ({ ...current, name: current.name.trim(), phone: current.phone.trim(), email: current.email.trim() }));
    showToast("Perfil atualizado com sucesso.", "success");
  };

  const handleDeleteAccount = () => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) return;
    setIsLoggedIn(false);
    setProfile({ name: "Camila", phone: "", email: "", city: "", state: "" });
    setAccountName("Camila");
    setScreen("home");
    showToast("Sua conta foi excluída.", "info");
  };

  const handleCreateCall = () => {
    if (!isLoggedIn) {
      openLogin();
      showToast("Entre ou crie sua conta para acessar os serviços.", "info");
      return;
    }
    setRoomCode("SP-4821");
    setScreen("call");
    showToast("Sala criada. O intérprete foi convidado.", "success");
  };

  const handleJoinCall = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!isLoggedIn) {
      openLogin();
      showToast("Entre ou crie sua conta para acessar os serviços.", "info");
      return;
    }
    const normalized = roomInput.trim().replace(/\s/g, "");
    if (normalized.length < 4) {
      showToast("Digite o código de acesso enviado pelo estabelecimento.", "error");
      return;
    }
    setRoomCode(normalized.toUpperCase().startsWith("SP-") ? normalized.toUpperCase() : `SP-${normalized.slice(-4)}`);
    setScreen("call");
    showToast("Entrando na sala com conexão segura.", "success");
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      showToast("No celular, use o menu do navegador e escolha 'Adicionar à tela inicial'.", "info");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") showToast("Sinal Público adicionado à sua tela inicial.", "success");
    setInstallPrompt(null);
  };

  const openLogin = () => {
    setAuthMode("email");
    setForm({ name: "", phone: "", email: "", city: "", state: "", identity: "", password: "" });
    setScreen("login");
  };

  const openSignup = () => {
    setForm({ name: "", phone: "", email: "", city: "", state: "", identity: "", password: "" });
    setScreen("signup");
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="app-shell">
            <div className="phone-frame">
              {screen === "home" && (
                <HomeScreen
                  accountName={accountName}
                  isLoggedIn={isLoggedIn}
                  installPrompt={Boolean(installPrompt)}
                  roomInput={roomInput}
                  setRoomInput={setRoomInput}
                  onCreateCall={handleCreateCall}
                  onJoinCall={handleJoinCall}
                  onLogin={openLogin}
                  onSignup={openSignup}
                  onInstall={handleInstall}
                  onOpenAccount={() => (isLoggedIn ? setScreen("account") : openLogin())}
                />
              )}
              {screen === "login" && (
                <AuthScreen
                  mode="login"
                  authMode={authMode}
                  showPassword={showPassword}
                  form={form}
                  states={states}
                  cities={cities}
                  citiesLoading={citiesLoading}
                  onBack={() => setScreen("home")}
                  onSubmit={handleLogin}
                  onModeChange={setAuthMode}
                  onTogglePassword={() => setShowPassword((value) => !value)}
                  onChange={updateForm}
                  onManusLogin={handleManusLogin}
                  onSwitch={() => setScreen("signup")}
                />
              )}
              {screen === "signup" && (
                <AuthScreen
                  mode="signup"
                  authMode={authMode}
                  showPassword={showPassword}
                  form={form}
                  states={states}
                  cities={cities}
                  citiesLoading={citiesLoading}
                  onBack={() => setScreen("home")}
                  onSubmit={handleSignup}
                  onModeChange={setAuthMode}
                  onTogglePassword={() => setShowPassword((value) => !value)}
                  onChange={updateForm}
                  onManusLogin={handleManusLogin}
                  onSwitch={() => setScreen("login")}
                />
              )}
              {screen === "account" && <AccountScreen profile={profile} states={states} cities={cities} citiesLoading={citiesLoading} onChange={(field, value) => setProfile((current) => ({ ...current, [field]: value, ...(field === "state" ? { city: "" } : {}) }))} onSave={handleProfileSave} onDelete={handleDeleteAccount} onLogout={handleLogout} onBack={() => setScreen("home")} />}
              {screen === "call" && (
                <CallScreen
                  roomCode={roomCode}
                  isMicOn={isMicOn}
                  isCameraOn={isCameraOn}
                  onToggleMic={() => setIsMicOn((value) => !value)}
                  onToggleCamera={() => setIsCameraOn((value) => !value)}
                  onEnd={() => {
                    setScreen("home");
                    showToast("Chamada encerrada. Até a próxima!", "info");
                  }}
                  onBack={() => setScreen("home")}
                />
              )}
              {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

type HomeScreenProps = {
  accountName: string;
  isLoggedIn: boolean;
  installPrompt: boolean;
  roomInput: string;
  setRoomInput: (value: string) => void;
  onCreateCall: () => void;
  onJoinCall: (event?: FormEvent<HTMLFormElement>) => void;
  onLogin: () => void;
  onSignup: () => void;
  onInstall: () => void;
  onOpenAccount: () => void;
};

function HomeScreen({
  accountName,
  isLoggedIn,
  installPrompt,
  roomInput,
  setRoomInput,
  onCreateCall,
  onJoinCall,
  onLogin,
  onSignup,
  onInstall,
  onOpenAccount,
}: HomeScreenProps) {
  return (
    <div className="screen-stack">
      <header className="topbar">
        <button className="brand-lockup" aria-label="Ir para o início" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brand-mark"><Hand size={20} strokeWidth={2.5} /></span>
          <span>
            <strong>Sinal Público</strong>
            <small>comunicação que inclui</small>
          </span>
        </button>
        <div className="topbar-actions">
          <button className="icon-button muted-icon" aria-label="Ajuda" onClick={() => undefined}><CircleHelp size={19} /></button>
          <button className="avatar-button" aria-label="Abrir conta" onClick={onOpenAccount}>{accountName.slice(0, 1).toUpperCase()}</button>
        </div>
      </header>

      <main className="content home-content">
        <section className="hero-card">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-copy">
            <div className="eyebrow light"><span className="live-dot" /> ATENDIMENTO EM LIBRAS</div>
            <h1>A comunicação<br /><em>começa aqui.</em></h1>
            <p>Conecte-se a um serviço público ou privado com um intérprete ao seu lado.</p>
          </div>
          <div className="hero-sign"><Hand size={42} strokeWidth={1.7} /><span>Olá, {accountName}</span></div>
          <div className="hero-actions">
            <button className="primary-button light-button" onClick={onCreateCall}><Video size={18} /> Criar nova chamada <ArrowRight size={17} /></button>
            <button className="text-button light-text" onClick={() => document.getElementById("join-call")?.scrollIntoView({ behavior: "smooth", block: "center" })}>Já tenho um código <ChevronRight size={16} /></button>
          </div>
        </section>

        <section className="trust-row" aria-label="Benefícios do serviço">
          <div><ShieldCheck size={18} /><span><strong>Protegido</strong><small>Conexão segura</small></span></div>
          <div><HeartHandshake size={18} /><span><strong>Com intérprete</strong><small>Atendimento humano</small></span></div>
          <div><Globe2 size={18} /><span><strong>Onde precisar</strong><small>Público e privado</small></span></div>
        </section>

        {!isLoggedIn && <section className="access-gate"><div className="gate-icon"><LockKeyhole size={19} /></div><div><span className="section-kicker">ACESSO AOS SERVIÇOS</span><h3>Entre para continuar</h3><p>Crie sua conta ou faça login para iniciar atendimentos e acessar chamadas com intérprete.</p></div><div className="gate-actions"><button className="outline-button" onClick={onLogin}><LogIn size={15} /> Entrar</button><button className="primary-button compact-button" onClick={onSignup}><UserPlus size={15} /> Criar conta</button></div></section>}

        <section className="section-heading"><div><span className="section-kicker">ACESSAR ATENDIMENTO</span><h2>Qual é o próximo passo?</h2></div><span className="step-count">01 <span>/ 02</span></span></section>

        <section className="action-card" id="join-call">
          <div className="card-icon teal-icon"><KeyRound size={20} /></div>
          <div className="card-copy"><h3>Entrar com código</h3><p>Recebeu um código do estabelecimento? Digite abaixo para entrar.</p></div>
          <form className="join-form" onSubmit={onJoinCall}>
            <input value={roomInput} onChange={(event) => setRoomInput(event.target.value)} placeholder="Ex.: 4821" aria-label="Código da sala" maxLength={8} />
            <button className="primary-button compact-button" type="submit">Entrar <ArrowRight size={16} /></button>
          </form>
        </section>

        <section className="interpreter-card">
          <div className="interpreter-avatar"><Hand size={22} /></div>
          <div className="card-copy"><div className="status-line"><span className="status-dot" /> Intérprete disponível</div><h3>Você não está sozinho</h3><p>Peça apoio em Libras para ser compreendido.</p></div>
          <button className="round-arrow" aria-label="Saiba mais" onClick={() => undefined}><ChevronRight size={18} /></button>
        </section>

        <section className="section-heading history-heading"><div><span className="section-kicker">SEU HISTÓRICO</span><h2>Chamadas recentes</h2></div><button className="link-button" onClick={() => undefined}>Ver tudo <ArrowRight size={14} /></button></section>
        <section className="recent-list">
          {recentCalls.map((call) => <div className="recent-item" key={call.place}><span className="place-avatar">{call.initials}</span><div><strong>{call.place}</strong><span>{call.detail}</span></div><div className="recent-time"><Clock3 size={13} /> {call.time}</div><ChevronRight className="recent-chevron" size={17} /></div>)}
        </section>

        <section className="install-card">
          <div className="install-icon"><Smartphone size={22} /></div>
          <div className="card-copy"><span className="section-kicker">SEMPRE À MÃO</span><h3>Instale o Sinal Público</h3><p>Abra mais rápido, mesmo quando estiver sem sinal forte.</p></div>
          <button className="install-button" onClick={onInstall}>{installPrompt ? <Download size={17} /> : <Plus size={17} />} {installPrompt ? "Instalar" : "Como instalar"}</button>
        </section>

        {!isLoggedIn && <section className="account-prompt"><div><span className="section-kicker">TENHA MAIS CONTROLE</span><h3>Crie sua conta gratuita</h3><p>Salve seus atendimentos e encontre tudo com facilidade.</p></div><div className="account-actions"><button className="outline-button" onClick={onLogin}><LogIn size={16} /> Entrar</button><button className="primary-button compact-button" onClick={onSignup}><UserPlus size={16} /> Criar conta</button></div></section>}
      </main>

      <BottomNav active="home" onAccount={onOpenAccount} onCall={onCreateCall} />
    </div>
  );
}

type AuthScreenProps = {
  mode: "login" | "signup";
  authMode: "email" | "phone";
  showPassword: boolean;
  form: { name: string; phone: string; email: string; city: string; state: string; identity: string; password: string };
  states: IbgeState[];
  cities: IbgeCity[];
  citiesLoading: boolean;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onModeChange: (mode: "email" | "phone") => void;
  onTogglePassword: () => void;
  onChange: (field: "name" | "phone" | "email" | "city" | "state" | "identity" | "password", value: string) => void;
  onManusLogin: () => void;
  onSwitch: () => void;
};

function AuthScreen({ mode, authMode, showPassword, form, states, cities, citiesLoading, onBack, onSubmit, onModeChange, onTogglePassword, onChange, onManusLogin, onSwitch }: AuthScreenProps) {
  const isSignup = mode === "signup";
  return (
    <div className="screen-stack auth-screen">
      <header className="topbar auth-topbar"><button className="back-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><span className="auth-step">{isSignup ? "CRIAR CONTA" : "ENTRAR"}</span><button className="icon-button muted-icon" onClick={() => undefined} aria-label="Ajuda"><CircleHelp size={19} /></button></header>
      <main className="content auth-content">
        <div className="auth-brand"><span className="brand-mark large-mark"><Hand size={25} /></span><span className="section-kicker">SINAL PÚBLICO</span></div>
        <div className="auth-heading"><span className="eyebrow"><span className="live-dot" /> ACESSO SEGURO</span><h1>{isSignup ? <>Faça parte de uma<br /><em>comunicação inclusiva.</em></> : <>Que bom ter<br /><em>você de volta.</em></>}</h1><p>{isSignup ? "Crie sua conta para encontrar atendimentos e intérpretes com mais facilidade." : "Entre para acompanhar suas chamadas e pedir apoio quando precisar."}</p></div>
        <button className="oauth-button" onClick={onManusLogin}><span className="oauth-symbol">M</span> Entrar com conta Manus <ArrowRight size={16} /></button>
        <div className="divider"><span>ou continue com seus dados</span></div>
        {!isSignup && <div className="segmented-control"><button className={authMode === "email" ? "selected" : ""} onClick={() => onModeChange("email")} type="button">Email</button><button className={authMode === "phone" ? "selected" : ""} onClick={() => onModeChange("phone")} type="button">Telefone</button></div>}
        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup && <label>Nome completo<input value={form.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" /></label>}
          {isSignup && <label>Telefone<input value={form.phone} onChange={(event) => onChange("phone", event.target.value)} placeholder="(11) 99999-0000" autoComplete="tel" /></label>}
          {isSignup && <label>Email<input value={form.email} onChange={(event) => onChange("email", event.target.value)} placeholder="voce@email.com" type="email" autoComplete="email" /></label>}
          {isSignup && <label>Estado<select value={form.state} onChange={(event) => onChange("state", event.target.value)}><option value="">Selecione seu estado</option>{states.map((state) => <option key={state.id} value={state.sigla}>{state.nome} ({state.sigla})</option>)}</select></label>}
          {isSignup && <label>Cidade<select value={form.city} onChange={(event) => onChange("city", event.target.value)} disabled={!form.state || citiesLoading}><option value="">{citiesLoading ? "Carregando cidades..." : "Selecione sua cidade"}</option>{cities.map((city) => <option key={city.id} value={city.nome}>{city.nome}</option>)}</select></label>}
          {!isSignup && <label>{authMode === "email" ? "Email" : "Telefone"}<input value={form.identity} onChange={(event) => onChange("identity", event.target.value)} placeholder={authMode === "email" ? "voce@email.com" : "(11) 99999-0000"} type={authMode === "email" ? "email" : "tel"} autoComplete={authMode === "email" ? "email" : "tel"} /></label>}
          <label>Senha de 8 dígitos<div className="password-field"><input value={form.password} onChange={(event) => onChange("password", event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Digite 8 números" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} /><button type="button" onClick={onTogglePassword} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {isSignup && <label className="consent-row"><span className="fake-checkbox"><Check size={12} /></span><span>Concordo com os termos de uso e a política de privacidade.</span></label>}
          <button className="primary-button submit-button" type="submit">{isSignup ? "Criar minha conta" : "Entrar na conta"} <ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{isSignup ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <button onClick={onSwitch}>{isSignup ? "Entrar" : "Criar conta"}</button></p>
        <p className="prototype-note"><LockKeyhole size={13} /> Demonstração de interface. A autenticação real usa a conta Manus.</p>
      </main>
    </div>
  );
}

type AccountScreenProps = {
  profile: Profile;
  states: IbgeState[];
  cities: IbgeCity[];
  citiesLoading: boolean;
  onChange: (field: keyof Profile, value: string) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onLogout: () => void;
  onBack: () => void;
};

function AccountScreen({ profile, states, cities, citiesLoading, onChange, onSave, onDelete, onLogout, onBack }: AccountScreenProps) {
  return <div className="screen-stack auth-screen">
    <header className="topbar auth-topbar"><button className="back-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><span className="auth-step">MINHA CONTA</span><button className="icon-button muted-icon" aria-label="Ajuda"><CircleHelp size={19} /></button></header>
    <main className="content auth-content">
      <div className="auth-brand"><span className="brand-mark large-mark"><UserRound size={25} /></span><span className="section-kicker">PERFIL DO USUÁRIO</span></div>
      <div className="auth-heading"><span className="eyebrow"><span className="live-dot" /> DADOS DA CONTA</span><h1>Seu perfil,<br /><em>do seu jeito.</em></h1><p>Altere seus dados de contato e localização quando precisar.</p></div>
      <form className="auth-form" onSubmit={onSave}>
        <label>Nome completo<input value={profile.name} onChange={(event) => onChange("name", event.target.value)} autoComplete="name" /></label>
        <label>Telefone<input value={profile.phone} onChange={(event) => onChange("phone", event.target.value)} autoComplete="tel" /></label>
        <label>Email<input value={profile.email} onChange={(event) => onChange("email", event.target.value)} type="email" autoComplete="email" /></label>
        <label>Estado<select value={profile.state} onChange={(event) => onChange("state", event.target.value)}><option value="">Selecione seu estado</option>{states.map((state) => <option key={state.id} value={state.sigla}>{state.nome} ({state.sigla})</option>)}</select></label>
        <label>Cidade<select value={profile.city} onChange={(event) => onChange("city", event.target.value)} disabled={!profile.state || citiesLoading}><option value="">{citiesLoading ? "Carregando cidades..." : "Selecione sua cidade"}</option>{cities.map((city) => <option key={city.id} value={city.nome}>{city.nome}</option>)}</select></label>
        <button className="primary-button submit-button" type="submit"><Save size={17} /> Salvar alterações</button>
      </form>
      <div className="account-management"><button className="outline-button" onClick={onLogout}><LogOut size={15} /> Sair da conta</button><button className="delete-button" onClick={onDelete}><Trash2 size={15} /> Excluir conta</button></div>
      <p className="prototype-note"><MapPin size={13} /> Estados e cidades carregados pela API oficial do IBGE.</p>
    </main>
  </div>;
}

type CallScreenProps = { roomCode: string; isMicOn: boolean; isCameraOn: boolean; onToggleMic: () => void; onToggleCamera: () => void; onEnd: () => void; onBack: () => void };

function CallScreen({ roomCode, isMicOn, isCameraOn, onToggleMic, onToggleCamera, onEnd, onBack }: CallScreenProps) {
  return (
    <div className="screen-stack call-screen">
      <header className="call-topbar"><button className="back-button light-back" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><div className="call-room-label"><span className="live-dot" /> AO VIVO <strong>{roomCode}</strong></div><button className="icon-button call-more" aria-label="Mais opções"><MoreHorizontal size={20} /></button></header>
      <main className="call-content">
        <section className="video-stage">
          <div className="video-badge protected-badge"><ShieldCheck size={14} /> Protegida</div>
          <div className="remote-video-panel"><div className="video-grid-glow" /><div className="remote-person"><div className="person-halo"><UsersRound size={42} /></div><strong>Central de Atendimento</strong><span>UBS Vila Madalena</span></div><div className="remote-label"><span className="status-dot" /> Vídeo do atendimento</div></div>
          <div className="interpreter-video-panel"><div className="interpreter-pattern" /><div className="interpreter-person"><Hand size={24} /><strong>Rafaela</strong><span>Intérprete de Libras</span></div><span className="interpreter-live"><span className="status-dot" /> intérprete</span></div>
          <div className={`local-video-panel ${!isCameraOn ? "camera-off" : ""}`}><div className="local-face">{isCameraOn ? accountInitial("C") : <CameraOff size={21} />}</div><span>Você</span></div>
        </section>
        <section className="call-status-card"><div className="call-status-main"><div className="status-icon"><Activity size={19} /></div><div><strong>Conexão excelente</strong><span><Wifi size={13} /> Vídeo em alta qualidade</span></div></div><div className="call-time"><Clock3 size={14} /> 04:32</div></section>
        <section className="call-message"><MessageCircle size={17} /><span>O intérprete está acompanhando esta conversa.</span><button aria-label="Fechar aviso"><X size={15} /></button></section>
      </main>
      <div className="call-controls-wrap"><div className="call-controls"><CallControl icon={isMicOn ? <Mic size={21} /> : <MicOff size={21} />} label={isMicOn ? "Mutar" : "Ativar"} active={isMicOn} onClick={onToggleMic} /><CallControl icon={isCameraOn ? <Camera size={21} /> : <CameraOff size={21} />} label={isCameraOn ? "Câmera" : "Sem vídeo"} active={isCameraOn} onClick={onToggleCamera} /><CallControl icon={<MessageCircle size={21} />} label="Mensagem" onClick={() => undefined} /><CallControl icon={<CircleHelp size={21} />} label="Ajuda" onClick={() => undefined} /></div><button className="end-call-button" onClick={onEnd}><PhoneOff size={19} /> Encerrar chamada</button></div>
    </div>
  );
}

function accountInitial(value: string) {
  return <span>{value}</span>;
}

function CallControl({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button className={`call-control ${active ? "control-active" : ""}`} onClick={onClick}><span>{icon}</span><small>{label}</small></button>;
}

function BottomNav({ active, onAccount, onCall }: { active: "home"; onAccount: () => void; onCall: () => void }) {
  return <nav className="bottom-nav" aria-label="Navegação principal"><button className={active === "home" ? "nav-active" : ""}><span><Sparkles size={19} /></span><small>Início</small></button><button onClick={onCall}><span><Video size={19} /></span><small>Chamadas</small></button><button onClick={onAccount}><span><UserRound size={19} /></span><small>Conta</small></button></nav>;
}

function Toast({ message, tone, onClose }: { message: string; tone: ToastTone; onClose: () => void }) {
  return <div className={`toast toast-${tone}`} role="status"><span className="toast-icon">{tone === "success" ? <CheckCircle2 size={17} /> : tone === "error" ? <X size={17} /> : <Activity size={17} />}</span><span>{message}</span><button onClick={onClose} aria-label="Fechar notificação"><X size={14} /></button></div>;
}

export default App;
