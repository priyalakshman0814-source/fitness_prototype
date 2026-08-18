/* ---------------- DATA MODEL ---------------- */
const FOOD_DB = [
  { name:"Rice (spoon)",              serving:"1 spoon - 20 g cooked",   cal:19,  gl:4.0,  netCarbs:4.3, fatCarbs:0.1, fats:0,   protein:0.4, fiber:0.1 },
  { name:"Bread - multigrain",        serving:"1 slice - approx 20 g",   cal:45,  gl:5.6,  netCarbs:8,   fatCarbs:0.3, fats:0,   protein:2,   fiber:1.3 },
  { name:"Vegetable Biryani / Pulao", serving:"1 katori - 124 g",        cal:142, gl:12.4, netCarbs:20,  fatCarbs:6,   fats:0,   protein:3,   fiber:2 },
  { name:"Dal (mixed lentil)",        serving:"1 katori - 150 g",        cal:120, gl:8.0,  netCarbs:14,  fatCarbs:2,   fats:1,   protein:8,   fiber:5 },
  { name:"Roti (whole wheat)",        serving:"1 piece - 30 g",          cal:80,  gl:9.5,  netCarbs:15,  fatCarbs:1,   fats:0,   protein:3,   fiber:2 },
  { name:"Paneer (grilled)",          serving:"100 g",                   cal:265, gl:0.5,  netCarbs:2,   fatCarbs:20,  fats:20,  protein:18,  fiber:0 },
  { name:"Boiled Egg",                serving:"1 piece",                 cal:78,  gl:0,    netCarbs:0.6, fatCarbs:5,   fats:5,   protein:6,   fiber:0 },
  { name:"Chicken Curry",             serving:"1 katori - 150 g",        cal:220, gl:2.0,  netCarbs:5,   fatCarbs:12,  fats:11,  protein:24,  fiber:1 },
  { name:"Curd / Yogurt",             serving:"1 bowl - 150 g",          cal:98,  gl:4.5,  netCarbs:7,   fatCarbs:5,   fats:5,   protein:6,   fiber:0 },
  { name:"Banana",                    serving:"1 medium",                cal:105, gl:11.0, netCarbs:24,  fatCarbs:0.4, fats:0,   protein:1,   fiber:3 },
  { name:"Almonds",                   serving:"10 pieces",               cal:70,  gl:0.5,  netCarbs:1.5, fatCarbs:6,   fats:6,   protein:3,   fiber:1.5},
  { name:"Oats (cooked)",             serving:"1 bowl - 200 g",          cal:150, gl:14.5, netCarbs:24,  fatCarbs:3,   fats:3,   protein:5,   fiber:4 },
  { name:"Milk (toned)",              serving:"1 glass - 200 ml",        cal:104, gl:6.5,  netCarbs:10,  fatCarbs:4,   fats:4,   protein:6,   fiber:0 },
  { name:"Mixed Salad",               serving:"1 bowl - 150 g",          cal:45,  gl:2.0,  netCarbs:6,   fatCarbs:0.5, fats:0,   protein:2,   fiber:3 },
  { name:"Ghee",                      serving:"1 tsp",                   cal:45,  gl:0,    netCarbs:0,   fatCarbs:5,   fats:5,   protein:0,   fiber:0 },
];
const TARGETS = { calories:[1400,1800], gl:[30,70], fats:[60,120], protein:[40,80] };
const AVATAR_COLORS = ["#2A5DFF","#FF5A4E","#E8A93D","#5C8A00","#8A4FFF"];

function round1(n){ return Math.round(n*10)/10; }
function sumLog(log){
  return log.reduce((a,e)=>({
    cal:a.cal+e.cal, gl:round1(a.gl+e.gl), netCarbs:a.netCarbs+e.netCarbs, fatCarbs:a.fatCarbs+e.fatCarbs,
    fats:a.fats+e.fats, protein:a.protein+e.protein, fiber:a.fiber+e.fiber
  }), {cal:0,gl:0,netCarbs:0,fatCarbs:0,fats:0,protein:0,fiber:0});
}
function mkEntry(type, food, qty){
  return { type, name:food.name, serving:food.serving, qty,
    cal:round1(food.cal*qty), gl:round1(food.gl*qty), netCarbs:round1(food.netCarbs*qty),
    fatCarbs:round1(food.fatCarbs*qty), fats:round1(food.fats*qty), protein:round1(food.protein*qty), fiber:round1(food.fiber*qty) };
}
function initialsOf(name){
  return name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join("").toUpperCase();
}
function timeNow(){
  return state.dateLabel + ", " + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

// Single source of truth — same objects are read by both the client's own screens
// and the coach's monitoring screens, so uploads appear instantly on the coach side.
// Every message (coach feedback OR a client's question) lives in one `messages`
// array per client so the thread reads as a real back-and-forth conversation.
const CLIENTS = [
  { id:"priya", initials:"PS", name:"Priya Sharma", color:"#2A5DFF", targets:TARGETS, password:"1234",
    log:[ mkEntry("OR", FOOD_DB[0], 10), mkEntry("NR", FOOD_DB[1], 3), mkEntry("OR", FOOD_DB[2], 1), mkEntry("OR", FOOD_DB[7], 1) ],
    messages:[ {from:"coach", text:"Great consistency this week — keep logging every meal.", time:"Mon 17 Aug, 8:02 PM"} ] },
  { id:"arjun", initials:"AM", name:"Arjun Mehta", color:"#FF5A4E", targets:TARGETS, password:"1234",
    log:[ mkEntry("OR", FOOD_DB[5], 2), mkEntry("NR", FOOD_DB[14], 4), mkEntry("OR", FOOD_DB[13], 1) ],
    messages:[] },
  { id:"kavya", initials:"KI", name:"Kavya Iyer", color:"#E8A93D", targets:TARGETS, password:"1234",
    log:[ mkEntry("OR", FOOD_DB[3], 1), mkEntry("OR", FOOD_DB[4], 2), mkEntry("NR", FOOD_DB[9], 1) ],
    messages:[ {from:"coach", text:"Try to add a protein source at breakfast tomorrow.", time:"Mon 17 Aug, 7:40 PM"} ] },
  { id:"rohan", initials:"RD", name:"Rohan Das", color:"#2A5DFF", targets:TARGETS, password:"1234",
    log:[ mkEntry("OR", FOOD_DB[6], 2), mkEntry("OR", FOOD_DB[7], 1), mkEntry("NR", FOOD_DB[11], 1), mkEntry("OR", FOOD_DB[8], 1) ],
    messages:[] },
];
const COACH = { name:"Coach Dev Verma", email:"farah@lanefit.app", password:"1234" };

// New-user signup requests, waiting on the coach's approval before they become
// a real client with their own log + message thread.
let SIGNUP_SEQ = 1;
const SIGNUPS = [
  { id:"sig0", name:"Neha Kapoor", email:"neha@lanefit.app", password:"1234", status:"pending", time:"Mon 17 Aug, 6:15 PM" },
];

/* ---------------- SESSION / STATE ---------------- */
let session = { loggedIn:false, role:null, clientId:null };
let state = {
  clientScreen:"dashboard", coachScreen:"roster", selectedClientId:null,
  dateLabel:"Tue, 18 Aug", loginRole:"client", authView:"login", signupNotice:null,
  addFoodMode:"select"   // "select" = pick from list, "custom" = user enters their own meal
};

function pickLoginRole(r){ state.loginRole = r; state.authView = "login"; render(); }
function doLogin(){
  if(state.loginRole==="client"){
    const id = document.getElementById("loginClientSelect").value;
    session = { loggedIn:true, role:"client", clientId:id };
  } else {
    session = { loggedIn:true, role:"coach", clientId:null };
  }
  state.clientScreen = "dashboard";
  state.coachScreen = "roster";
  render();
}
function logout(){ session = { loggedIn:false, role:null, clientId:null }; render(); }

function goClient(screen){ state.clientScreen = screen; render(); }
function goCoach(screen, clientId){ state.coachScreen = screen; if(clientId) state.selectedClientId = clientId; render(); }
function shiftDate(dir){
  state.dateLabel = dir>0 ? "Wed, 19 Aug" : (dir<0 ? "Mon, 17 Aug" : "Tue, 18 Aug");
  render();
}
function myClient(){ return CLIENTS.find(c=>c.id===session.clientId); }

/* ---------------- ADD FOOD (from list OR user's own custom meal) ---------------- */
function setFoodMode(mode){ state.addFoodMode = mode; render(); }

function addFoodToMe(){
  const sel = document.getElementById("foodSelect");
  const qty = parseFloat(document.getElementById("qtyInput").value) || 1;
  const type = document.getElementById("typeSelect").value;
  const food = FOOD_DB[sel.value];
  myClient().log.push(mkEntry(type, food, qty));
  goClient("log");
}

function addCustomFoodToMe(){
  const name = document.getElementById("customName").value.trim();
  if(!name){ alert("Please enter a food name."); return; }
  const serving = document.getElementById("customServing").value.trim() || "1 serving";
  const type = document.getElementById("customType").value;
  const qty = parseFloat(document.getElementById("customQty").value) || 1;
  const cal = parseFloat(document.getElementById("customCal").value) || 0;
  const gl = parseFloat(document.getElementById("customGl").value) || 0;
  const netCarbs = parseFloat(document.getElementById("customNetCarbs").value) || 0;
  const fatCarbs = parseFloat(document.getElementById("customFatCarbs").value) || 0;
  const fats = parseFloat(document.getElementById("customFats").value) || 0;
  const protein = parseFloat(document.getElementById("customProtein").value) || 0;
  const fiber = parseFloat(document.getElementById("customFiber").value) || 0;

  const food = { name, serving, cal, gl, netCarbs, fatCarbs, fats, protein, fiber };
  FOOD_DB.push(food);            // so it also appears in the dropdown next time
  myClient().log.push(mkEntry(type, food, qty));

  state.addFoodMode = "select";
  goClient("log");
}

function removeMeEntry(i){ myClient().log.splice(i,1); render(); }
function clearMeLog(){ myClient().log.length = 0; render(); }

/* ---------------- MESSAGING (client <-> coach) ---------------- */
function sendFeedback(clientId){
  const sel = document.getElementById("feedbackSelect");
  const c = CLIENTS.find(x=>x.id===clientId);
  c.messages.unshift({ from:"coach", text: sel.value, time: timeNow() });
  render();
}
function askCoach(){
  const box = document.getElementById("askCoachInput");
  const text = box.value.trim();
  if(!text) return;
  myClient().messages.unshift({ from:"client", text, time: timeNow() });
  render();
}

/* ---------------- SIGNUP / APPROVAL ---------------- */
function showSignup(){ state.authView = "signup"; render(); }
function cancelSignup(){ state.authView = "login"; render(); }
function submitSignup(){
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim() || "1234";
  if(!name || !email){ alert("Please enter your name and email."); return; }
  SIGNUPS.unshift({ id:"sig"+(SIGNUP_SEQ++), name, email, password, status:"pending", time: timeNow() });
  state.authView = "login";
  state.loginRole = "client";
  state.signupNotice = "Request sent! Your coach will review it and approve your account before you can log in.";
  render();
}
function pendingSignups(){ return SIGNUPS.filter(s=>s.status==="pending"); }
function approveSignup(id){
  const s = SIGNUPS.find(x=>x.id===id);
  if(!s) return;
  s.status = "approved";
  const newId = s.id;
  CLIENTS.push({
    id:newId, initials:initialsOf(s.name), name:s.name,
    color: AVATAR_COLORS[CLIENTS.length % AVATAR_COLORS.length],
    targets:TARGETS, password:s.password,
    log:[], messages:[{from:"coach", text:"Welcome aboard! Log your first meal and I'll start reviewing your numbers.", time: timeNow()}]
  });
  render();
}
function declineSignup(id){
  const s = SIGNUPS.find(x=>x.id===id);
  if(!s) return;
  s.status = "declined";
  render();
}

/* ---------------- RENDER HELPERS ---------------- */
function rangeBar(label, value, bounds, suffix){
  const min = bounds[0], max = bounds[1];
  const lo = Math.min(min, value) - (max-min)*0.15;
  const hi = Math.max(max, value) + (max-min)*0.15;
  const span = hi-lo;
  const bandLeft = ((min-lo)/span)*100, bandWidth = ((max-min)/span)*100;
  const markerLeft = ((value-lo)/span)*100;
  const inRange = value>=min && value<=max;
  const fillColor = inRange ? "var(--lime)" : "var(--coral)";
  return `
    <div class="range">
      <div class="range-label">
        <span>${label}</span>
        <span><b style="color:inherit">${value}${suffix||""}</b> <span style="opacity:.7">(target ${min}\u2013${max}${suffix||""})</span>
        <span class="status-pill ${inRange?'in-range':'out-range'}" style="margin-left:6px;">${inRange?'In range':'Out of range'}</span></span>
      </div>
      <div class="range-track">
        <div class="range-band" style="left:${bandLeft}%;width:${bandWidth}%;"></div>
        <div class="range-marker" style="left:${markerLeft}%; background:${fillColor};"></div>
      </div>
    </div>`;
}

function foodTable(log, editable){
  const totals = sumLog(log);
  const rows = log.map((e,i)=>`
    <tr>
      <td><span class="type-pill type-${e.type}">${e.type}</span></td>
      <td>${e.name}<br><span style="color:var(--slate);font-size:9.5px;">${e.serving}</span></td>
      <td>${e.qty}</td><td>${e.cal}</td><td>${e.gl}</td><td>${e.netCarbs}</td><td>${e.fatCarbs}</td>
      <td>${e.fats}</td><td>${e.protein}</td><td>${e.fiber}</td>
      ${editable? `<td><span class="rm-btn" onclick="removeMeEntry(${i})">\u2715</span></td>`:""}
    </tr>`).join("");
  return `
    <div class="table-wrap"><div class="table-scroll">
    <table>
      <thead><tr>
        <th>Type</th><th>Food Item</th><th>Qty</th><th>Cal</th><th>GL</th><th>Net<br>Carbs</th><th>Fat+<br>Carbs</th><th>Pure<br>Fats</th><th>Protein</th><th>Fiber</th>${editable?"<th></th>":""}
      </tr></thead>
      <tbody>
        ${rows || `<tr><td colspan="${editable?11:10}" style="text-align:center;color:var(--slate);">No entries logged yet</td></tr>`}
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td>${totals.cal}</td><td>${totals.gl}</td><td>${totals.netCarbs}</td><td>${totals.fatCarbs}</td>
          <td>${totals.fats}</td><td>${totals.protein}</td><td>${totals.fiber}</td>${editable?"<td></td>":""}
        </tr>
      </tbody>
    </table>
    </div></div>`;
}

function messageThread(messages, emptyText){
  if(!messages.length) return `<div class="empty-note">${emptyText}</div>`;
  return messages.map(m=>`
    <div class="feedback-msg ${m.from==='client'?'from-client':''}">
      <div class="from">${m.from==='coach' ? 'COACH' : 'YOU'}</div>
      <div class="txt">${m.text}</div>
      <div class="time">${m.time}</div>
    </div>`).join("");
}

/* ---------------- LOGIN / SIGNUP SCREENS ---------------- */
function loginScreen(){
  const clientOptions = CLIENTS.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  const notice = state.signupNotice ? `<div class="pending-note">${state.signupNotice}</div>` : "";
  return `
    <div class="login-wrap">
      <div class="brand">FIT</div>
      <div class="tagline">TRAIN. LOG. FINISH STRONG.</div>
      <div class="role-switch">
        <button class="${state.loginRole==='client'?'active':''}" onclick="pickLoginRole('client')">Client Login</button>
        <button class="${state.loginRole==='coach'?'active':''}" onclick="pickLoginRole('coach')">Coach Login</button>
      </div>
      ${notice}
      ${state.loginRole==='client' ? `
        <div class="login-field">
          <label>ACCOUNT (DEMO)</label>
          <select id="loginClientSelect">${clientOptions}</select>
        </div>
        <div class="login-field"><label>EMAIL</label><input value="priya@lanefit.app"></div>
        <div class="login-field"><label>PASSWORD</label><input type="password" value="1234"></div>
        <div class="login-note">Logging in as a <b>Client</b> \u2014 you'll only see your own food log and targets, plus messages with your coach.</div>
      ` : `
        <div class="login-field"><label>EMAIL</label><input value="${COACH.email}"></div>
        <div class="login-field"><label>PASSWORD</label><input type="password" value="1234"></div>
        <div class="login-note">Logging in as <b>Coach</b> \u2014 you'll see every client's uploaded data, approve new sign-ups, and message clients.</div>
      `}
      <button class="btn btn-primary" style="width:100%;margin:6px 0;" onclick="doLogin()">Log In</button>
      ${state.loginRole==='client' ? `<button class="link-btn" onclick="showSignup()">New here? Request a client account</button>` : ""}
    </div>
  `;
}

function signupScreen(){
  return `
    <div class="signup-wrap">
      <div class="brand" style="font-size:32px;">FIT</div>
      <div class="signup-title">Request a client account</div>
      <div class="login-field"><label>FULL NAME</label><input type="text" id="signupName" placeholder="Your name"></div>
      <div class="login-field"><label>EMAIL</label><input type="email" id="signupEmail" placeholder="you@example.com"></div>
      <div class="login-field"><label>PASSWORD</label><input type="password" id="signupPassword" placeholder="Choose a password"></div>
      <div class="login-note">Your request goes to <b>${COACH.name}</b> for approval. Once approved, you'll appear in the client list and can start logging meals.</div>
      <button class="btn btn-primary" style="width:100%;margin:6px 0;" onclick="submitSignup()">Send Request</button>
      <button class="link-btn" onclick="cancelSignup()">Back to log in</button>
    </div>
  `;
}

/* ---------------- CLIENT SCREENS ---------------- */
function clientDashboard(){
  const c = myClient(); const t = sumLog(c.log);
  const lastCoachMsg = c.messages.find(m=>m.from==="coach");
  return `
    <div class="topbar"><h1 class="hdr">HI, ${c.name.split(' ')[0].toUpperCase()}</h1><span class="logout-link" onclick="logout()">Log out</span></div>
    <div class="sub">${state.dateLabel} \u00b7 Today's intake</div>
    <div class="card-dark">
      ${rangeBar("Calories", t.cal, c.targets.calories, " kcal")}
      ${rangeBar("Glycemic Load (GL)", t.gl, c.targets.gl, "")}
      ${rangeBar("Pure Fats", t.fats, c.targets.fats, "g")}
      ${rangeBar("Protein", t.protein, c.targets.protein, "g")}
    </div>
    <button class="btn btn-primary" onclick="goClient('log')">+ MEAL FOR TODAY</button>
    <div class="card">
      <div style="font-weight:600;font-size:13px;color:var(--navy);margin-bottom:8px;">Quick Summary</div>
      <div class="preview-row"><span>Net Carbs</span><b>${t.netCarbs} g</b></div>
      <div class="preview-row"><span>Fat + Carbs</span><b>${t.fatCarbs} g</b></div>
      <div class="preview-row"><span>Fibers</span><b>${t.fiber} g</b></div>
      <div class="preview-row"><span>Entries logged</span><b>${c.log.length}</b></div>
    </div>
    ${lastCoachMsg ? `
    <div class="card" style="border-color:var(--cobalt);">
      <div style="font-weight:600;font-size:13px;color:var(--cobalt);margin-bottom:6px;">Latest from your coach</div>
      <div style="font-size:12px;color:var(--navy);">${lastCoachMsg.text}</div>
      <div style="font-size:10px;color:var(--slate);margin-top:4px;">${lastCoachMsg.time}</div>
    </div>` : ''}
  `;
}

function clientLog(){
  const c = myClient();
  return `
    <div class="topbar"><h1 class="hdr">FOOD LOG</h1><span class="logout-link" onclick="logout()">Log out</span></div>
    <div class="date-nav">
      <button onclick="shiftDate(-1)">\u2039</button><span>${state.dateLabel}, 2026</span><button onclick="shiftDate(1)">\u203a</button>
    </div>
    ${foodTable(c.log, true)}
    <div class="add-food-box">
      <div style="font-weight:600;font-size:13px;color:var(--navy);margin:4px 0 8px;">Add a Food Item</div>
      <div class="role-switch">
        <button class="${state.addFoodMode==='select'?'active':''}" onclick="setFoodMode('select')">From List</button>
        <button class="${state.addFoodMode==='custom'?'active':''}" onclick="setFoodMode('custom')">My Own Meal</button>
      </div>
      ${state.addFoodMode==='select' ? `
        <div class="field-row">
          <div><label class="small">TYPE</label>
            <select id="typeSelect"><option value="OR">OR (alternative)</option><option value="NR">NR (as required)</option></select>
          </div>
          <div><label class="small">QUANTITY</label><input type="number" id="qtyInput" value="1" min="0.5" step="0.5"></div>
        </div>
        <label class="small">SELECT FOOD ITEM FROM DROPDOWN</label>
        <select id="foodSelect" style="margin-bottom:10px;">
          ${FOOD_DB.map((f,i)=>`<option value="${i}">${f.name} \u2014 ${f.serving}</option>`).join("")}
        </select>
        <button class="btn btn-primary" style="width:100%;margin:0;" onclick="addFoodToMe()">Add to Log</button>
      ` : `
        <div class="field-row">
          <div><label class="small">FOOD NAME</label><input type="text" id="customName" placeholder="e.g. Homemade Poha"></div>
          <div><label class="small">SERVING</label><input type="text" id="customServing" placeholder="e.g. 1 bowl - 150 g"></div>
        </div>
        <div class="field-row">
          <div><label class="small">TYPE</label>
            <select id="customType"><option value="OR">OR (alternative)</option><option value="NR">NR (as required)</option></select>
          </div>
          <div><label class="small">QUANTITY</label><input type="number" id="customQty" value="1" min="0.5" step="0.5"></div>
        </div>
        <div class="field-row">
          <div><label class="small">CALORIES</label><input type="number" id="customCal" value="0" min="0" step="1"></div>
          <div><label class="small">GL</label><input type="number" id="customGl" value="0" min="0" step="0.1"></div>
        </div>
        <div class="field-row">
          <div><label class="small">NET CARBS (g)</label><input type="number" id="customNetCarbs" value="0" min="0" step="0.1"></div>
          <div><label class="small">FAT+CARBS (g)</label><input type="number" id="customFatCarbs" value="0" min="0" step="0.1"></div>
        </div>
        <div class="field-row">
          <div><label class="small">PURE FATS (g)</label><input type="number" id="customFats" value="0" min="0" step="0.1"></div>
          <div><label class="small">PROTEIN (g)</label><input type="number" id="customProtein" value="0" min="0" step="0.1"></div>
        </div>
        <div class="field-row">
          <div><label class="small">FIBER (g)</label><input type="number" id="customFiber" value="0" min="0" step="0.1"></div>
          <div></div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin:0;" onclick="addCustomFoodToMe()">Add Custom Meal to Log</button>
      `}
    </div>
    <div class="btn-row">
      <button class="btn btn-outline" onclick="alert('Saved for ${state.dateLabel}. Your coach can now see this update.')">SAVE</button>
      <button class="btn btn-danger" onclick="clearMeLog()">CLEAR</button>
    </div>
  `;
}

function clientMessages(){
  const c = myClient();
  return `
    <div class="topbar"><h1 class="hdr">MESSAGES</h1><span class="logout-link" onclick="logout()">Log out</span></div>
    <div class="sub">Conversation with ${COACH.name}</div>
    <div class="ask-box">
      <label class="small">ASK YOUR COACH A QUESTION</label>
      <textarea id="askCoachInput" placeholder="e.g. Can I swap dal for paneer today?"></textarea>
      <button class="btn btn-primary" style="width:100%;margin:8px 0 0;" onclick="askCoach()">Send Question</button>
    </div>
    ${messageThread(c.messages, "No messages yet. Ask your coach a question or wait for feedback \u2014 they review logs daily.")}
    <div class="card">
      <div style="font-weight:600;font-size:13px;color:var(--navy);margin-bottom:8px;">Your Targets</div>
      <div class="preview-row"><span>Calories</span><b>${c.targets.calories[0]}\u2013${c.targets.calories[1]} kcal</b></div>
      <div class="preview-row"><span>GL</span><b>${c.targets.gl[0]}\u2013${c.targets.gl[1]}</b></div>
      <div class="preview-row"><span>Pure Fats</span><b>${c.targets.fats[0]}\u2013${c.targets.fats[1]} g</b></div>
      <div class="preview-row"><span>Protein</span><b>${c.targets.protein[0]}\u2013${c.targets.protein[1]} g</b></div>
    </div>
  `;
}

/* ---------------- COACH SCREENS ---------------- */
function outOfRangeFlags(client){
  const t = sumLog(client.log);
  return [
    {label:"Cal", ok: t.cal>=client.targets.calories[0] && t.cal<=client.targets.calories[1]},
    {label:"GL", ok: t.gl>=client.targets.gl[0] && t.gl<=client.targets.gl[1]},
    {label:"Fats", ok: t.fats>=client.targets.fats[0] && t.fats<=client.targets.fats[1]},
    {label:"Protein", ok: t.protein>=client.targets.protein[0] && t.protein<=client.targets.protein[1]},
  ];
}
function coachRoster(){
  const rows = CLIENTS.map(c=>{
    const flags = outOfRangeFlags(c);
    const unanswered = c.messages.filter(m=>m.from==="client").length;
    return `
      <div class="client-row" onclick="goCoach('detail','${c.id}')">
        <div class="avatar" style="background:${c.color}">${c.initials}</div>
        <div class="client-info">
          <div class="client-name">${c.name}</div>
          <div class="client-meta">${c.log.length} entries logged today \u00b7 ${unanswered} question${unanswered===1?'':'s'} from client</div>
          <div class="flag-row">${flags.map(f=>`<span class="flag ${f.ok?'ok':'bad'}">${f.label} ${f.ok?'\u2713':'\u2715'}</span>`).join("")}</div>
        </div>
        <span class="chev">\u203a</span>
      </div>`;
  }).join("");
  const totalFlags = CLIENTS.reduce((a,c)=>a+outOfRangeFlags(c).filter(f=>!f.ok).length,0);
  return `
    <div class="topbar"><h1 class="hdr">YOUR CLIENTS</h1><span class="logout-link" onclick="logout()">Log out</span></div>
    <div class="sub">${CLIENTS.length} active \u00b7 ${totalFlags} metrics need review today</div>
    ${rows}
  `;
}
function coachDetail(){
  const c = CLIENTS.find(x=>x.id===state.selectedClientId) || CLIENTS[0];
  const t = sumLog(c.log);
  return `
    <div class="back-row">
      <button class="back-btn" onclick="goCoach('roster')">\u2190</button>
      <div class="avatar" style="background:${c.color};width:32px;height:32px;font-size:11px;">${c.initials}</div>
      <div style="font-weight:700;font-size:14px;color:#fff;flex:1;">${c.name}</div>
      <span class="logout-link" onclick="logout()">Log out</span>
    </div>
    <div class="sub" style="padding-left:20px;">${state.dateLabel} \u00b7 monitoring today's uploaded data</div>
    <div class="card-dark">
      ${rangeBar("Calories", t.cal, c.targets.calories, " kcal")}
      ${rangeBar("Glycemic Load (GL)", t.gl, c.targets.gl, "")}
      ${rangeBar("Pure Fats", t.fats, c.targets.fats, "g")}
      ${rangeBar("Protein", t.protein, c.targets.protein, "g")}
    </div>
    ${foodTable(c.log, false)}
    <div class="add-food-box">
      <label class="small">SEND FEEDBACK \u2014 VISIBLE ONLY TO ${c.name.split(' ')[0].toUpperCase()}</label>
      <select id="feedbackSelect" style="margin-bottom:8px;">
        <option>Nice consistency today \u2014 keep it up.</option>
        <option>Try to hit your protein target tomorrow.</option>
        <option>Watch your GL \u2014 swap one high-GL item.</option>
        <option>Great job staying within calorie range today.</option>
      </select>
      <button class="btn btn-primary" style="width:100%;margin:0;" onclick="sendFeedback('${c.id}')">Send Feedback</button>
    </div>
    <div class="sub" style="margin-top:6px;">Conversation</div>
    ${messageThread(c.messages, "No messages yet.")}
  `;
}
function coachRequests(){
  const pending = pendingSignups();
  const rows = pending.map(s=>`
    <div class="pending-row">
      <div class="avatar" style="background:#556070">${initialsOf(s.name)}</div>
      <div class="client-info">
        <div class="client-name">${s.name}</div>
        <div class="client-meta">${s.email}</div>
        <div class="client-meta">Requested ${s.time}</div>
      </div>
      <div class="pending-actions">
        <button class="approve-btn" onclick="approveSignup('${s.id}')">Approve</button>
        <button class="decline-btn" onclick="declineSignup('${s.id}')">Decline</button>
      </div>
    </div>`).join("");
  return `
    <div class="topbar"><h1 class="hdr">NEW REQUESTS</h1><span class="logout-link" onclick="logout()">Log out</span></div>
    <div class="sub">${pending.length} client${pending.length===1?'':'s'} waiting on your approval</div>
    ${rows || `<div class="empty-note">No pending sign-up requests right now.</div>`}
  `;
}

/* ---------------- RENDER ---------------- */
function render(){
  const screenEl = document.getElementById("screen");
  const tabEl = document.getElementById("tabbar");
  const deviceEl = document.getElementById("device");

  if(!session.loggedIn){
    deviceEl.classList.remove("dark");
    screenEl.innerHTML = state.authView==="signup" ? signupScreen() : loginScreen();
    tabEl.innerHTML = "";
    return;
  }
  state.signupNotice = null;

  if(session.role==="client"){
    deviceEl.classList.remove("dark");
    const c = myClient();
    const unread = c.messages.filter(m=>m.from==="coach").length;
    if(state.clientScreen==="dashboard") screenEl.innerHTML = clientDashboard();
    else if(state.clientScreen==="log") screenEl.innerHTML = clientLog();
    else if(state.clientScreen==="messages") screenEl.innerHTML = clientMessages();

    tabEl.innerHTML = `
      <button class="${state.clientScreen==='dashboard'?'active':''}" onclick="goClient('dashboard')"><span class="dot"></span>Home</button>
      <button class="${state.clientScreen==='log'?'active':''}" onclick="goClient('log')"><span class="dot"></span>Log</button>
      <button class="${state.clientScreen==='messages'?'active':''}" onclick="goClient('messages')" style="position:relative;">
        <span class="dot"></span>Messages ${unread?`<span class="tab-badge">${unread}</span>`:''}
      </button>
    `;
  } else {
    deviceEl.classList.add("dark");
    if(state.coachScreen==="roster") screenEl.innerHTML = coachRoster();
    else if(state.coachScreen==="detail") screenEl.innerHTML = coachDetail();
    else if(state.coachScreen==="requests") screenEl.innerHTML = coachRequests();

    const pendingCount = pendingSignups().length;
    tabEl.innerHTML = `
      <button class="${state.coachScreen==='roster'?'active':''}" onclick="goCoach('roster')"><span class="dot"></span>Clients</button>
      <button class="${state.coachScreen==='detail'?'active':''}" onclick="goCoach('detail', state.selectedClientId||'priya')"><span class="dot"></span>Detail</button>
      <button class="${state.coachScreen==='requests'?'active':''}" onclick="goCoach('requests')" style="position:relative;">
        <span class="dot"></span>Requests ${pendingCount?`<span class="tab-badge">${pendingCount}</span>`:''}
      </button>
    `;
  }
}

render();