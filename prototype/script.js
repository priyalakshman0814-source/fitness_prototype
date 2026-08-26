/* =========================================================
   FITNESS APP
   Complete application logic
   Food source: food_database_clean.csv
   ========================================================= */


/* =========================================================
   1. FOOD DATABASE
   ========================================================= */

let FOOD_DB = [];
let foodDatabaseReady = false;
let foodDatabaseError = null;


/*
  CSV parser.
  Handles commas inside quoted values.
*/
function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(value.trim());
      value = "";

      if (row.some(v => v !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += char;
  }

  if (value !== "" || row.length) {
    row.push(value.trim());
    if (row.some(v => v !== "")) {
      rows.push(row);
    }
  }

  return rows;
}


function numberValue(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const n = parseFloat(cleaned);

  return Number.isFinite(n) ? n : 0;
}


function loadFoodDatabase() {
  fetch("./food_database_clean.csv")
    .then(response => {
      if (!response.ok) {
        throw new Error(
          "food_database_clean.csv could not be loaded."
        );
      }

      return response.text();
    })
    .then(csvText => {

      const rows = parseCSV(csvText);

      if (!rows.length) {
        throw new Error("Food database is empty.");
      }

      const headers = rows[0].map(h =>
        h.trim().toLowerCase()
      );

      const indexOf = name =>
        headers.indexOf(name.toLowerCase());

      const indexes = {
        id: indexOf("id"),
        name: indexOf("name"),
        portion: indexOf("portion_size"),
        protein: indexOf("protein_g"),
        greenCarbs: indexOf("green_carbs_g"),
        netCarbs: indexOf("net_carbs_g"),
        mixedFat: indexOf("mixed_fat_g"),
        pureFats: indexOf("pure_fats_g"),
        fiber: indexOf("fiber_g"),
        gi: indexOf("gi"),
        gl: indexOf("gl"),
        calories: indexOf("calories"),
        recommendation: indexOf("recommendation_type")
      };

      FOOD_DB = rows
        .slice(1)
        .map((row, index) => {

          const get = key => {
            const i = indexes[key];
            return i >= 0 ? row[i] : "";
          };

          const name = String(get("name") || "").trim();

          if (!name) return null;

          return {
            id: get("id") || `food_${index + 1}`,

            name,

            portion_size:
              String(get("portion") || "").trim(),

            protein_g:
              numberValue(get("protein")),

            green_carbs_g:
              numberValue(get("greenCarbs")),

            net_carbs_g:
              numberValue(get("netCarbs")),

            mixed_fat_g:
              numberValue(get("mixedFat")),

            pure_fats_g:
              numberValue(get("pureFats")),

            fiber_g:
              numberValue(get("fiber")),

            gi:
              numberValue(get("gi")),

            gl:
              numberValue(get("gl")),

            calories:
              numberValue(get("calories")),

            recommendation_type:
              String(get("recommendation") || "").trim()
          };
        })
        .filter(Boolean);

      foodDatabaseReady = true;

      console.log(
        "Food database loaded:",
        FOOD_DB.length,
        "foods"
      );

      render();
    })
    .catch(error => {

      foodDatabaseError = error.message;

      console.error(
        "Food database error:",
        error
      );

      render();
    });
}


/* =========================================================
   2. TARGETS
   Temporary demo targets.
   Later these will come from each client's plan.
   ========================================================= */

const TARGETS = {
  calories: [1400, 1800],
  gl: [30, 70],
  fats: [60, 120],
  protein: [40, 80]
};


const AVATAR_COLORS = [
  "#2A5DFF",
  "#FF5A4E",
  "#E8A93D",
  "#5C8A00",
  "#8A4FFF"
];


/* =========================================================
   3. BASIC HELPERS
   ========================================================= */

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}


function sumLog(log) {

  return log.reduce(
    (total, entry) => {

      total.cal += Number(entry.cal) || 0;
      total.gl += Number(entry.gl) || 0;
      total.netCarbs += Number(entry.netCarbs) || 0;
      total.fatCarbs += Number(entry.fatCarbs) || 0;
      total.fats += Number(entry.fats) || 0;
      total.protein += Number(entry.protein) || 0;
      total.fiber += Number(entry.fiber) || 0;

      return total;
    },
    {
      cal: 0,
      gl: 0,
      netCarbs: 0,
      fatCarbs: 0,
      fats: 0,
      protein: 0,
      fiber: 0
    }
  );
}


function foodNutrition(food) {

  return {

    name: food.name,

    serving:
      food.portion_size || "1 serving",

    cal:
      Number(food.calories) || 0,

    gl:
      Number(food.gl) || 0,

    netCarbs:
      Number(food.net_carbs_g) || 0,

    fatCarbs:
      Number(food.mixed_fat_g) || 0,

    fats:
      Number(food.pure_fats_g) || 0,

    protein:
      Number(food.protein_g) || 0,

    fiber:
      Number(food.fiber_g) || 0
  };
}


/*
  IMPORTANT:

  Quantity means number of database servings.

  Example:

  Database:
  Chapathi
  1 Roti - 35 g

  User:
  Quantity = 2

  Calculation:
  database nutrition × 2
*/
function mkEntry(food, qty, meal = "Meal") {

  const nutrition = foodNutrition(food);

  return {

    foodId:
      food.id,

    name:
      food.name,

    serving:
      nutrition.serving,

    recommendation:
      food.recommendation_type || "",

    meal,

    qty,

    cal:
      round1(nutrition.cal * qty),

    gl:
      round1(nutrition.gl * qty),

    netCarbs:
      round1(nutrition.netCarbs * qty),

    fatCarbs:
      round1(nutrition.fatCarbs * qty),

    fats:
      round1(nutrition.fats * qty),

    protein:
      round1(nutrition.protein * qty),

    fiber:
      round1(nutrition.fiber * qty),

    loggedAt:
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
  };
}


/* =========================================================
   4. SEARCH
   ========================================================= */

function normalizeSearch(text) {

  return String(text || "")
    .toLowerCase()
    .trim();
}


function searchFoods(query) {

  const q = normalizeSearch(query);

  if (!q) {
    return [];
  }

  const words = q.split(/\s+/);

  return FOOD_DB
    .map(food => {

      const name =
        food.name.toLowerCase();

      let score = 0;

      if (name === q) {
        score += 1000;
      }

      if (name.startsWith(q)) {
        score += 500;
      }

      if (name.includes(q)) {
        score += 250;
      }

      words.forEach(word => {

        if (name.startsWith(word)) {
          score += 80;
        }

        if (name.includes(word)) {
          score += 30;
        }
      });

      return {
        food,
        score
      };

    })
    .filter(item => item.score > 0)

    .sort((a, b) =>
      b.score - a.score ||
      a.food.name.localeCompare(b.food.name)
    )

    .slice(0, 12)

    .map(item => item.food);
}


function selectFood(foodId) {

  const food =
    FOOD_DB.find(
      f => f.id === foodId
    );

  if (!food) return;

  state.selectedFoodId = food.id;

  const search =
    document.getElementById("foodSearch");

  if (search) {
    search.value = food.name;
  }

  render();
}


/* =========================================================
   5. MEAL DETECTION
   Client doesn't need to enter meal type.
   ========================================================= */

function detectMeal() {

  const hour = new Date().getHours();

  if (hour < 11) {
    return "Breakfast";
  }

  if (hour < 15) {
    return "Lunch";
  }

  if (hour < 18) {
    return "Snack";
  }

  return "Dinner";
}


/* =========================================================
   6. CLIENT DATA
   ========================================================= */

const CLIENTS = [

  {
    id: "priya",

    initials: "PS",

    name: "Priya Sharma",

    color: "#2A5DFF",

    targets: TARGETS,

    password: "1234",

    log: [],

    messages: [
      {
        from: "coach",
        text:
          "Great consistency this week — keep logging every meal.",
        time:
          "Mon 17 Aug, 8:02 PM"
      }
    ]
  },

  {
    id: "arjun",

    initials: "AM",

    name: "Arjun Mehta",

    color: "#FF5A4E",

    targets: TARGETS,

    password: "1234",

    log: [],

    messages: []
  },

  {
    id: "kavya",

    initials: "KI",

    name: "Kavya Iyer",

    color: "#E8A93D",

    targets: TARGETS,

    password: "1234",

    log: [],

    messages: [
      {
        from: "coach",
        text:
          "Try to add a protein source at breakfast tomorrow.",
        time:
          "Mon 17 Aug, 7:40 PM"
      }
    ]
  },

  {
    id: "rohan",

    initials: "RD",

    name: "Rohan Das",

    color: "#2A5DFF",

    targets: TARGETS,

    password: "1234",

    log: [],

    messages: []
  }

];


const COACH = {
  name: "Coach Dev Verma",
  email: "farah@lanefit.app",
  password: "1234"
};


/* =========================================================
   7. SIGNUP
   ========================================================= */

let SIGNUP_SEQ = 1;

const SIGNUPS = [
  {
    id: "sig0",
    name: "Neha Kapoor",
    email: "neha@lanefit.app",
    password: "1234",
    status: "pending",
    time: "Mon 17 Aug, 6:15 PM"
  }
];


/* =========================================================
   8. SESSION / APP STATE
   ========================================================= */

let session = {

  loggedIn: false,

  role: null,

  clientId: null
};


let state = {

  clientScreen: "dashboard",

  coachScreen: "roster",

  selectedClientId: null,

  dateLabel: "Tue, 18 Aug",

  loginRole: "client",

  authView: "login",

  signupNotice: null,

  selectedFoodId: null,

  foodSearch: ""

};


/* =========================================================
   9. LOGIN
   ========================================================= */

function pickLoginRole(role) {

  state.loginRole = role;

  state.authView = "login";

  render();
}


function doLogin() {

  if (state.loginRole === "client") {

    const select =
      document.getElementById(
        "loginClientSelect"
      );

    if (!select) return;

    const id = select.value;

    session = {
      loggedIn: true,
      role: "client",
      clientId: id
    };

  } else {

    session = {
      loggedIn: true,
      role: "coach",
      clientId: null
    };
  }

  state.clientScreen = "dashboard";

  state.coachScreen = "roster";

  render();
}


function logout() {

  session = {
    loggedIn: false,
    role: null,
    clientId: null
  };

  render();
}


function goClient(screen) {

  state.clientScreen = screen;

  render();
}


function goCoach(screen, clientId) {

  state.coachScreen = screen;

  if (clientId) {
    state.selectedClientId = clientId;
  }

  render();
}


function shiftDate(dir) {

  if (dir > 0) {
    state.dateLabel = "Wed, 19 Aug";
  }

  else if (dir < 0) {
    state.dateLabel = "Mon, 17 Aug";
  }

  else {
    state.dateLabel = "Tue, 18 Aug";
  }

  render();
}


function myClient() {

  return CLIENTS.find(
    client => client.id === session.clientId
  );
}


/* =========================================================
   10. FOOD LOGGING
   ========================================================= */

function addSelectedFood() {

  if (!foodDatabaseReady) {

    alert(
      "Food database is still loading."
    );

    return;
  }


  const qtyInput =
    document.getElementById("foodQuantity");

  const qty =
    parseFloat(
      qtyInput?.value
    );


  if (!Number.isFinite(qty) || qty <= 0) {

    alert(
      "Please enter a valid quantity."
    );

    return;
  }


  if (!state.selectedFoodId) {

    alert(
      "Please select a food from the database."
    );

    return;
  }


  const food =
    FOOD_DB.find(
      f => f.id === state.selectedFoodId
    );


  if (!food) {

    alert(
      "Selected food was not found in the database."
    );

    return;
  }


  const client =
    myClient();


  if (!client) return;


  const meal =
    detectMeal();


  const entry =
    mkEntry(
      food,
      qty,
      meal
    );


  client.log.push(entry);


  state.selectedFoodId = null;

  state.foodSearch = "";

  goClient("log");
}


function removeMeEntry(index) {

  const client =
    myClient();

  if (!client) return;

  client.log.splice(
    index,
    1
  );

  render();
}


function clearMeLog() {

  const client =
    myClient();

  if (!client) return;


  if (!client.log.length) {
    return;
  }


  const confirmed =
    confirm(
      "Clear all food entries for today?"
    );


  if (!confirmed) {
    return;
  }


  client.log.length = 0;

  render();
}


/* =========================================================
   11. REMAINING TARGET
   ========================================================= */

function remaining(value, target) {

  const min = target[0];

  const max = target[1];


  if (value < min) {

    return {
      value: round1(min - value),
      text: "Need more",
      status: "low"
    };
  }


  if (value <= max) {

    return {
      value: round1(max - value),
      text: "Remaining",
      status: "good"
    };
  }


  return {
    value: round1(value - max),
    text: "Over",
    status: "high"
  };
}


function metricStatus(value, target) {

  if (
    value >= target[0] &&
    value <= target[1]
  ) {
    return "good";
  }

  if (value < target[0]) {
    return "low";
  }

  return "high";
}


/* =========================================================
   12. MESSAGING
   KEPT AS EXISTING FUNCTIONALITY
   ========================================================= */

function timeNow() {

  return (
    state.dateLabel +
    ", " +
    new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )
  );
}


function sendFeedback(clientId) {

  const select =
    document.getElementById(
      "feedbackSelect"
    );

  if (!select) return;


  const client =
    CLIENTS.find(
      c => c.id === clientId
    );

  if (!client) return;


  client.messages.unshift({

    from: "coach",

    text: select.value,

    time: timeNow()
  });


  render();
}


function askCoach() {

  const input =
    document.getElementById(
      "askCoachInput"
    );

  if (!input) return;


  const text =
    input.value.trim();


  if (!text) return;


  const client =
    myClient();


  if (!client) return;


  client.messages.unshift({

    from: "client",

    text,

    time: timeNow()
  });


  render();
}


/* =========================================================
   13. SIGNUP / APPROVAL
   ========================================================= */

function showSignup() {

  state.authView = "signup";

  render();
}


function cancelSignup() {

  state.authView = "login";

  render();
}


function initialsOf(name) {

  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


function submitSignup() {

  const name =
    document.getElementById(
      "signupName"
    ).value.trim();

  const email =
    document.getElementById(
      "signupEmail"
    ).value.trim();

  const password =
    document.getElementById(
      "signupPassword"
    ).value.trim() || "1234";


  if (!name || !email) {

    alert(
      "Please enter your name and email."
    );

    return;
  }


  SIGNUPS.unshift({

    id:
      "sig" +
      SIGNUP_SEQ++,

    name,

    email,

    password,

    status: "pending",

    time: timeNow()

  });


  state.authView = "login";

  state.loginRole = "client";

  state.signupNotice =
    "Request sent! Your coach will review it and approve your account before you can log in.";


  render();
}


function pendingSignups() {

  return SIGNUPS.filter(
    s => s.status === "pending"
  );
}


function approveSignup(id) {

  const signup =
    SIGNUPS.find(
      s => s.id === id
    );

  if (!signup) return;


  signup.status = "approved";


  CLIENTS.push({

    id: signup.id,

    initials:
      initialsOf(signup.name),

    name: signup.name,

    color:
      AVATAR_COLORS[
        CLIENTS.length %
        AVATAR_COLORS.length
      ],

    targets: TARGETS,

    password: signup.password,

    log: [],

    messages: [

      {
        from: "coach",

        text:
          "Welcome aboard! Log your first meal and I'll start reviewing your numbers.",

        time: timeNow()
      }

    ]

  });


  render();
}


function declineSignup(id) {

  const signup =
    SIGNUPS.find(
      s => s.id === id
    );

  if (!signup) return;


  signup.status = "declined";

  render();
}


/* =========================================================
   14. RANGE BAR
   ========================================================= */

function rangeBar(
  label,
  value,
  bounds,
  suffix = ""
) {

  const min = bounds[0];

  const max = bounds[1];

  const range =
    Math.max(
      max - min,
      1
    );


  const lo =
    Math.min(
      min,
      value
    ) -
    range * 0.15;


  const hi =
    Math.max(
      max,
      value
    ) +
    range * 0.15;


  const span =
    Math.max(
      hi - lo,
      1
    );


  const bandLeft =
    ((min - lo) / span) *
    100;


  const bandWidth =
    ((max - min) / span) *
    100;


  const markerLeft =
    Math.max(
      0,
      Math.min(
        100,
        ((value - lo) / span) * 100
      )
    );


  const inRange =
    value >= min &&
    value <= max;


  return `

    <div class="range">

      <div class="range-label">

        <span>${label}</span>

        <span>

          <b>
            ${round1(value)}${suffix}
          </b>

          <span style="opacity:.7">
            target ${min}–${max}${suffix}
          </span>

          <span
            class="status-pill ${inRange ? "in-range" : "out-range"}"
            style="margin-left:6px;"
          >
            ${inRange ? "In range" : "Out of range"}
          </span>

        </span>

      </div>


      <div class="range-track">

        <div
          class="range-band"
          style="
            left:${bandLeft}%;
            width:${bandWidth}%;
          "
        ></div>

        <div
          class="range-marker"
          style="
            left:${markerLeft}%;
            background:${inRange
              ? "var(--lime)"
              : "var(--coral)"};
          "
        ></div>

      </div>

    </div>
  `;
}


/* =========================================================
   15. FOOD TABLE
   ========================================================= */

function foodTable(
  log,
  editable = false
) {

  const totals =
    sumLog(log);


  const rows =
    log.map(
      (entry, index) => `

        <tr>

          <td>
            <span class="type-pill type-OR">
              ${entry.meal || "Meal"}
            </span>
          </td>


          <td>

            <b>${entry.name}</b>

            <br>

            <span
              style="
                color:var(--slate);
                font-size:9.5px;
              "
            >
              ${entry.qty} × ${entry.serving}
            </span>

          </td>


          <td>
            ${entry.qty}
          </td>


          <td>
            ${round1(entry.cal)}
          </td>


          <td>
            ${round1(entry.gl)}
          </td>


          <td>
            ${round1(entry.netCarbs)}
          </td>


          <td>
            ${round1(entry.fatCarbs)}
          </td>


          <td>
            ${round1(entry.fats)}
          </td>


          <td>
            ${round1(entry.protein)}
          </td>


          <td>
            ${round1(entry.fiber)}
          </td>


          ${
            editable
              ? `
                <td>
                  <span
                    class="rm-btn"
                    onclick="removeMeEntry(${index})"
                  >
                    ×
                  </span>
                </td>
              `
              : ""
          }

        </tr>
      `
    )
    .join("");


  return `

    <div class="table-wrap">

      <div class="table-scroll">

        <table>

          <thead>

            <tr>

              <th>Meal</th>

              <th>Food</th>

              <th>Qty</th>

              <th>Cal</th>

              <th>GL</th>

              <th>
                Net<br>Carbs
              </th>

              <th>
                Fat+<br>Carbs
              </th>

              <th>
                Pure<br>Fats
              </th>

              <th>
                Protein
              </th>

              <th>
                Fiber
              </th>

              ${
                editable
                  ? "<th></th>"
                  : ""
              }

            </tr>

          </thead>


          <tbody>

            ${
              rows ||
              `
                <tr>
                  <td
                    colspan="${editable ? 11 : 10}"
                    style="
                      text-align:center;
                      color:var(--slate);
                      padding:20px;
                    "
                  >
                    No food logged yet.
                  </td>
                </tr>
              `
            }


            <tr class="total-row">

              <td colspan="3">
                TOTAL
              </td>

              <td>
                ${round1(totals.cal)}
              </td>

              <td>
                ${round1(totals.gl)}
              </td>

              <td>
                ${round1(totals.netCarbs)}
              </td>

              <td>
                ${round1(totals.fatCarbs)}
              </td>

              <td>
                ${round1(totals.fats)}
              </td>

              <td>
                ${round1(totals.protein)}
              </td>

              <td>
                ${round1(totals.fiber)}
              </td>

              ${
                editable
                  ? "<td></td>"
                  : ""
              }

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/* =========================================================
   16. MESSAGE THREAD
   ========================================================= */

function messageThread(
  messages,
  emptyText
) {

  if (!messages.length) {

    return `
      <div class="empty-note">
        ${emptyText}
      </div>
    `;
  }


  return messages
    .map(
      message => `

        <div
          class="
            feedback-msg
            ${message.from === "client"
              ? "from-client"
              : ""}
          "
        >

          <div class="from">
            ${
              message.from === "coach"
                ? "COACH"
                : "YOU"
            }
          </div>

          <div class="txt">
            ${message.text}
          </div>

          <div class="time">
            ${message.time}
          </div>

        </div>
      `
    )
    .join("");
}


/* =========================================================
   17. LOGIN SCREEN
   KEPT
   ========================================================= */

function loginScreen() {

  const clientOptions =
    CLIENTS
      .map(
        client => `
          <option value="${client.id}">
            ${client.name}
          </option>
        `
      )
      .join("");


  const notice =
    state.signupNotice
      ? `
        <div class="pending-note">
          ${state.signupNotice}
        </div>
      `
      : "";


  return `

    <div class="login-wrap">

      <div class="brand">
        FIT
      </div>

      <div class="tagline">
        TRAIN. LOG. FINISH STRONG.
      </div>


      <div class="role-switch">

        <button
          class="${state.loginRole === "client"
            ? "active"
            : ""}"
          onclick="pickLoginRole('client')"
        >
          Client Login
        </button>

        <button
          class="${state.loginRole === "coach"
            ? "active"
            : ""}"
          onclick="pickLoginRole('coach')"
        >
          Coach Login
        </button>

      </div>


      ${notice}


      ${
        state.loginRole === "client"
          ? `

            <div class="login-field">

              <label>
                ACCOUNT (DEMO)
              </label>

              <select id="loginClientSelect">
                ${clientOptions}
              </select>

            </div>


            <div class="login-field">

              <label>
                EMAIL
              </label>

              <input
                value="priya@lanefit.app"
              >

            </div>


            <div class="login-field">

              <label>
                PASSWORD
              </label>

              <input
                type="password"
                value="1234"
              >

            </div>


            <div class="login-note">

              Logging in as a
              <b>Client</b> —
              you'll only see your own
              food log and targets,
              plus messages with your coach.

            </div>

          `
          : `

            <div class="login-field">

              <label>
                EMAIL
              </label>

              <input
                value="${COACH.email}"
              >

            </div>


            <div class="login-field">

              <label>
                PASSWORD
              </label>

              <input
                type="password"
                value="1234"
              >

            </div>


            <div class="login-note">

              Logging in as
              <b>Coach</b> —
              you'll see every client's
              uploaded data, approve
              new sign-ups, and message clients.

            </div>

          `
      }


      <button
        class="btn btn-primary"
        style="width:100%;margin:6px 0;"
        onclick="doLogin()"
      >
        Log In
      </button>


      ${
        state.loginRole === "client"
          ? `
            <button
              class="link-btn"
              onclick="showSignup()"
            >
              New here?
              Request a client account
            </button>
          `
          : ""
      }

    </div>

  `;
}


/* =========================================================
   18. SIGNUP SCREEN
   KEPT
   ========================================================= */

function signupScreen() {

  return `

    <div class="signup-wrap">

      <div
        class="brand"
        style="font-size:32px;"
      >
        FIT
      </div>


      <div class="signup-title">
        Request a client account
      </div>


      <div class="login-field">

        <label>
          FULL NAME
        </label>

        <input
          type="text"
          id="signupName"
          placeholder="Your name"
        >

      </div>


      <div class="login-field">

        <label>
          EMAIL
        </label>

        <input
          type="email"
          id="signupEmail"
          placeholder="you@example.com"
        >

      </div>


      <div class="login-field">

        <label>
          PASSWORD
        </label>

        <input
          type="password"
          id="signupPassword"
          placeholder="Choose a password"
        >

      </div>


      <div class="login-note">

        Your request goes to
        <b>${COACH.name}</b>
        for approval.

      </div>


      <button
        class="btn btn-primary"
        style="width:100%;margin:6px 0;"
        onclick="submitSignup()"
      >
        Send Request
      </button>


      <button
        class="link-btn"
        onclick="cancelSignup()"
      >
        Back to log in
      </button>

    </div>

  `;
}


/* =========================================================
   19. CLIENT HOME
   ========================================================= */

function clientDashboard() {

  const client =
    myClient();

  const totals =
    sumLog(client.log);


  const calorieRemaining =
    remaining(
      totals.cal,
      client.targets.calories
    );


  const proteinRemaining =
    remaining(
      totals.protein,
      client.targets.protein
    );


  const glRemaining =
    remaining(
      totals.gl,
      client.targets.gl
    );


  const lastCoachMessage =
    client.messages.find(
      message =>
        message.from === "coach"
    );


  return `

    <div class="topbar">

      <h1 class="hdr">
        HI,
        ${client.name
          .split(" ")[0]
          .toUpperCase()}
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="sub">
      ${state.dateLabel}
      · Today's progress
    </div>


    ${
      !foodDatabaseReady
        ? `
          <div class="card">
            ${
              foodDatabaseError
                ? `
                  <b>Food database error</b>
                  <br>
                  ${foodDatabaseError}
                `
                : `
                  Loading your food database...
                `
            }
          </div>
        `
        : ""
    }


    <div class="card-dark">

      ${rangeBar(
        "Calories",
        totals.cal,
        client.targets.calories,
        " kcal"
      )}

      ${rangeBar(
        "Glycemic Load",
        totals.gl,
        client.targets.gl,
        ""
      )}

      ${rangeBar(
        "Pure Fats",
        totals.fats,
        client.targets.fats,
        " g"
      )}

      ${rangeBar(
        "Protein",
        totals.protein,
        client.targets.protein,
        " g"
      )}

    </div>


    <div
      class="card"
      style="
        border-left:4px solid var(--cobalt);
      "
    >

      <div
        style="
          font-weight:700;
          color:var(--navy);
          margin-bottom:10px;
        "
      >
        What you have left
      </div>


      <div class="preview-row">

        <span>
          Calories
        </span>

        <b>
          ${
            calorieRemaining.text
          }
          ${
            calorieRemaining.value
          }
          kcal
        </b>

      </div>


      <div class="preview-row">

        <span>
          Protein
        </span>

        <b>
          ${
            proteinRemaining.text
          }
          ${
            proteinRemaining.value
          } g
        </b>

      </div>


      <div class="preview-row">

        <span>
          GL
        </span>

        <b>
          ${
            glRemaining.text
          }
          ${
            glRemaining.value
          }
        </b>

      </div>

    </div>


    <button
      class="btn btn-primary"
      onclick="goClient('log')"
    >
      + LOG FOOD
    </button>


    <div class="card">

      <div
        style="
          font-weight:600;
          font-size:13px;
          color:var(--navy);
          margin-bottom:8px;
        "
      >
        Today's Summary
      </div>


      <div class="preview-row">

        <span>
          Net Carbs
        </span>

        <b>
          ${round1(totals.netCarbs)} g
        </b>

      </div>


      <div class="preview-row">

        <span>
          Fat + Carbs
        </span>

        <b>
          ${round1(totals.fatCarbs)} g
        </b>

      </div>


      <div class="preview-row">

        <span>
          Fiber
        </span>

        <b>
          ${round1(totals.fiber)} g
        </b>

      </div>


      <div class="preview-row">

        <span>
          Foods logged
        </span>

        <b>
          ${client.log.length}
        </b>

      </div>

    </div>


    ${
      lastCoachMessage
        ? `

          <div
            class="card"
            style="
              border-color:var(--cobalt);
            "
          >

            <div
              style="
                font-weight:600;
                color:var(--cobalt);
                margin-bottom:6px;
              "
            >
              Latest from your coach
            </div>


            <div
              style="
                font-size:12px;
                color:var(--navy);
              "
            >
              ${lastCoachMessage.text}
            </div>


            <div
              style="
                font-size:10px;
                color:var(--slate);
                margin-top:4px;
              "
            >
              ${lastCoachMessage.time}
            </div>

          </div>

        `
        : ""
    }

  `;
}


/* =========================================================
   20. NEW CLIENT FOOD LOG
   ========================================================= */

function clientLog() {

  const client =
    myClient();


  const totals =
    sumLog(client.log);


  const query =
    state.foodSearch || "";


  const results =
    searchFoods(query);


  const selectedFood =
    FOOD_DB.find(
      food =>
        food.id === state.selectedFoodId
    );


  return `

    <div class="topbar">

      <h1 class="hdr">
        FOOD LOG
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="date-nav">

      <button
        onclick="shiftDate(-1)"
      >
        ‹
      </button>

      <span>
        ${state.dateLabel}, 2026
      </span>

      <button
        onclick="shiftDate(1)"
      >
        ›
      </button>

    </div>


    <!-- =========================================
         ADD FOOD
         ========================================= -->

    <div class="add-food-box">

      <div
        style="
          font-weight:700;
          font-size:15px;
          color:var(--navy);
          margin-bottom:4px;
        "
      >
        What did you eat?
      </div>


      <div
        style="
          color:var(--slate);
          font-size:11px;
          margin-bottom:12px;
        "
      >
        Search your food. Nutrition is calculated
        automatically from the food database.
      </div>


      ${
        !foodDatabaseReady
          ? `
            <div
              class="empty-note"
            >
              ${
                foodDatabaseError ||
                "Loading food database..."
              }
            </div>
          `
          : `

            <input
              id="foodSearch"
              type="text"
              value="${query.replace(/"/g, "&quot;")}"
              placeholder="🔍 Search food e.g. chapathi, rice, egg..."
              oninput="
                state.foodSearch=this.value;
                state.selectedFoodId=null;
                render();
                setTimeout(() => {
                  const el=document.getElementById('foodSearch');
                  if(el){
                    el.focus();
                    el.setSelectionRange(
                      el.value.length,
                      el.value.length
                    );
                  }
                },0);
              "
              style="
                width:100%;
                box-sizing:border-box;
                padding:13px;
                border:1px solid #ccd5df;
                border-radius:10px;
                font-size:13px;
                margin-bottom:8px;
              "
            >


            ${
              query && !selectedFood
                ? `

                  <div
                    style="
                      border:1px solid #dce2e8;
                      border-radius:10px;
                      background:#fff;
                      overflow:hidden;
                      margin-bottom:10px;
                    "
                  >

                    ${
                      results.length
                        ? results
                            .map(
                              food => `

                                <button
                                  onclick="
                                    state.selectedFoodId='${food.id}';
                                    render();
                                  "
                                  style="
                                    width:100%;
                                    text-align:left;
                                    border:0;
                                    border-bottom:1px solid #edf0f3;
                                    background:#fff;
                                    padding:11px;
                                    cursor:pointer;
                                  "
                                >

                                  <div
                                    style="
                                      font-weight:700;
                                      color:var(--navy);
                                      font-size:12px;
                                    "
                                  >
                                    ${food.name}
                                  </div>

                                  <div
                                    style="
                                      color:var(--slate);
                                      font-size:10px;
                                      margin-top:3px;
                                    "
                                  >
                                    ${food.portion_size || "1 serving"}
                                  </div>

                                </button>

                              `
                            )
                            .join("")
                        : `
                          <div
                            style="
                              padding:14px;
                              color:var(--slate);
                              font-size:12px;
                            "
                          >
                            No matching food found.
                          </div>
                        `
                    }

                  </div>

                `
                : ""
            }


            ${
              selectedFood
                ? `

                  <div
                    style="
                      border:2px solid var(--cobalt);
                      border-radius:12px;
                      padding:13px;
                      background:#f8fbff;
                      margin-top:8px;
                    "
                  >

                    <div
                      style="
                        font-size:15px;
                        font-weight:800;
                        color:var(--navy);
                      "
                    >
                      ${selectedFood.name}
                    </div>


                    <div
                      style="
                        color:var(--slate);
                        font-size:10px;
                        margin-top:3px;
                      "
                    >
                      1 serving:
                      ${
                        selectedFood.portion_size ||
                        "database serving"
                      }
                    </div>


                    <div
                      style="
                        display:grid;
                        grid-template-columns:
                          repeat(4,1fr);
                        gap:6px;
                        margin-top:12px;
                      "
                    >

                      <div
                        style="
                          background:#fff;
                          border-radius:7px;
                          padding:7px;
                          text-align:center;
                        "
                      >
                        <b>
                          ${round1(selectedFood.calories)}
                        </b>
                        <small>Cal</small>
                      </div>


                      <div
                        style="
                          background:#fff;
                          border-radius:7px;
                          padding:7px;
                          text-align:center;
                        "
                      >
                        <b>
                          ${round1(selectedFood.protein_g)}
                        </b>
                        <small>Protein</small>
                      </div>


                      <div
                        style="
                          background:#fff;
                          border-radius:7px;
                          padding:7px;
                          text-align:center;
                        "
                      >
                        <b>
                          ${round1(selectedFood.net_carbs_g)}
                        </b>
                        <small>Carbs</small>
                      </div>


                      <div
                        style="
                          background:#fff;
                          border-radius:7px;
                          padding:7px;
                          text-align:center;
                        "
                      >
                        <b>
                          ${round1(selectedFood.gl)}
                        </b>
                        <small>GL</small>
                      </div>

                    </div>


                    <div
                      style="
                        margin-top:12px;
                      "
                    >

                      <label
                        class="small"
                      >
                        HOW MANY?
                      </label>

                      <input
                        id="foodQuantity"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value="1"
                        style="
                          width:100%;
                          box-sizing:border-box;
                          padding:12px;
                          margin-top:4px;
                          border:1px solid #ccd5df;
                          border-radius:8px;
                          font-size:15px;
                        "
                      >

                    </div>


                    <div
                      style="
                        margin-top:10px;
                        color:var(--slate);
                        font-size:10px;
                      "
                    >
                      Example:
                      2 means 2 ×
                      ${
                        selectedFood.portion_size ||
                        "1 serving"
                      }
                    </div>


                    <button
                      class="btn btn-primary"
                      style="
                        width:100%;
                        margin-top:12px;
                      "
                      onclick="addSelectedFood()"
                    >
                      ADD FOOD
                    </button>

                  </div>

                `
                : ""
            }

          `
      }

    </div>


    <!-- =========================================
         TODAY'S NUTRITION
         ========================================= -->

    <div class="card">

      <div
        style="
          font-weight:700;
          color:var(--navy);
          margin-bottom:10px;
        "
      >
        Today's Nutrition
      </div>


      <div class="preview-row">

        <span>
          Calories
        </span>

        <b>
          ${round1(totals.cal)}
          /
          ${client.targets.calories[1]}
          kcal
        </b>

      </div>


      <div class="preview-row">

        <span>
          Protein
        </span>

        <b>
          ${round1(totals.protein)}
          /
          ${client.targets.protein[1]}
          g
        </b>

      </div>


      <div class="preview-row">

        <span>
          GL
        </span>

        <b>
          ${round1(totals.gl)}
          /
          ${client.targets.gl[1]}
        </b>

      </div>


      <div class="preview-row">

        <span>
          Pure Fats
        </span>

        <b>
          ${round1(totals.fats)}
          /
          ${client.targets.fats[1]}
          g
        </b>

      </div>

    </div>


    <!-- =========================================
         FOOD HISTORY
         ========================================= -->

    <div
      style="
        font-weight:700;
        color:var(--navy);
        font-size:13px;
        margin:12px 0 7px;
      "
    >
      Today's Food
    </div>


    ${foodTable(client.log, true)}


    <button
      class="btn btn-danger"
      style="
        width:100%;
        margin-top:10px;
      "
      onclick="clearMeLog()"
    >
      CLEAR TODAY'S FOOD
    </button>

  `;
}


/* =========================================================
   21. CLIENT PROGRESS
   ========================================================= */

function clientProgress() {

  const client =
    myClient();

  const totals =
    sumLog(client.log);


  return `

    <div class="topbar">

      <h1 class="hdr">
        PROGRESS
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="sub">
      Your nutrition progress
    </div>


    <div class="card-dark">

      ${rangeBar(
        "Calories",
        totals.cal,
        client.targets.calories,
        " kcal"
      )}

      ${rangeBar(
        "Protein",
        totals.protein,
        client.targets.protein,
        " g"
      )}

      ${rangeBar(
        "GL",
        totals.gl,
        client.targets.gl,
        ""
      )}

      ${rangeBar(
        "Pure Fats",
        totals.fats,
        client.targets.fats,
        " g"
      )}

    </div>


    <div class="card">

      <div
        style="
          font-weight:700;
          color:var(--navy);
          margin-bottom:10px;
        "
      >
        Today's totals
      </div>


      <div class="preview-row">
        <span>Calories</span>
        <b>${round1(totals.cal)} kcal</b>
      </div>


      <div class="preview-row">
        <span>Protein</span>
        <b>${round1(totals.protein)} g</b>
      </div>


      <div class="preview-row">
        <span>Net Carbs</span>
        <b>${round1(totals.netCarbs)} g</b>
      </div>


      <div class="preview-row">
        <span>Fiber</span>
        <b>${round1(totals.fiber)} g</b>
      </div>

    </div>

  `;
}


/* =========================================================
   22. CLIENT CONVERSATION
   KEPT
   ========================================================= */

function clientMessages() {

  const client =
    myClient();


  return `

    <div class="topbar">

      <h1 class="hdr">
        MESSAGES
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="sub">
      Conversation with
      ${COACH.name}
    </div>


    <div class="ask-box">

      <label class="small">
        ASK YOUR COACH A QUESTION
      </label>


      <textarea
        id="askCoachInput"
        placeholder="e.g. Can I swap dal for paneer today?"
      ></textarea>


      <button
        class="btn btn-primary"
        style="
          width:100%;
          margin:8px 0 0;
        "
        onclick="askCoach()"
      >
        Send Question
      </button>

    </div>


    ${messageThread(
      client.messages,
      "No messages yet."
    )}


    <div class="card">

      <div
        style="
          font-weight:600;
          font-size:13px;
          color:var(--navy);
          margin-bottom:8px;
        "
      >
        Your Targets
      </div>


      <div class="preview-row">
        <span>Calories</span>
        <b>
          ${client.targets.calories[0]}
          –
          ${client.targets.calories[1]}
          kcal
        </b>
      </div>


      <div class="preview-row">
        <span>GL</span>
        <b>
          ${client.targets.gl[0]}
          –
          ${client.targets.gl[1]}
        </b>
      </div>


      <div class="preview-row">
        <span>Pure Fats</span>
        <b>
          ${client.targets.fats[0]}
          –
          ${client.targets.fats[1]}
          g
        </b>
      </div>


      <div class="preview-row">
        <span>Protein</span>
        <b>
          ${client.targets.protein[0]}
          –
          ${client.targets.protein[1]}
          g
        </b>
      </div>

    </div>

  `;
}


/* =========================================================
   23. COACH
   ========================================================= */

function outOfRangeFlags(client) {

  const totals =
    sumLog(client.log);


  return [

    {
      label: "Cal",

      ok:
        metricStatus(
          totals.cal,
          client.targets.calories
        ) === "good"
    },

    {
      label: "GL",

      ok:
        metricStatus(
          totals.gl,
          client.targets.gl
        ) === "good"
    },

    {
      label: "Fats",

      ok:
        metricStatus(
          totals.fats,
          client.targets.fats
        ) === "good"
    },

    {
      label: "Protein",

      ok:
        metricStatus(
          totals.protein,
          client.targets.protein
        ) === "good"
    }

  ];
}


function coachRoster() {

  const rows =
    CLIENTS
      .map(client => {

        const flags =
          outOfRangeFlags(client);

        const unanswered =
          client.messages.filter(
            message =>
              message.from === "client"
          ).length;


        return `

          <div
            class="client-row"
            onclick="
              goCoach(
                'detail',
                '${client.id}'
              )
            "
          >

            <div
              class="avatar"
              style="
                background:${client.color}
              "
            >
              ${client.initials}
            </div>


            <div class="client-info">

              <div class="client-name">
                ${client.name}
              </div>


              <div class="client-meta">
                ${client.log.length}
                foods logged today
                ·
                ${unanswered}
                question${unanswered === 1 ? "" : "s"}
              </div>


              <div class="flag-row">

                ${flags
                  .map(
                    flag => `

                      <span
                        class="
                          flag
                          ${flag.ok
                            ? "ok"
                            : "bad"}
                        "
                      >
                        ${flag.label}
                        ${flag.ok ? "✓" : "!"}
                      </span>

                    `
                  )
                  .join("")}

              </div>

            </div>


            <span class="chev">
              ›
            </span>

          </div>

        `;
      })
      .join("");


  const totalFlags =
    CLIENTS.reduce(
      (total, client) =>
        total +
        outOfRangeFlags(client)
          .filter(flag => !flag.ok)
          .length,
      0
    );


  return `

    <div class="topbar">

      <h1 class="hdr">
        YOUR CLIENTS
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="sub">

      ${CLIENTS.length}
      active

      ·

      ${totalFlags}
      metrics need review today

    </div>


    ${rows}

  `;
}


/* =========================================================
   24. COACH CLIENT DETAIL
   ========================================================= */

function coachDetail() {

  const client =
    CLIENTS.find(
      c =>
        c.id ===
        state.selectedClientId
    ) || CLIENTS[0];


  const totals =
    sumLog(client.log);


  return `

    <div class="back-row">

      <button
        class="back-btn"
        onclick="
          goCoach('roster')
        "
      >
        ←
      </button>


      <div
        class="avatar"
        style="
          background:${client.color};
          width:32px;
          height:32px;
          font-size:11px;
        "
      >
        ${client.initials}
      </div>


      <div
        style="
          font-weight:700;
          font-size:14px;
          color:#fff;
          flex:1;
        "
      >
        ${client.name}
      </div>


      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div
      class="sub"
      style="padding-left:20px;"
    >
      ${state.dateLabel}
      · today's nutrition
    </div>


    <div class="card-dark">

      ${rangeBar(
        "Calories",
        totals.cal,
        client.targets.calories,
        " kcal"
      )}

      ${rangeBar(
        "Glycemic Load",
        totals.gl,
        client.targets.gl,
        ""
      )}

      ${rangeBar(
        "Pure Fats",
        totals.fats,
        client.targets.fats,
        " g"
      )}

      ${rangeBar(
        "Protein",
        totals.protein,
        client.targets.protein,
        " g"
      )}

    </div>


    <div class="card">

      <div
        style="
          font-weight:700;
          color:var(--navy);
          margin-bottom:8px;
        "
      >
        Nutrition summary
      </div>


      <div class="preview-row">
        <span>Calories</span>
        <b>${round1(totals.cal)} kcal</b>
      </div>


      <div class="preview-row">
        <span>Protein</span>
        <b>${round1(totals.protein)} g</b>
      </div>


      <div class="preview-row">
        <span>Net Carbs</span>
        <b>${round1(totals.netCarbs)} g</b>
      </div>


      <div class="preview-row">
        <span>Fiber</span>
        <b>${round1(totals.fiber)} g</b>
      </div>

    </div>


    <div
      style="
        font-weight:700;
        color:#fff;
        margin:10px 0 6px;
        padding-left:2px;
      "
    >
      FOOD LOG
    </div>


    ${foodTable(client.log, false)}


    <div class="add-food-box">

      <label class="small">
        SEND FEEDBACK —
        VISIBLE ONLY TO
        ${client.name
          .split(" ")[0]
          .toUpperCase()}
      </label>


      <select
        id="feedbackSelect"
        style="margin-bottom:8px;"
      >

        <option>
          Nice consistency today — keep it up.
        </option>

        <option>
          Try to hit your protein target tomorrow.
        </option>

        <option>
          Watch your GL — swap one high-GL item.
        </option>

        <option>
          Great job staying within calorie range today.
        </option>

      </select>


      <button
        class="btn btn-primary"
        style="width:100%;"
        onclick="
          sendFeedback('${client.id}')
        "
      >
        Send Feedback
      </button>

    </div>


    <div
      class="sub"
      style="margin-top:6px;"
    >
      Conversation
    </div>


    ${messageThread(
      client.messages,
      "No messages yet."
    )}

  `;
}


/* =========================================================
   25. COACH REQUESTS
   ========================================================= */

function coachRequests() {

  const pending =
    pendingSignups();


  const rows =
    pending
      .map(
        signup => `

          <div class="pending-row">

            <div
              class="avatar"
              style="background:#556070"
            >
              ${initialsOf(
                signup.name
              )}
            </div>


            <div class="client-info">

              <div class="client-name">
                ${signup.name}
              </div>

              <div class="client-meta">
                ${signup.email}
              </div>

              <div class="client-meta">
                Requested
                ${signup.time}
              </div>

            </div>


            <div class="pending-actions">

              <button
                class="approve-btn"
                onclick="
                  approveSignup(
                    '${signup.id}'
                  )
                "
              >
                Approve
              </button>


              <button
                class="decline-btn"
                onclick="
                  declineSignup(
                    '${signup.id}'
                  )
                "
              >
                Decline
              </button>

            </div>

          </div>

        `
      )
      .join("");


  return `

    <div class="topbar">

      <h1 class="hdr">
        NEW REQUESTS
      </h1>

      <span
        class="logout-link"
        onclick="logout()"
      >
        Log out
      </span>

    </div>


    <div class="sub">

      ${pending.length}
      client${pending.length === 1 ? "" : "s"}
      waiting on approval

    </div>


    ${
      rows ||
      `
        <div class="empty-note">
          No pending sign-up requests right now.
        </div>
      `
    }

  `;
}


/* =========================================================
   26. RENDER
   ========================================================= */

function render() {

  const screenEl =
    document.getElementById(
      "screen"
    );

  const tabEl =
    document.getElementById(
      "tabbar"
    );

  const deviceEl =
    document.getElementById(
      "device"
    );


  if (
    !screenEl ||
    !tabEl ||
    !deviceEl
  ) {

    console.error(
      "Required app elements are missing."
    );

    return;
  }


  /* -------------------------
     LOGGED OUT
     ------------------------- */

  if (!session.loggedIn) {

    deviceEl.classList.remove(
      "dark"
    );


    screenEl.innerHTML =
      state.authView === "signup"
        ? signupScreen()
        : loginScreen();


    tabEl.innerHTML = "";

    return;
  }


  state.signupNotice = null;


  /* =====================================================
     CLIENT
     ===================================================== */

  if (session.role === "client") {

    deviceEl.classList.remove(
      "dark"
    );


    const client =
      myClient();


    if (!client) {

      session.loggedIn = false;

      render();

      return;
    }


    const unread =
      client.messages.filter(
        message =>
          message.from === "coach"
      ).length;


    if (
      state.clientScreen ===
      "dashboard"
    ) {

      screenEl.innerHTML =
        clientDashboard();

    }

    else if (
      state.clientScreen ===
      "log"
    ) {

      screenEl.innerHTML =
        clientLog();

    }

    else if (
      state.clientScreen ===
      "progress"
    ) {

      screenEl.innerHTML =
        clientProgress();

    }

    else if (
      state.clientScreen ===
      "messages"
    ) {

      screenEl.innerHTML =
        clientMessages();

    }


    tabEl.innerHTML = `

      <button
        class="${
          state.clientScreen === "dashboard"
            ? "active"
            : ""
        }"
        onclick="
          goClient('dashboard')
        "
      >
        <span class="dot"></span>
        Home
      </button>


      <button
        class="${
          state.clientScreen === "log"
            ? "active"
            : ""
        }"
        onclick="
          goClient('log')
        "
      >
        <span class="dot"></span>
        Diet
      </button>


      <button
        class="${
          state.clientScreen === "progress"
            ? "active"
            : ""
        }"
        onclick="
          goClient('progress')
        "
      >
        <span class="dot"></span>
        Progress
      </button>


      <button
        class="${
          state.clientScreen === "messages"
            ? "active"
            : ""
        }"
        onclick="
          goClient('messages')
        "
        style="position:relative;"
      >

        <span class="dot"></span>

        Chat

        ${
          unread
            ? `
              <span
                class="tab-badge"
              >
                ${unread}
              </span>
            `
            : ""
        }

      </button>

    `;

    return;
  }


  /* =====================================================
     COACH
     ===================================================== */

  deviceEl.classList.add(
    "dark"
  );


  if (
    state.coachScreen ===
    "roster"
  ) {

    screenEl.innerHTML =
      coachRoster();

  }

  else if (
    state.coachScreen ===
    "detail"
  ) {

    screenEl.innerHTML =
      coachDetail();

  }

  else if (
    state.coachScreen ===
    "requests"
  ) {

    screenEl.innerHTML =
      coachRequests();

  }


  const pendingCount =
    pendingSignups().length;


  tabEl.innerHTML = `

    <button
      class="${
        state.coachScreen === "roster"
          ? "active"
          : ""
      }"
      onclick="
        goCoach('roster')
      "
    >
      <span class="dot"></span>
      Clients
    </button>


    <button
      class="${
        state.coachScreen === "detail"
          ? "active"
          : ""
      }"
      onclick="
        goCoach(
          'detail',
          state.selectedClientId || 'priya'
        )
      "
    >
      <span class="dot"></span>
      Client
    </button>


    <button
      class="${
        state.coachScreen === "requests"
          ? "active"
          : ""
      }"
      onclick="
        goCoach('requests')
      "
      style="position:relative;"
    >

      <span class="dot"></span>

      Requests

      ${
        pendingCount
          ? `
            <span
              class="tab-badge"
            >
              ${pendingCount}
            </span>
          `
          : ""
      }

    </button>

  `;
}


/* =========================================================
   27. START APPLICATION
   ========================================================= */

loadFoodDatabase();
