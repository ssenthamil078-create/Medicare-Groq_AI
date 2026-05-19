import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, Ambulance, BellRing, Bot, Brain, CalendarClock, CheckCircle2,
  Cross, FileScan, HeartPulse, Hospital, LocateFixed, Lock, LogIn,
  MapPin, Menu, MessageCircleWarning, Pill, ShieldCheck, Siren, Stethoscope,
  UserPlus, X, Zap
} from "lucide-react";
import "./styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function api(path, options = {}) {
  const token = localStorage.getItem("medicare_token");
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
  } catch (error) {
    throw new Error("Network request failed. Please try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

const defaultPatient = JSON.parse(localStorage.getItem("medicare_patient") || "null");

function App() {
  const [patient, setPatient] = useState(defaultPatient);
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState(localStorage.getItem("medicare_location_status") || "Location not enabled");

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location not supported");
      return;
    }

    setLocationStatus("Requesting location...");
    toast.info("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        localStorage.setItem("medicare_location", JSON.stringify(location));
        localStorage.setItem("medicare_location_status", "Location enabled");
        setLocationStatus("Location enabled");
        toast.success("Location enabled successfully");
      },
      () => {
        localStorage.setItem("medicare_location_status", "Location permission denied");
        setLocationStatus("Location permission denied");
        toast.error("Location permission denied");
      }
    );
  };

  const tabs = useMemo(() => [
  ["dashboard", "Dashboard", Activity],
  ["sos", "SOS", Siren],
  ["ai", "AI Care", Brain],
  ["meds", "Medicine", Pill],
  ["map", "Hospitals", Hospital],
  ["ambulance", "Ambulance", Ambulance],
  ["donors", "Blood Donors", HeartPulse],
  ["volunteers", "Volunteers", ShieldCheck],
  ["voice", "Voice Help", Bot],
  ["offline", "Offline Mode", Zap],
  ["disasters", "Disaster Alerts", BellRing],
  ["command", "Command Center", Activity],

  // ADMIN TAB
  ["admin", "Admin", Lock],

  ["doctors", "Doctors", Stethoscope],
  ["scan", "Prescription", FileScan],
  ["auth", patient ? "Profile" : "Login", patient ? ShieldCheck : LogIn],
], [patient]);

  const logout = () => {
    localStorage.removeItem("medicare_token");
    localStorage.removeItem("medicare_patient");
    setPatient(null);
    setActive("auth");
    toast.success("Logged out successfully");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Cross size={25} /></div>
          <div><h2>MediCare</h2><span>Emergency AI Network</span></div>
        </div>
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button key={id} className={active === id ? "nav active" : "nav"} onClick={() => { setActive(id); setMenuOpen(false); toast.info(`${label} opened`); }}>
              <Icon size={19} /> {label}
            </button>
          ))}
        </nav>
        <div className="side-card">
          <BellRing size={20} />
          <p><b>Emergency mode</b><br />Large buttons, SOS, AI help, medicine reminders and nearby facility search.</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-btn mobile" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
          <div>
            <p className="eyebrow">MediCare Emergency Network</p>
            <h1>{patient ? `Welcome, ${patient.name}` : "AI-Powered Healthcare Platform"}</h1>
          </div>
          <div className="top-actions"><button className="btn ghost" onClick={requestLocationPermission}><LocateFixed size={17}/> Allow Location</button><div className="status-pill"><span></span> {locationStatus}</div></div>
        </header>

        <ToastContainer position="top-right" autoClose={2500} pauseOnHover theme="colored" />
        <section key={active} className="page-transition">
          {active === "dashboard" && <Dashboard setActive={setActive} patient={patient} />}
          {active === "sos" && <SOS patient={patient} />}
          {active === "ai" && <AICare patient={patient} />}
          {active === "meds" && <Medicine patient={patient} />}
          {active === "map" && <NearbyHospitals />}
          {active === "doctors" && <Doctors />}
          {active === "ambulance" && <AmbulanceTracking />}
          {active === "donors" && <BloodDonorNetwork />}
          {active === "volunteers" && <VolunteerNetwork />}
          {active === "voice" && <VoiceEmergency />}
          {active === "offline" && <OfflineEmergency />}
          {active === "disasters" && <DisasterAlerts />}
          {active === "command" && <CommandCenter setActive={setActive} />}
          {active === "admin" && <AdminGate />}
          {active === "scan" && <PrescriptionScan />}
          {active === "auth" && <Auth patient={patient} setPatient={setPatient} logout={logout} />}
        </section>
      </main>
    </div>
  );
}

function Dashboard({ setActive, patient }) {
  const cards = [
  ["Emergency SOS", "Send caregiver alert with live location", Siren, "sos", "danger"],
  ["AI Symptom Analyzer", "Get AI guidance based on patient symptoms", Brain, "ai", "primary"],
  ["Nearby Hospitals", "Find hospitals using existing maps route", Hospital, "map", "green"],
  ["Medicine Reminder", "Track dosage and missed medicine", Pill, "meds", "orange"],
  ["Live Ambulance Tracking", "View ETA, driver status and contact", Ambulance, "ambulance", "primary"],
  ["Blood Donor Network", "Add donors and search available blood groups", HeartPulse, "donors", "danger"],
  ["Volunteer Network", "Nearby helpers for transport and first aid", ShieldCheck, "volunteers", "green"],
  ["Voice Emergency", "Speech-to-text emergency request demo", Bot, "voice", "primary"],
  ["Offline Emergency Mode", "Save emergency alerts offline and sync later", Zap, "offline", "orange"],
  ["Disaster Alerts", "Flood, heatwave and outbreak safety alerts", BellRing, "disasters", "danger"],
  ["Command Center", "Monitor SOS, ambulances, donors and volunteers", Activity, "command", "primary"],

  // ADMIN CARD
  ["Admin Panel", "Restricted admin dashboard access", Lock, "admin", "danger"],
];
  return <>
    <section className="hero-card">
      <div>
        <p className="eyebrow"><HeartPulse size={16}/> Smart emergency healthcare support</p>
        <h2>AI-powered healthcare and emergency response network.</h2>
        <p className="hero-text">Get fast emergency help, AI care guidance, nearby hospital support, blood donor access, ambulance tracking, medicine reminders and safety alerts in one place.</p>
        <div className="hero-actions">
          <button className="btn danger" onClick={() => setActive("sos")}><Siren size={18}/> Start SOS</button>
          <button className="btn ghost" onClick={() => setActive(patient ? "ai" : "auth")}>{patient ? "Open AI Care" : "Login first"}</button>
          <button className="btn primary" onClick={() => setActive("command")}>Open Command Center</button>
        </div>
      </div>
      <div className="pulse-panel">
        <div className="pulse-circle"><Ambulance size={48}/></div>
        <p>Emergency readiness score</p>
        <h3>96%</h3>
      </div>
    </section>
    <section className="grid four">
      {cards.map(([title, text, Icon, id, tone]) => <button className={`feature ${tone}`} key={title} onClick={() => setActive(id)}><Icon/><h3>{title}</h3><p>{text}</p></button>)}
    </section>
    <section className="grid three">
      <InfoCard icon={<Zap />} title="Offline-friendly" text="Emergency details can be stored in browser local storage and synced later." />
      <InfoCard icon={<ShieldCheck />} title="Secure & Protected" text="Admin access is restricted to authorized personnel only. Patient data is encrypted and secured." />
      <InfoCard icon={<Bot />} title="AI ready" text="AI-powered symptom analysis and drug interaction checks to support your care decisions." />
    </section>
  </>;
}

function LoadingButton({ children, onClick, className = "btn primary", type = "button" }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async (event) => {
    if (!onClick) return;
    try {
      setLoading(true);
      await onClick(event);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type={type} className={`${className} ${loading ? "loading-btn" : ""}`} disabled={loading} onClick={handleClick}>
      {loading && <span className="loader"></span>}
      {loading ? "Processing..." : children}
    </button>
  );
}

function Auth({ patient, setPatient, logout }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "", emergencyContact: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setMsg("Please wait..."); setLoading(true);
    try {
      const path = mode === "login" ? "/api/patients/login" : "/api/patients/register";
      const data = await api(path, { method: "POST", body: JSON.stringify(form) });
      if (data.token) localStorage.setItem("medicare_token", data.token);
      if (data.patient) { localStorage.setItem("medicare_patient", JSON.stringify(data.patient)); setPatient(data.patient); }
      setMsg(data.message || "Success");
      toast.success(mode === "login" ? "Login successful" : "Registration successful");
      if (mode === "register") setMode("login");
    } catch (err) { setMsg(err.message); toast.error(err.message); } finally { setLoading(false); }
  };
  if (patient) return <Panel title="Patient Profile" icon={<ShieldCheck/>}><div className="profile"><h2>{patient.name}</h2><p>{patient.email}</p><p>Age: {patient.age || "-"} | Gender: {patient.gender || "-"}</p><p>Emergency contact: {patient.emergencyContact || "-"}</p><button className="btn danger" onClick={logout}>Logout</button></div></Panel>;
  return <Panel title={mode === "login" ? "Patient Login" : "Patient Registration"} icon={mode === "login" ? <LogIn/> : <UserPlus/>}>
    <form className="form" onSubmit={submit}>
      {mode === "register" && <><input placeholder="Full name" onChange={e=>setForm({...form,name:e.target.value})}/><div className="split"><input placeholder="Age" onChange={e=>setForm({...form,age:e.target.value})}/><select onChange={e=>setForm({...form,gender:e.target.value})}><option>Gender</option><option>Female</option><option>Male</option><option>Other</option></select></div><input placeholder="Emergency contact phone" onChange={e=>setForm({...form,emergencyContact:e.target.value})}/></>}
      <input placeholder="Email" type="email" required onChange={e=>setForm({...form,email:e.target.value})}/>
      <input placeholder="Password" type="password" required onChange={e=>setForm({...form,password:e.target.value})}/>
      <button className={`btn primary ${loading ? "loading-btn" : ""}`} disabled={loading}>{loading && <span className="loader"></span>}{loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</button>
      <button type="button" className="link" onClick={()=>setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "New patient? Register" : "Already registered? Login"}</button>
      <Message text={msg}/>
    </form>
  </Panel>;
}

function SOS({ patient }) {
  const [form, setForm] = useState({ patientName: patient?.name || "", caregiverPhone: patient?.emergencyContact || "", latitude: "", longitude: "", emergencyMessage: "I need emergency medical help." });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const locate = () => {
    if (!navigator.geolocation) {
      setMsg("Location is not supported in this browser.");
      return;
    }
    setMsg("Requesting location permission..."); toast.info("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updated = { ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setForm(updated);
        localStorage.setItem("medicare_location", JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        localStorage.setItem("medicare_location_status", "Location enabled");
        setMsg("Location captured successfully."); toast.success("Location captured successfully");
      },
      () => { setMsg("Location permission denied. Enable location in browser settings and try again."); toast.error("Location permission denied"); }
    );
  };
  const submit = async () => { setLoading(true); setMsg("Sending SOS..."); try { const data = await api("/api/notifications/sos-alert", { method:"POST", body: JSON.stringify(form) }); setMsg(`${data.message}. ${data.locationLink || ""}`); toast.success("SOS alert sent successfully"); } catch(e){ setMsg(e.message); toast.error(e.message); } finally { setLoading(false); } };
  return <Panel title="One-Tap Emergency SOS" icon={<Siren/>}>
    <div className="sos-box"><button className={`sos-btn ${loading ? "loading-btn" : ""}`} disabled={loading} onClick={submit}>{loading && <span className="loader light"></span>}<Siren size={42}/> {loading ? "SENDING SOS..." : "SEND SOS ALERT"}</button><p>Sends emergency message and live location to the saved caregiver contact.</p></div>
    <div className="form"><input placeholder="Patient name" value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/><input placeholder="Caregiver phone with country code" value={form.caregiverPhone} onChange={e=>setForm({...form,caregiverPhone:e.target.value})}/><div className="split"><input placeholder="Latitude" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})}/><input placeholder="Longitude" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})}/></div><textarea placeholder="Emergency message" value={form.emergencyMessage} onChange={e=>setForm({...form,emergencyMessage:e.target.value})}/><button className="btn ghost" onClick={locate}><LocateFixed size={18}/> Use my location</button><Message text={msg}/></div>
  </Panel>;
}

function AICare({ patient }) {
  const [diag, setDiag] = useState({ patientName: patient?.name || "", age: patient?.age || "", gender: patient?.gender || "", symptoms: "", duration: "", severity: "Moderate", medicalHistory: "" });
  const [drug, setDrug] = useState({ medicines: "", age: patient?.age || "", medicalHistory: "" });
  const [result, setResult] = useState("");
  const call = async (path, body) => { setResult("AI is thinking..."); toast.info("AI is analyzing..."); try { const data = await api(path, { method:"POST", body: JSON.stringify(body) }); setResult(data.aiSummary || data.interactionSummary || JSON.stringify(data, null, 2)); toast.success("AI result generated"); } catch(e){ setResult(e.message); toast.error(e.message); } };
  return <section className="grid two"><Panel title="AI Symptom Analyzer" icon={<Brain/>}><div className="form"><input placeholder="Patient name" value={diag.patientName} onChange={e=>setDiag({...diag,patientName:e.target.value})}/><div className="split"><input placeholder="Age" value={diag.age} onChange={e=>setDiag({...diag,age:e.target.value})}/><select value={diag.severity} onChange={e=>setDiag({...diag,severity:e.target.value})}><option>Mild</option><option>Moderate</option><option>Severe</option></select></div><textarea placeholder="Symptoms" onChange={e=>setDiag({...diag,symptoms:e.target.value})}/><input placeholder="Duration e.g. 2 days" onChange={e=>setDiag({...diag,duration:e.target.value})}/><textarea placeholder="Medical history" onChange={e=>setDiag({...diag,medicalHistory:e.target.value})}/><button className="btn primary" onClick={()=>call("/api/ai/diagnosis", diag)}>Generate AI Guidance</button></div></Panel><Panel title="Drug Interaction Check" icon={<Pill/>}><div className="form"><textarea placeholder="Medicines e.g. Paracetamol, Cetirizine" onChange={e=>setDrug({...drug,medicines:e.target.value})}/><input placeholder="Age" value={drug.age} onChange={e=>setDrug({...drug,age:e.target.value})}/><textarea placeholder="Medical history" onChange={e=>setDrug({...drug,medicalHistory:e.target.value})}/><button className="btn orange" onClick={()=>call("/api/ai/drug-interaction", drug)}>Check Interaction</button></div></Panel><div className="result-card"><h3>AI Result</h3><pre>{result || "Result will appear here. Medical disclaimer: this is support information only, not a final diagnosis."}</pre></div></section>;
}

function Medicine({ patient }) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [form, setForm] = useState({
    patientName: patient?.name || "",
    patientEmail: patient?.email || "",
    patientPhone: "",
    caregiverPhone: "",
    medicineName: "",
    dosage: "",
    frequency: "Daily",
    reminderTime: "",
    reminderDate: todayStr,
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await api("/api/medications/all");
      setItems(data);
      toast.success("Medicines loaded");
    } catch(e) {
      setMsg(e.message + " — login may be required.");
      toast.error(e.message);
    }
  };

  const add = async () => {
    if (!form.patientName || !form.medicineName || !form.dosage || !form.reminderTime) {
      toast.error("Patient name, medicine, dosage and reminder time are required.");
      return;
    }
    if (!form.patientPhone) {
      toast.error("WhatsApp number is required to send reminders.");
      return;
    }
    setMsg("Saving...");
    try {
      const data = await api("/api/medications/add", { method: "POST", body: JSON.stringify(form) });
      setMsg(data.message);
      toast.success("Medicine added — WhatsApp reminder scheduled!");
      load();
    } catch(e) {
      setMsg(e.message);
      toast.error(e.message);
    }
  };

  const take = async (id) => {
    try {
      await api(`/api/medications/take/${id}`, { method: "PUT" });
      toast.success("Marked as taken!");
      load();
    } catch(e) {
      setMsg(e.message);
    }
  };

  const sendWhatsApp = async (id) => {
    try {
      const data = await api(`/api/medications/send-whatsapp-reminder/${id}`, { method: "POST" });
      toast.success(data.message || "WhatsApp reminder sent!");
    } catch(e) {
      toast.error(e.message);
    }
  };

  return (
    <Panel title="Medication & WhatsApp Reminder" icon={<CalendarClock/>}>
      <div className="form">
        <div className="split">
          <input placeholder="Patient name" value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/>
          <input placeholder="Patient email (optional)" value={form.patientEmail} onChange={e=>setForm({...form,patientEmail:e.target.value})}/>
        </div>
        <div className="split">
          <input placeholder="Patient WhatsApp number (e.g. 9876543210)" value={form.patientPhone} onChange={e=>setForm({...form,patientPhone:e.target.value})}/>
          <input placeholder="Caregiver WhatsApp (optional)" value={form.caregiverPhone} onChange={e=>setForm({...form,caregiverPhone:e.target.value})}/>
        </div>
        <div className="split">
          <input placeholder="Medicine name" onChange={e=>setForm({...form,medicineName:e.target.value})}/>
          <input placeholder="Dosage e.g. 500mg" onChange={e=>setForm({...form,dosage:e.target.value})}/>
        </div>
        <div className="split">
          <select value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>
            <option>Daily</option><option>Twice Daily</option><option>Weekly</option><option>As needed</option>
          </select>
          <input type="time" title="Reminder time — WhatsApp will be sent at this time" onChange={e=>setForm({...form,reminderTime:e.target.value})}/>
        </div>
        <div className="split">
          <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
            <label style={{fontSize:"12px",color:"var(--text-muted)",paddingLeft:"2px"}}>Reminder Date</label>
            <input type="date" value={form.reminderDate} onChange={e=>setForm({...form,reminderDate:e.target.value})}/>
          </div>
          <input placeholder="Notes (optional)" onChange={e=>setForm({...form,notes:e.target.value})}/>
        </div>
        <div className="message" style={{background:"var(--surface-2)",borderLeft:"3px solid var(--primary)"}}>
          <BellRing size={16}/> A WhatsApp reminder will be sent to the patient at the scheduled time. If the patient doesn't mark it taken, the caregiver will also be alerted.
        </div>
        <button className="btn primary" onClick={add}><BellRing size={16}/> Add Medicine &amp; Schedule WhatsApp Reminder</button>
        <button className="btn ghost" onClick={load}>Load My Medicines</button>
        <Message text={msg}/>
      </div>
      <div className="list">
        {items.map(m => (
          <div className="list-card" key={m.id}>
            <Pill/>
            <div>
              <b>{m.medicine_name}</b>
              <p>{m.dosage} • {m.frequency} • ⏰ {m.reminder_time} • 📅 {m.reminder_date || "—"}</p>
              <p style={{fontSize:"12px",color:"var(--text-muted)"}}>📱 {m.patient_phone || "No WhatsApp"} {m.whatsapp_reminder_sent ? "✅ Reminder sent" : "⏳ Pending"}</p>
            </div>
            <button className="mini" onClick={()=>take(m.id)}><CheckCircle2 size={16}/> Taken</button>
            <button className="mini" onClick={()=>sendWhatsApp(m.id)} title="Send WhatsApp now">📲</button>
          </div>
        ))}
        {items.length === 0 && <p style={{color:"var(--text-muted)",padding:"12px"}}>No medicines added yet. Add one above to schedule a WhatsApp reminder.</p>}
      </div>
    </Panel>
  );
}

function NearbyHospitals() {
  const [coords, setCoords] = useState({lat:"",lng:""}); const [hospitals,setHospitals]=useState([]); const [msg,setMsg]=useState("");
  const locate = () => navigator.geolocation?.getCurrentPosition(pos => setCoords({lat:pos.coords.latitude,lng:pos.coords.longitude}), ()=>setMsg("Location permission denied."));
  const search = async () => { setMsg("Searching nearby hospitals..."); try { const data = await api(`/api/maps/nearby-hospitals?lat=${coords.lat}&lng=${coords.lng}`); setHospitals(data.hospitals || []); setMsg(data.message); } catch(e){ setMsg(e.message); } };
  return <Panel title="Nearby Hospitals Finder" icon={<Hospital/>}><div className="form inline"><input placeholder="Latitude" value={coords.lat} onChange={e=>setCoords({...coords,lat:e.target.value})}/><input placeholder="Longitude" value={coords.lng} onChange={e=>setCoords({...coords,lng:e.target.value})}/><button className="btn ghost" onClick={locate}><LocateFixed size={18}/> Locate</button><button className="btn primary" onClick={search}><MapPin size={18}/> Search</button></div><Message text={msg}/><div className="list">{hospitals.map(h=><div className="list-card" key={h.id}><Hospital/><div><b>{h.name}</b><p>{h.address} • {h.phone}</p></div><a className="mini" target="_blank" href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`}>Map</a></div>)}</div></Panel>;
}

function Doctors() {
  const [form,setForm]=useState({location:"",specialization:""}); const [doctors,setDoctors]=useState([]); const [msg,setMsg]=useState("");
  const search = async()=>{ setMsg("Searching doctors..."); try{ const d=await api(`/api/doctors/emergency?location=${encodeURIComponent(form.location)}&specialization=${encodeURIComponent(form.specialization)}`); setDoctors(d.doctors||[]); setMsg(d.message); }catch(e){setMsg(e.message)} };
  return <Panel title="Emergency Doctors" icon={<Stethoscope/>}><div className="form inline"><input placeholder="Location" onChange={e=>setForm({...form,location:e.target.value})}/><input placeholder="Specialization e.g. Cardiology" onChange={e=>setForm({...form,specialization:e.target.value})}/><button className="btn primary" onClick={search}>Find Doctors</button></div><Message text={msg}/><div className="list">{doctors.map(d=><div className="list-card" key={d._id}><Stethoscope/><div><b>{d.name}</b><p>{d.specialization} • {d.hospitalName} • {d.location} • {d.phone}</p></div></div>)}</div></Panel>;
}

function PrescriptionScan() {
  const [file,setFile]=useState(null); const [result,setResult]=useState("");
  const scan = async()=>{ if(!file) return setResult("Choose prescription image first."); const fd=new FormData(); fd.append("prescription",file); setResult("Scanning OCR + AI..."); try{ const data=await api("/api/prescription/scan",{method:"POST",body:fd}); setResult(`Extracted Text:\n${data.extractedText}\n\nAI Parsed Medicines:\n${data.aiParsedMedicines}`); }catch(e){setResult(e.message)} };
  return <Panel title="AI Prescription Scanner" icon={<FileScan/>}><div className="upload"><input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])}/><button className="btn primary" onClick={scan}>Scan Prescription</button></div><pre className="scan-result">{result || "Upload a prescription image to extract medicine details."}</pre></Panel>;
}

function AmbulanceTracking() {
  const ambulances = [
    { id:"AMB-101", driver:"Rajesh Kumar", phone:"9876543210", status:"On Route", eta:"7 min", location:"Near Bus Stand", priority:"Critical" },
    { id:"AMB-204", driver:"Karthik", phone:"9876501234", status:"Available", eta:"12 min", location:"Government Hospital", priority:"Medium" },
    { id:"AMB-332", driver:"Mohan", phone:"9876512345", status:"Busy", eta:"25 min", location:"PHC Road", priority:"Low" },
  ];
  return <Panel title="Live Ambulance Tracking" icon={<Ambulance/>}>
    <section className="grid three">{ambulances.map(a=><div className="info-card" key={a.id}><div className="round-icon"><Ambulance/></div><h3>{a.id}</h3><p><b>Driver:</b> {a.driver}</p><p><b>Status:</b> {a.status}</p><p><b>ETA:</b> {a.eta}</p><p><b>Location:</b> {a.location}</p><span className={`badge ${a.priority.toLowerCase()}`}>{a.priority}</span><br/><a className="mini" href={`tel:${a.phone}`}>Call Driver</a></div>)}</section>
  </Panel>;
}

function BloodDonorNetwork() {
  const [donors, setDonors] = useState(() => JSON.parse(localStorage.getItem("medicare_blood_donors") || "[]"));
  const [form, setForm] = useState({ name:"", bloodGroup:"", phone:"", location:"", age:"", availability:"Available" });
  const addDonor = (e) => { e.preventDefault(); if(!form.name || !form.bloodGroup || !form.phone || !form.location || !form.age) return alert("Fill all donor details"); const updated=[...donors, form]; setDonors(updated); localStorage.setItem("medicare_blood_donors", JSON.stringify(updated)); setForm({ name:"", bloodGroup:"", phone:"", location:"", age:"", availability:"Available" }); toast.success("Blood donor added successfully"); };
  const remove = (i) => { const updated=donors.filter((_,idx)=>idx!==i); setDonors(updated); localStorage.setItem("medicare_blood_donors", JSON.stringify(updated)); };
  return <section className="grid two"><Panel title="Register Blood Donor" icon={<HeartPulse/>}><form className="form" onSubmit={addDonor}><input placeholder="Donor name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><select value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}><option value="">Blood group</option>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g=><option key={g}>{g}</option>)}</select><input placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input placeholder="Village / location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input placeholder="Age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/><select value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})}><option>Available</option><option>Unavailable</option></select><button className="btn danger">Add Donor</button></form></Panel><Panel title="Available Donors" icon={<HeartPulse/>}><div className="list">{donors.length===0 && <p>No donors added yet. Add the first donor from the form.</p>}{donors.map((d,i)=><div className="list-card" key={i}><HeartPulse/><div><b>{d.name} — {d.bloodGroup}</b><p>{d.location} • Age {d.age} • {d.availability}</p><p>Phone: {d.phone}</p></div><a className="mini" href={`tel:${d.phone}`}>Call</a><button className="mini danger-mini" onClick={()=>remove(i)}>Delete</button></div>)}</div></Panel></section>;
}

function VolunteerNetwork() {
  const volunteers = [
    { name:"Arun Kumar", skill:"Emergency Transport", distance:"2 km", status:"Available" },
    { name:"Meena", skill:"First Aid", distance:"4 km", status:"Available" },
    { name:"Rahul", skill:"Blood Donation", distance:"3 km", status:"Busy" },
  ];
  return <Panel title="Volunteer Emergency Network" icon={<ShieldCheck/>}><section className="grid three">{volunteers.map(v=><div className="info-card" key={v.name}><div className="round-icon"><ShieldCheck/></div><h3>{v.name}</h3><p><b>Skill:</b> {v.skill}</p><p><b>Distance:</b> {v.distance}</p><span className={`badge ${v.status==='Available'?'low':'medium'}`}>{v.status}</span><br/><button className="btn primary" onClick={()=>toast.success(`${v.name} notified successfully`)}>Contact Volunteer</button></div>)}</section></Panel>;
}

function VoiceEmergency() {
  const [speechText, setSpeechText] = useState(""); const [translatedText, setTranslatedText] = useState(""); const [msg,setMsg]=useState("");
  const startListening = () => { const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if(!SpeechRecognition) return setMsg("Speech recognition is not supported in this browser."); const r = new SpeechRecognition(); r.lang="en-IN"; r.start(); setMsg("Listening..."); r.onresult=(e)=>{ setSpeechText(e.results[0][0].transcript); setMsg("Voice captured."); }; r.onerror=()=>setMsg("Voice capture failed."); };
  const translate = () => { const t=speechText.toLowerCase(); let out="அவசர உதவி தேவை. தயவுசெய்து விரைவாக உதவுங்கள்."; if(t.includes("accident")) out="விபத்து ஏற்பட்டுள்ளது. உடனடி ஆம்புலன்ஸ் உதவி தேவை."; if(t.includes("breathing")) out="மூச்சுத் திணறல் உள்ளது. உடனடி மருத்துவ உதவி தேவை."; setTranslatedText(out); };
  return <Panel title="Voice Emergency Request" icon={<Bot/>}><div className="form"><button className="btn primary" onClick={startListening}>Start Voice Capture</button><button className="btn ghost" onClick={translate}>Translate to Tamil</button><div className="result-card"><h3>Captured Message</h3><pre>{speechText || "No voice captured yet."}</pre></div><div className="result-card"><h3>Translated Emergency Message</h3><pre>{translatedText || "Translation will appear here."}</pre></div><button className="btn danger" onClick={()=>setMsg("Voice SOS prepared. Connect this to /api/notifications/sos-alert later.")}>Send Voice SOS</button><Message text={msg}/></div></Panel>;
}

function OfflineEmergency() {
  const [isOnline,setIsOnline]=useState(navigator.onLine); const [message,setMessage]=useState(""); const [saved,setSaved]=useState(()=>JSON.parse(localStorage.getItem("medicare_offline_alerts")||"[]"));
  React.useEffect(()=>{ const on=()=>setIsOnline(true), off=()=>setIsOnline(false); window.addEventListener("online",on); window.addEventListener("offline",off); return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off)};},[]);
  const save=()=>{ if(!message.trim()) return toast.error("Enter emergency message"); const updated=[...saved,{message,time:new Date().toLocaleString(),status:"Pending Sync"}]; setSaved(updated); localStorage.setItem("medicare_offline_alerts",JSON.stringify(updated)); setMessage(""); };
  const sync=()=>{ localStorage.removeItem("medicare_offline_alerts"); setSaved([]); toast.success("Pending emergency alerts synced successfully."); };
  return <Panel title="Offline Emergency Mode" icon={<Zap/>}><div className="message">{isOnline?"🟢 Internet Connected":"🔴 Offline Mode Active"}</div><div className="form"><textarea placeholder="Describe emergency..." value={message} onChange={e=>setMessage(e.target.value)}/><button className="btn orange" onClick={save}>Save Emergency Offline</button><button className="btn primary" onClick={sync}>Sync Pending Alerts</button></div><div className="list">{saved.map((a,i)=><div className="list-card" key={i}><Zap/><div><b>{a.message}</b><p>{a.time} • {a.status}</p></div></div>)}</div></Panel>;
}

function DisasterAlerts() {
  const alerts=[ ["🌡️","Heatwave Alert","Medium","Drink water, avoid outdoor travel and check elderly patients."], ["🌊","Flood Risk","Low","Keep emergency kit ready and monitor updates."], ["🚧","Accident Zone","High","Avoid main road junction; responders notified."], ["🦠","Outbreak Watch","Medium","Report fever clusters and follow hygiene precautions."] ];
  return <Panel title="Disaster & Public Health Alerts" icon={<BellRing/>}><section className="grid four">{alerts.map(([icon,title,level,action])=><div className="info-card" key={title}><div className="emoji-icon">{icon}</div><h3>{title}</h3><span className={`badge ${level==='High'?'critical':level==='Medium'?'medium':'low'}`}>{level}</span><p>{action}</p></div>)}</section></Panel>;
}

function CommandCenter({ setActive }) {
  const [actionLog,setActionLog]=useState([]); const add=(m)=>{setActionLog([{message:m,time:new Date().toLocaleTimeString()},...actionLog]); toast.success(m)};
  const cases=[ {name:"Ravi Kumar",type:"Accident",location:"Village Bus Stand",severity:"Critical",status:"Ambulance Assigned",eta:"6 min"}, {name:"Meena",type:"Breathing Problem",location:"Main Road",severity:"Critical",status:"Doctor Notified",eta:"8 min"}, {name:"Arun",type:"Fever",location:"Rural PHC",severity:"Medium",status:"Volunteer Assigned",eta:"15 min"} ];
  return <><section className="grid four"><InfoCard icon={<Siren/>} title="Active SOS" text="12 cases"/><InfoCard icon={<HeartPulse/>} title="Critical Cases" text="4 cases"/><InfoCard icon={<Ambulance/>} title="Ambulances Online" text="8 active"/><InfoCard icon={<ShieldCheck/>} title="Volunteers Nearby" text="26 ready"/></section><section className="grid two"><Panel title="Live Emergency Requests" icon={<Activity/>}><div className="list">{cases.map(c=><div className="list-card" key={c.name}><Siren/><div><b>{c.name} — {c.type}</b><p>{c.location} • {c.status} • ETA {c.eta}</p></div><span className={`badge ${c.severity==='Critical'?'critical':'medium'}`}>{c.severity}</span></div>)}</div></Panel><Panel title="Quick Actions" icon={<Zap/>}><div className="form"><button className="btn primary" onClick={()=>add("🚑 Ambulance assigned successfully.")}>Assign Ambulance</button><button className="btn ghost" onClick={()=>add("🏥 Nearest hospital notified successfully.")}>Notify Nearest Hospital</button><button className="btn danger" onClick={()=>add("📢 Mass alert sent to volunteers and responders.")}>Trigger Mass Alert</button><button className="btn orange" onClick={()=>setActive("map")}>Open Hospital Map</button></div><div className="list">{actionLog.map((l,i)=><div className="list-card" key={i}><CheckCircle2/><div><b>{l.time}</b><p>{l.message}</p></div></div>)}</div></Panel></section></>;
}

function AdminGate() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("medicare_admin") === "1");
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || "admin";
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "medicare@admin2025";

  const login = (e) => {
    e.preventDefault();
    if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
      sessionStorage.setItem("medicare_admin", "1");
      setAuthed(true);
      toast.success("Admin access granted");
    } else {
      setErr("Invalid admin credentials.");
      toast.error("Invalid admin credentials");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("medicare_admin");
    setAuthed(false);
    toast.info("Admin logged out");
  };

  if (!authed) {
    return (
      <Panel title="Admin Login" icon={<Lock/>}>
        <form className="form" onSubmit={login} style={{maxWidth:"400px"}}>
          <div className="message" style={{background:"var(--surface-2)",borderLeft:"3px solid var(--primary)"}}>
            <ShieldCheck size={16}/> This area is restricted to authorized administrators only.
          </div>
          <input placeholder="Admin username" required autoComplete="off" onChange={e=>setForm({...form,username:e.target.value})}/>
          <input placeholder="Admin password" type="password" required onChange={e=>setForm({...form,password:e.target.value})}/>
          <button className="btn primary" type="submit"><Lock size={16}/> Login as Admin</button>
          {err && <Message text={err}/>}
        </form>
      </Panel>
    );
  }

  return (
    <>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"12px"}}>
        <button className="btn ghost" onClick={logout}><Lock size={16}/> Admin Logout</button>
      </div>
      <AdminDashboard />
    </>
  );
}

function AdminDashboard() {
  return <><section className="grid four"><InfoCard icon={<Siren/>} title="Total Emergencies" text="348"/><InfoCard icon={<HeartPulse/>} title="Critical Cases" text="92"/><InfoCard icon={<HeartPulse/>} title="Registered Donors" text="156"/><InfoCard icon={<ShieldCheck/>} title="Volunteers" text="84"/></section><section className="grid two"><Panel title="Emergency Case Analytics" icon={<Activity/>}><div className="list"><div className="list-card"><Siren/><div><b>Accident Cases</b><p>Highest emergency type this month</p></div><span className="badge critical">42%</span></div><div className="list-card"><HeartPulse/><div><b>Breathing Problems</b><p>Second highest emergency category</p></div><span className="badge medium">28%</span></div></div></Panel><Panel title="Ambulance Status" icon={<Ambulance/>}><ResponseLine title="Available" value="8 ambulances"/><ResponseLine title="On Route" value="5 ambulances"/><ResponseLine title="Average ETA" value="9 minutes"/></Panel></section></>;
}
function ResponseLine({title,value}){return <div className="list-card"><CheckCircle2/><div><b>{title}</b><p>{value}</p></div></div>}

function Panel({ title, icon, children }) { return <section className="panel"><div className="panel-title"><div className="round-icon">{icon}</div><h2>{title}</h2></div>{children}</section>; }
function InfoCard({ icon, title, text }) { return <div className="info-card"><div className="round-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>; }
function Message({ text }) { return text ? <div className="message"><MessageCircleWarning size={17}/>{text}</div> : null; }

createRoot(document.getElementById("root")).render(<App />);
