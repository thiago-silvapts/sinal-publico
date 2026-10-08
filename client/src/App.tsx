import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
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
import { trpc } from "./lib/trpc";

type Screen = "home" | "login" | "signup" | "account" | "admin" | "schedule" | "call";
type ToastTone = "success" | "info" | "error";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Gender = "female" | "male" | "non_binary" | "prefer_not_to_say" | "other";
type AppRole = "deaf_person" | "interpreter" | "establishment";
type Profile = { name: string; phone: string; email: string; city: string; state: string; gender: Gender; appRole: AppRole };
type IbgeState = { id: number; sigla: string; nome: string };
type IbgeCity = { id: number; nome: string };
type ServiceLocation = { id: number; name: string; city: string; phone: string; email: string; status: "active" | "inactive" };
type Appointment = { id: number; title: string; date: string; time: string; location: string; status: "scheduled" | "cancelled" | "completed" };
type AdminAccess = { id: number; email: string; active: number };

const recentCalls = [
  { place: "UBS Vila Madalena", detail: "Atendimento em Libras", time: "Hoje, 10:42", initials: "UB" },
  { place: "Defensoria Pública", detail: "Orientação jurídica", time: "Ontem, 16:18", initials: "DP" },
];

function App() {
  const { user, logout } = useAuth();
  const profileUpdate = trpc.auth.profile.update.useMutation();
  const profileRemove = trpc.auth.profile.remove.useMutation();
  const profileQuery = trpc.auth.profile.me.useQuery(undefined, { enabled: Boolean(user) });
  const locationsQuery = trpc.admin.locations.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const locationCreate = trpc.admin.locations.create.useMutation({ onSuccess: () => locationsQuery.refetch() });
  const locationUpdate = trpc.admin.locations.update.useMutation({ onSuccess: () => locationsQuery.refetch() });
  const locationRemove = trpc.admin.locations.remove.useMutation({ onSuccess: () => locationsQuery.refetch() });
  const appointmentsQuery = trpc.appointments.list.useQuery(undefined, { enabled: Boolean(user) });
  const appointmentCreate = trpc.appointments.create.useMutation({ onSuccess: () => appointmentsQuery.refetch() });
  const appointmentRemove = trpc.appointments.remove.useMutation({ onSuccess: () => appointmentsQuery.refetch() });
  const adminAccessQuery = trpc.admin.access.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const adminAccessCreate = trpc.admin.access.create.useMutation({ onSuccess: () => adminAccessQuery.refetch() });
  const adminAccessRemove = trpc.admin.access.remove.useMutation({ onSuccess: () => adminAccessQuery.refetch() });
  const [screen, setScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountName, setAccountName] = useState("Camila");
  const [profile, setProfile] = useState<Profile>({ name: "Camila", phone: "", email: "", city: "", state: "", gender: "prefer_not_to_say", appRole: "deaf_person" });
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
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", state: "", gender: "" as Gender | "", appRole: "deaf_person" as AppRole, identity: "", password: "" });
  const [locationForm, setLocationForm] = useState({ name: "", city: "", phone: "", email: "" });
  const [appointmentForm, setAppointmentForm] = useState({ title: "", date: "", time: "", location: "" });
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    if (user?.name) {
      setAccountName(user.name.split(" ")[0]);
      setIsLoggedIn(true);
      setScreen("home");
      setProfile((current) => ({ ...current, name: user.name ?? current.name, email: user.email ?? current.email }));
    }
    if (!user && !isLoggedIn && screen !== "login" && screen !== "signup") setScreen("login");
  }, [user]);

  useEffect(() => {
    const savedProfile = profileQuery.data;
    if (!savedProfile) return;
    setProfile((current) => ({ ...current, name: savedProfile.name ?? current.name, email: savedProfile.email ?? current.email, phone: savedProfile.phone ?? current.phone, city: savedProfile.city ?? current.city, state: savedProfile.state ?? current.state, gender: savedProfile.gender ?? current.gender, appRole: savedProfile.appRole ?? current.appRole }));
  }, [profileQuery.data]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("IBGE states request failed"); return response.json(); })
      .then((data: IbgeState[]) => setStates(data))
      .catch((error) => { if (error.name !== "AbortError") showToast("Não foi possível carregar os estados do IBGE.", "error"); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const uf = screen === "account" ? profile.state : form.state;
    if (!uf) { setCities([]); return; }
    const controller = new AbortController();
    setCitiesLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("IBGE cities request failed"); return response.json(); })
      .then((data: IbgeCity[]) => setCities(data))
      .catch((error) => { if (error.name !== "AbortError") showToast("Não foi possível carregar as cidades do IBGE.", "error"); })
      .finally(() => { if (!controller.signal.aborted) setCitiesLoading(false); });
    return () => controller.abort();
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
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.city || !form.state || !form.gender || !/^\d{8}$/.test(form.password)) {
      showToast("Preencha nome, telefone, email, gênero, cidade, estado e uma senha com exatamente 8 dígitos.", "error");
      return;
    }
    setAccountName(form.name.trim().split(" ")[0]);
    setProfile({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), city: form.city, state: form.state, gender: form.gender, appRole: form.appRole });
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
    setScreen("login");
    showToast("Você saiu da conta.", "info");
  };

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.phone.trim() || !profile.email.trim() || !profile.city || !profile.state || !profile.gender) {
      showToast("Preencha todos os dados do perfil para salvar.", "error");
      return;
    }
    setAccountName(profile.name.trim().split(" ")[0]);
    setProfile((current) => ({ ...current, name: current.name.trim(), phone: current.phone.trim(), email: current.email.trim() }));
    if (user) {
      profileUpdate.mutate({ ...profile, name: profile.name.trim(), phone: profile.phone.trim(), email: profile.email.trim() }, {
        onSuccess: () => showToast("Perfil salvo no banco de dados.", "success"),
        onError: () => showToast("Não foi possível salvar no servidor. Tente novamente.", "error"),
      });
      return;
    }
    showToast("Perfil atualizado com sucesso.", "success");
  };

  const handleDeleteAccount = () => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) return;
    const finish = () => {
      setIsLoggedIn(false);
      setProfile({ name: "Camila", phone: "", email: "", city: "", state: "", gender: "prefer_not_to_say", appRole: "deaf_person" });
      setAccountName("Camila");
      setScreen("login");
      showToast("Sua conta foi excluída.", "info");
    };
    if (user) {
      profileRemove.mutate(undefined, { onSuccess: finish, onError: () => showToast("Não foi possível excluir a conta no servidor.", "error") });
      return;
    }
    finish();
  };

  const handleCreateLocation = () => {
    if (!locationForm.name.trim() || !locationForm.city.trim() || !locationForm.phone.trim() || !locationForm.email.trim()) {
      showToast("Preencha nome, cidade, telefone e email do local.", "error");
      return;
    }
    locationCreate.mutate(locationForm, { onSuccess: () => { setLocationForm({ name: "", city: "", phone: "", email: "" }); showToast("Local de atendimento cadastrado.", "success"); }, onError: () => showToast("Não foi possível cadastrar o local.", "error") });
  };

  const handleCreateAppointment = () => {
    if (!user) {
      showToast("Entre com sua conta Manus para salvar agendamentos.", "info");
      return;
    }
    if (!appointmentForm.title.trim() || !appointmentForm.date || !appointmentForm.time || !appointmentForm.location.trim()) {
      showToast("Preencha evento, data, horário e local.", "error");
      return;
    }
    appointmentCreate.mutate(appointmentForm, { onSuccess: () => { setAppointmentForm({ title: "", date: "", time: "", location: "" }); showToast("Agendamento criado.", "success"); }, onError: () => showToast("Não foi possível criar o agendamento.", "error") });
  };

  const handleCreateAdminAccess = () => {
    if (!adminEmail.trim()) { showToast("Informe o email do novo administrador.", "error"); return; }
    adminAccessCreate.mutate({ email: adminEmail.trim().toLowerCase() }, { onSuccess: () => { setAdminEmail(""); showToast("Acesso administrativo criado. A pessoa deve entrar com essa conta Manus.", "success"); }, onError: (error) => showToast(error.message.includes("LIMIT") ? "As duas vagas administrativas já estão preenchidas." : "Não foi possível criar este acesso.", "error") });
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
    setForm({ name: "", phone: "", email: "", city: "", state: "", gender: "", appRole: "deaf_person", identity: "", password: "" });
    setScreen("login");
  };

  const openSignup = () => {
    setForm({ name: "", phone: "", email: "", city: "", state: "", gender: "", appRole: "deaf_person", identity: "", password: "" });
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
                  onSchedule={() => (isLoggedIn ? setScreen("schedule") : openLogin())}
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
                  onBack={() => setScreen("login")}
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
                  onBack={() => setScreen("login")}
                  onSubmit={handleSignup}
                  onModeChange={setAuthMode}
                  onTogglePassword={() => setShowPassword((value) => !value)}
                  onChange={updateForm}
                  onManusLogin={handleManusLogin}
                  onSwitch={() => setScreen("login")}
                />
              )}
              {screen === "account" && <AccountScreen profile={profile} states={states} cities={cities} citiesLoading={citiesLoading} isAdmin={user?.role === "admin"} onAdmin={() => setScreen("admin")} onChange={(field, value) => setProfile((current) => ({ ...current, [field]: value, ...(field === "state" ? { city: "" } : {}) }))} onSave={handleProfileSave} onDelete={handleDeleteAccount} onLogout={handleLogout} onBack={() => setScreen("home")} />}
              {screen === "admin" && <AdminScreen access={(adminAccessQuery.data ?? []) as AdminAccess[]} adminEmail={adminEmail} locations={(locationsQuery.data ?? []) as ServiceLocation[]} form={locationForm} loading={locationsQuery.isLoading || locationCreate.isPending} accessLoading={adminAccessCreate.isPending} onAdminEmailChange={setAdminEmail} onCreateAccess={handleCreateAdminAccess} onRemoveAccess={(id) => { if (window.confirm("Remover este acesso administrativo?")) adminAccessRemove.mutate({ id }, { onSuccess: () => showToast("Acesso removido.", "info"), onError: () => showToast("Não foi possível remover o acesso.", "error") }); }} onFormChange={(field, value) => setLocationForm((current) => ({ ...current, [field]: value }))} onCreate={handleCreateLocation} onUpdate={(location) => locationUpdate.mutate(location, { onSuccess: () => showToast("Local atualizado.", "success"), onError: () => showToast("Não foi possível atualizar o local.", "error") })} onRemove={(id) => { if (window.confirm("Excluir este local de atendimento?")) locationRemove.mutate({ id }, { onSuccess: () => showToast("Local excluído.", "info"), onError: () => showToast("Não foi possível excluir o local.", "error") }); }} onBack={() => setScreen("account")} />}
              {screen === "schedule" && <ScheduleScreen appointments={(appointmentsQuery.data ?? []) as Appointment[]} form={appointmentForm} loading={appointmentCreate.isPending} onFormChange={(field, value) => setAppointmentForm((current) => ({ ...current, [field]: value }))} onCreate={handleCreateAppointment} onRemove={(id) => { if (window.confirm("Excluir este agendamento?")) appointmentRemove.mutate({ id }, { onSuccess: () => showToast("Agendamento excluído.", "info"), onError: () => showToast("Não foi possível excluir o agendamento.", "error") }); }} onBack={() => setScreen("home")} />}
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
  onSchedule: () => void;
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
  onSchedule,
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

      <BottomNav active="home" onAccount={onOpenAccount} onCall={onCreateCall} onSchedule={onSchedule} />
    </div>
  );
}

type AuthScreenProps = {
  mode: "login" | "signup";
  authMode: "email" | "phone";
  showPassword: boolean;
  form: { name: string; phone: string; email: string; city: string; state: string; gender: Gender | ""; appRole: AppRole; identity: string; password: string };
  states: IbgeState[];
  cities: IbgeCity[];
  citiesLoading: boolean;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onModeChange: (mode: "email" | "phone") => void;
  onTogglePassword: () => void;
  onChange: (field: "name" | "phone" | "email" | "city" | "state" | "gender" | "appRole" | "identity" | "password", value: string) => void;
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
          {isSignup && <label>Gênero<select value={form.gender} onChange={(event) => onChange("gender", event.target.value)}><option value="">Selecione uma opção</option><option value="female">Feminino</option><option value="male">Masculino</option><option value="non_binary">Não binário</option><option value="other">Outro</option><option value="prefer_not_to_say">Prefiro não informar</option></select></label>}
          {isSignup && <label>Quero usar o app como<select value={form.appRole} onChange={(event) => onChange("appRole", event.target.value)}><option value="deaf_person">Pessoa surda</option><option value="interpreter">Intérprete de Libras</option><option value="establishment">Estabelecimento</option></select></label>}
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
  isAdmin: boolean;
  onAdmin: () => void;
  onChange: (field: keyof Profile, value: string) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onLogout: () => void;
  onBack: () => void;
};

function AccountScreen({ profile, states, cities, citiesLoading, isAdmin, onAdmin, onChange, onSave, onDelete, onLogout, onBack }: AccountScreenProps) {
  return <div className="screen-stack auth-screen">
    <header className="topbar auth-topbar"><button className="back-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><span className="auth-step">MINHA CONTA</span><button className="icon-button muted-icon" aria-label="Ajuda"><CircleHelp size={19} /></button></header>
    <main className="content auth-content">
      <div className="auth-brand"><span className="brand-mark large-mark"><UserRound size={25} /></span><span className="section-kicker">PERFIL DO USUÁRIO</span></div>
      <div className="auth-heading"><span className="eyebrow"><span className="live-dot" /> DADOS DA CONTA</span><h1>Seu perfil,<br /><em>do seu jeito.</em></h1><p>Altere seus dados de contato e localização quando precisar.</p></div>
      <form className="auth-form" onSubmit={onSave}>
        <label>Nome completo<input value={profile.name} onChange={(event) => onChange("name", event.target.value)} autoComplete="name" /></label>
        <label>Telefone<input value={profile.phone} onChange={(event) => onChange("phone", event.target.value)} autoComplete="tel" /></label>
        <label>Email<input value={profile.email} onChange={(event) => onChange("email", event.target.value)} type="email" autoComplete="email" /></label>
        <label>Gênero<select value={profile.gender} onChange={(event) => onChange("gender", event.target.value)}><option value="female">Feminino</option><option value="male">Masculino</option><option value="non_binary">Não binário</option><option value="other">Outro</option><option value="prefer_not_to_say">Prefiro não informar</option></select></label>
        <label>Perfil de uso<select value={profile.appRole} onChange={(event) => onChange("appRole", event.target.value)}><option value="deaf_person">Pessoa surda</option><option value="interpreter">Intérprete de Libras</option><option value="establishment">Estabelecimento</option></select></label>
        <label>Estado<select value={profile.state} onChange={(event) => onChange("state", event.target.value)}><option value="">Selecione seu estado</option>{states.map((state) => <option key={state.id} value={state.sigla}>{state.nome} ({state.sigla})</option>)}</select></label>
        <label>Cidade<select value={profile.city} onChange={(event) => onChange("city", event.target.value)} disabled={!profile.state || citiesLoading}><option value="">{citiesLoading ? "Carregando cidades..." : "Selecione sua cidade"}</option>{cities.map((city) => <option key={city.id} value={city.nome}>{city.nome}</option>)}</select></label>
        <button className="primary-button submit-button" type="submit"><Save size={17} /> Salvar alterações</button>
      </form>
      <div className="account-management"><button className="outline-button" onClick={onLogout}><LogOut size={15} /> Sair da conta</button><button className="delete-button" onClick={onDelete}><Trash2 size={15} /> Excluir conta</button></div>
      {isAdmin && <button className="admin-link-button" onClick={onAdmin}><Building2 size={15} /> Painel de administração</button>}
      <p className="prototype-note"><MapPin size={13} /> Estados e cidades carregados pela API oficial do IBGE.</p>
    </main>
  </div>;
}

type ScheduleScreenProps = {
  appointments: Appointment[];
  form: { title: string; date: string; time: string; location: string };
  loading: boolean;
  onFormChange: (field: "title" | "date" | "time" | "location", value: string) => void;
  onCreate: () => void;
  onRemove: (id: number) => void;
  onBack: () => void;
};

function ScheduleScreen({ appointments, form, loading, onFormChange, onCreate, onRemove, onBack }: ScheduleScreenProps) {
  return <div className="screen-stack auth-screen">
    <header className="topbar auth-topbar"><button className="back-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><span className="auth-step">AGENDAMENTOS</span><CalendarDays size={19} className="schedule-header-icon" /></header>
    <main className="content auth-content schedule-content">
      <div className="auth-brand"><span className="brand-mark large-mark"><CalendarDays size={25} /></span><span className="section-kicker">AGENDA DO ATENDIMENTO</span></div>
      <div className="auth-heading"><span className="eyebrow"><span className="live-dot" /> ORGANIZE SEU DIA</span><h1>Seus eventos,<br /><em>no seu tempo.</em></h1><p>Confira o que está marcado ou crie um novo atendimento.</p></div>
      <section className="schedule-form-card"><span className="section-kicker">NOVO AGENDAMENTO</span><input value={form.title} onChange={(event) => onFormChange("title", event.target.value)} placeholder="Nome do evento" /><div className="schedule-fields"><input type="date" value={form.date} onChange={(event) => onFormChange("date", event.target.value)} aria-label="Data" /><input type="time" value={form.time} onChange={(event) => onFormChange("time", event.target.value)} aria-label="Horário" /></div><input value={form.location} onChange={(event) => onFormChange("location", event.target.value)} placeholder="Local ou estabelecimento" /><button className="primary-button submit-button" onClick={onCreate} disabled={loading}><Plus size={17} /> {loading ? "Salvando..." : "Marcar evento"}</button></section>
      <div className="section-heading schedule-list-heading"><div><span className="section-kicker">PRÓXIMOS EVENTOS</span><h2>{appointments.length ? "Sua agenda" : "Nada marcado ainda"}</h2></div></div>
      <section className="appointment-list">{appointments.length === 0 ? <div className="empty-admin"><CalendarDays size={22} /><p>Quando você marcar um evento, ele aparecerá aqui.</p></div> : appointments.map((appointment) => <article className="appointment-card" key={appointment.id}><div className="appointment-date"><strong>{appointment.date.slice(8, 10)}</strong><span>{appointment.date.slice(5, 7)}/{appointment.date.slice(0, 4)}</span></div><div className="appointment-copy"><strong>{appointment.title}</strong><span>{appointment.time} · {appointment.location}</span></div><button className="delete-button" onClick={() => onRemove(appointment.id)} aria-label={`Excluir ${appointment.title}`}><Trash2 size={14} /></button></article>)}</section>
      <p className="prototype-note"><Bell size={13} /> Você poderá acompanhar seus atendimentos e compromissos nesta agenda.</p>
    </main>
  </div>;
}

type AdminScreenProps = {
  access: AdminAccess[];
  adminEmail: string;
  locations: ServiceLocation[];
  form: { name: string; city: string; phone: string; email: string };
  loading: boolean;
  accessLoading: boolean;
  onAdminEmailChange: (value: string) => void;
  onCreateAccess: () => void;
  onRemoveAccess: (id: number) => void;
  onFormChange: (field: "name" | "city" | "phone" | "email", value: string) => void;
  onCreate: () => void;
  onUpdate: (location: ServiceLocation) => void;
  onRemove: (id: number) => void;
  onBack: () => void;
};

function AdminScreen({ access, adminEmail, locations, form, loading, accessLoading, onAdminEmailChange, onCreateAccess, onRemoveAccess, onFormChange, onCreate, onUpdate, onRemove, onBack }: AdminScreenProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ServiceLocation | null>(null);
  return <div className="screen-stack auth-screen">
    <header className="topbar auth-topbar"><button className="back-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><span className="auth-step">ADMINISTRAÇÃO</span><span className="admin-badge">ADMIN</span></header>
    <main className="content auth-content admin-content">
      <div className="auth-brand"><span className="brand-mark large-mark"><Building2 size={25} /></span><span className="section-kicker">LOCAIS DE ATENDIMENTO</span></div>
      <div className="auth-heading"><span className="eyebrow"><span className="live-dot" /> GESTÃO DO SERVIÇO</span><h1>Onde o atendimento<br /><em>acontece.</em></h1><p>Cadastre os locais públicos e privados que poderão receber chamadas.</p></div>
      <section className="admin-overview-grid"><div><span><UsersRound size={15} /></span><strong>{access.length}/2</strong><small>Acessos admin</small></div><div><span><Building2 size={15} /></span><strong>{locations.length}</strong><small>Locais cadastrados</small></div><div><span><CheckCircle2 size={15} /></span><strong>{locations.filter((location) => location.status === "active").length}</strong><small>Locais ativos</small></div></section>
      <section className="admin-access-card"><div className="admin-access-heading"><div><span className="section-kicker">ACESSOS ADMINISTRATIVOS</span><h3>{access.length}/2 vagas usadas</h3></div><ShieldCheck size={20} /></div><p>Adicione até duas pessoas. Elas devem entrar usando uma conta Manus com o email informado.</p><div className="admin-access-form"><input type="email" value={adminEmail} onChange={(event) => onAdminEmailChange(event.target.value)} placeholder="email@administrador.com" /><button className="primary-button compact-button" onClick={onCreateAccess} disabled={accessLoading}><Plus size={15} /> Adicionar</button></div>{access.length > 0 && <div className="admin-access-list">{access.map((item, index) => <div className="admin-access-item" key={item.id}><span className="access-number">{index + 1}</span><span>{item.email}</span><button className="delete-button" onClick={() => onRemoveAccess(item.id)} aria-label={`Remover ${item.email}`}><Trash2 size={14} /></button></div>)}</div>}</section>
      <section className="admin-form-card"><span className="section-kicker">NOVO LOCAL</span><div className="admin-form-grid"><input value={form.name} onChange={(event) => onFormChange("name", event.target.value)} placeholder="Nome do local" /><input value={form.city} onChange={(event) => onFormChange("city", event.target.value)} placeholder="Cidade" /><input value={form.phone} onChange={(event) => onFormChange("phone", event.target.value)} placeholder="Telefone" /><input value={form.email} onChange={(event) => onFormChange("email", event.target.value)} placeholder="Email" type="email" /></div><button className="primary-button submit-button" onClick={onCreate} disabled={loading}><Plus size={17} /> {loading ? "Salvando..." : "Adicionar local"}</button></section>
      <div className="section-heading admin-list-heading"><div><span className="section-kicker">CADASTRADOS</span><h2>{locations.length} {locations.length === 1 ? "local" : "locais"}</h2></div></div>
      <section className="admin-location-list">{locations.length === 0 && <div className="empty-admin"><Building2 size={22} /><p>Nenhum local cadastrado ainda.</p></div>}{locations.map((location) => { const item = editingId === location.id && editing ? editing : location; return <article className="admin-location-card" key={location.id}>{editingId === location.id ? <div className="admin-edit-grid"><input value={item.name} onChange={(event) => setEditing({ ...item, name: event.target.value })} /><input value={item.city} onChange={(event) => setEditing({ ...item, city: event.target.value })} /><input value={item.phone} onChange={(event) => setEditing({ ...item, phone: event.target.value })} /><input value={item.email} onChange={(event) => setEditing({ ...item, email: event.target.value })} type="email" /><div className="admin-card-actions"><button className="primary-button compact-button" onClick={() => { onUpdate(item); setEditingId(null); setEditing(null); }}><Save size={14} /> Salvar</button><button className="outline-button" onClick={() => { setEditingId(null); setEditing(null); }}>Cancelar</button></div></div> : <><div className="location-main"><span className="location-icon"><Building2 size={18} /></span><div><strong>{location.name} <small className={`location-status ${location.status}`}>{location.status === "active" ? "ativo" : "inativo"}</small></strong><span>{location.city} · {location.phone}</span><small>{location.email}</small></div></div><div className="admin-card-actions"><button className="outline-button" onClick={() => onUpdate({ ...location, status: location.status === "active" ? "inactive" : "active" })}>{location.status === "active" ? "Desativar" : "Ativar"}</button><button className="outline-button" onClick={() => { setEditingId(location.id); setEditing(location); }}>Editar</button><button className="delete-button" onClick={() => onRemove(location.id)}><Trash2 size={14} /> Excluir</button></div></>}</article>; })}</section>
      <p className="prototype-note"><ShieldCheck size={13} /> Somente administradores autenticados podem gerenciar locais.</p>
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

function BottomNav({ active, onAccount, onCall, onSchedule }: { active: "home"; onAccount: () => void; onCall: () => void; onSchedule: () => void }) {
  return <nav className="bottom-nav" aria-label="Navegação principal"><button className={active === "home" ? "nav-active" : ""}><span><Sparkles size={19} /></span><small>Início</small></button><button onClick={onCall}><span><Video size={19} /></span><small>Chamadas</small></button><button onClick={onSchedule}><span><CalendarDays size={19} /></span><small>Agenda</small></button><button onClick={onAccount}><span><UserRound size={19} /></span><small>Conta</small></button></nav>;
}

function Toast({ message, tone, onClose }: { message: string; tone: ToastTone; onClose: () => void }) {
  return <div className={`toast toast-${tone}`} role="status"><span className="toast-icon">{tone === "success" ? <CheckCircle2 size={17} /> : tone === "error" ? <X size={17} /> : <Activity size={17} />}</span><span>{message}</span><button onClick={onClose} aria-label="Fechar notificação"><X size={14} /></button></div>;
}

export default App;
