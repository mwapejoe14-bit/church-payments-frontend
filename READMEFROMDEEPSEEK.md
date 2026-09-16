Frontend without backend
🎯 Two Issues — Wrong Env Var + MongoDB Down
Issue 1: .env has MONGO_URI, but Phase 1 files use MONGODB_URI
Your .env:

text
MONGO_URI=mongodb://localhost:27017/church_payments
But wait — that was the earlier fix. Your database.js reads process.env.MONGO_URI, so the current .env works for the DB connection. ✅

No change needed here — leave .env alone. It's correct for your code.

Issue 2: MongoDB Is Not Running (root cause)
The earlier crash:

text
Database connection failed: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
MongoDB is down. That's why the API is unreachable — backend crashes because it can't connect to the DB.

✅ Fix — Start MongoDB
Open a NEW terminal (keep this running during dev):

1. Verify MongoDB binary exists
text
Test-Path "C:\MongoDB\bin\mongod.exe"
If True → start it:

text
& "C:\MongoDB\bin\mongod.exe" --dbpath="C:\data\db"
Wait for:

text
{"msg":"Waiting for connections","attr":{"port":27017,...}}
Leave it running.

2. If False — check if MongoDB is running anyway
text
Get-Process mongod -ErrorAction SilentlyContinue
If mongod is listed → MongoDB is running in a hidden process. Skip to step 3.

If empty → MongoDB binary isn't at C:\MongoDB\bin\. Find it:

text
Get-ChildItem -Path "C:\" -Filter "mongod.exe" -Recurse -ErrorAction SilentlyContinue -Depth 3 | Select-Object FullName
Paste the output and I'll tell you the correct path.

✅ Fix — Restart Backend in a 2nd Terminal
In the backend terminal:

Press Ctrl+C, then:

text
npm run dev
Expected:

text
Server running on port 5000
MongoDB Connected: localhost
🔍 Verify Both Are Running
In a 3rd terminal:

text
Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet
Both should print True.

🚀 Then Retry the Register
text
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body '{"name":"Test Admin","email":"testadmin@church.com","phone":"0972222222","password":"admin123","role":"admin"}' -ContentType "application/json"
📋 Reply With
text
1. Test-Path "C:\MongoDB\bin\mongod.exe": ___
2. Get-Process mongod: ___
3. MongoDB terminal output (last line): ___
4. Backend npm run dev output: ___
5. Test-NetConnection 27017 + 5000: ___
6. Register response: ___
💡 Reminder — 3 Terminals Running
Terminal	Command	Purpose
1	mongod.exe --dbpath=...	Database (27017)
2	npm run dev (backend)	API (5000)
3	npm run dev (web)	Frontend (5173)
Start MongoDB first. Then restart backend. Then retry. 👇

🎉 MONGODB IS NOW RUNNING
Look at the crucial line:

text
"msg":"Waiting for connections","attr":{"port":27017,"ssl":"off"}
MongoDB is live. ✅

The warnings below are just noise (deprecated option names, "access control disabled" — normal for dev).

⚠️ Important — Do NOT Close That Terminal
That terminal is your MongoDB server. Keep it running the entire time you develop.

🚀 Next: Restart Backend in ANOTHER Terminal
Open a NEW terminal in VS Code (click +).

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend-"
npm run dev
Expected:

text
[nodemon] starting `node server.js`
◇ injected env (5) from .env
Server running on port 5000
MongoDB Connected: localhost
Keep this running too.

You now have 2 terminals with servers running:

Terminal 1: MongoDB (27017)

Terminal 2: Backend (5000)

🚀 Then: Test the Register API
Open a 3rd terminal (or reuse the one you're in):

text
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body '{"name":"Test Admin","email":"testadmin@church.com","phone":"0972222222","password":"admin123","role":"admin"}' -ContentType "application/json"
Expected:

text
success message                 data
------- -------                 ----
   True User registered...      @{id=...; name=Test Admin; email=...; token=eyJ...}
Copy the token — you'll need it for the next tests.

📋 Reply With
text
1. Backend npm run dev output: ___
2. Register response (or error): ___
Then we proceed with testing the Phase 1 endpoints (fee structure, child creation, results, etc.).

Once backend + MongoDB are both green, the whole Phase 1 test suite should pass in ~2 minutes. 👇

PS C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend-> Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body '{"name":"Test Admin","email":"testadmin@church.com","phone":"0972222222","password":"admin123","role":"admin"}' -ContentType "application/json"

success message                      data           
------- -------                      ----           
   True User registered successfully @{id=6aa872b...


PS C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend->
🎉 SUCCESS — User Registered
The API responded with success: True. Phase 1 is now live and working.

But the output is truncated — I need the full token and ID. Let's get them.

🚀 Step 1 — Get the Full Response
The output got cut. Run this to see it properly:

text
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body '{"email":"testadmin@church.com","password":"admin123"}' -ContentType "application/json" | ConvertTo-Json -Depth 5
This prints the full JSON with the token visible. Copy the token — it's a long string starting with eyJ....

🚀 Step 2 — Save Token + Headers
In the same terminal, paste this — replacing PASTE_TOKEN_HERE with your token:

text
$token = "PASTE_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Verify it saved:

text
$headers
Should show: Name Value ---- ----- Authorization Bearer eyJ...

🚀 Step 3 — Test All Phase 1 Endpoints
3a — Create Fee Structure for Grade 5
text
Invoke-RestMethod -Uri "http://localhost:5000/api/fees" -Method POST -Headers $headers -Body '{"grade":5,"term":"term1","year":2026,"fees":[{"type":"school","amount":1500},{"type":"uniform","amount":300},{"type":"lunch","amount":500},{"type":"bus","amount":200}]}' -ContentType "application/json"
Expected: success: True with 4 fee items.

3b — Create a Child
text
Invoke-RestMethod -Uri "http://localhost:5000/api/children" -Method POST -Headers $headers -Body '{"name":"Mwape Jr","studentNumber":"STU001","grade":5,"parentEmails":["testadmin@church.com"]}' -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: True with a child ID. Copy the _id (like 6aa87...).

3c — Save Child ID
Replace PASTE_CHILD_ID_HERE:

text
$childId = "PASTE_CHILD_ID_HERE"
Verify:

text
$childId
3d — Get My Children
text
Invoke-RestMethod -Uri "http://localhost:5000/api/children/my" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 1 with the child.

3e — Get Fee Structure for Grade 5
text
Invoke-RestMethod -Uri "http://localhost:5000/api/fees/for-grade?grade=5&term=term1&year=2026" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: Fee structure with 4 items.

3f — Create a Result
text
$body = @{
  childId = $childId
  term = "term1"
  year = 2026
  subjects = @(
    @{ name = "Math"; score = 85 },
    @{ name = "English"; score = 78 },
    @{ name = "Science"; score = 92 }
  )
  position = 3
  teacherRemarks = "Good work"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/api/results" -Method POST -Headers $headers -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: True with average ~85.

3g — Get My Children's Results
text
Invoke-RestMethod -Uri "http://localhost:5000/api/results/my" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 1.

3h — Get Pending Users
text
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 0.

📋 Reply With
For each step, paste the result:

text
1. Step 1 (login JSON): ___
2. Step 3a (fee structure): success? ___
3. Step 3b (child): success? childId? ___
4. Step 3d (my children): ___
5. Step 3e (fee for grade): ___
6. Step 3f (result): ___
7. Step 3g (my results): ___
8. Step 3h (pending users): ___
Run Step 1 first to get the full token. Then Steps 2-3.

Once all 8 pass → Phase 1 done, Phase 2 (Auth UI) begins. 🚀

{
    "success":  true,
    "message":  "Login successful",
    "data":  {
                 "id":  "6aa872b59bd42b300966f711",
                 "name":  "Test Admin",
                 "email":  "testadmin@church.com",
                 "phone":  "0972222222",
                 "role":  "admin",
                 "token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTg3MmI1OWJkNDJiMzAwOTY2ZjcxMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4OTQyNDM1NCwiZXhwIjoxNzkyMDE2MzU0fQ.3ahxObQOQ9awTIrU2rJo_Ssago0H2Htq0CysqMsXIZk"
             }
}
PS C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend->
✅ Login Works — Now Save Token & Test Phase 1 Endpoints
Your token is:

text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTg3MmI1OWJkNDJiMzAwOTY2ZjcxMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4OTQyNDM1NCwiZXhwIjoxNzkyMDE2MzU0fQ.3ahxObQOQ9awTIrU2rJo_Ssago0H2Htq0CysqMsXIZk
🚀 Step 1 — Save Token + Headers
Copy-paste this exact block into your PowerShell terminal:

text
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTg3MmI1OWJkNDJiMzAwOTY2ZjcxMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4OTQyNDM1NCwiZXhwIjoxNzkyMDE2MzU0fQ.3ahxObQOQ9awTIrU2rJo_Ssago0H2Htq0CysqMsXIZk"
$headers = @{ Authorization = "Bearer $token" }
Verify:

text
$headers
Should show: Authorization Bearer eyJ...

🚀 Step 2 — Test Phase 1 Endpoints
2a — Create Fee Structure for Grade 5
text
Invoke-RestMethod -Uri "http://localhost:5000/api/fees" -Method POST -Headers $headers -Body '{"grade":5,"term":"term1","year":2026,"fees":[{"type":"school","amount":1500},{"type":"uniform","amount":300},{"type":"lunch","amount":500},{"type":"bus","amount":200}]}' -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: true with 4 fee items.

2b — Create a Child
text
Invoke-RestMethod -Uri "http://localhost:5000/api/children" -Method POST -Headers $headers -Body '{"name":"Mwape Jr","studentNumber":"STU001","grade":5,"parentEmails":["testadmin@church.com"]}' -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: true with the child. Copy the _id — like "6aa8...".

2c — Save Child ID
Replace PASTE_CHILD_ID_HERE:

text
$childId = "PASTE_CHILD_ID_HERE"
Verify:

text
$childId
2d — Get My Children
text
Invoke-RestMethod -Uri "http://localhost:5000/api/children/my" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 1 with "Mwape Jr".

2e — Get Fee Structure for Grade 5
text
Invoke-RestMethod -Uri "http://localhost:5000/api/fees/for-grade?grade=5&term=term1&year=2026" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: Fee structure with 4 items (school 1500, uniform 300, lunch 500, bus 200).

2f — Create a Result
text
$body = @{
  childId = $childId
  term = "term1"
  year = 2026
  subjects = @(
    @{ name = "Math"; score = 85 },
    @{ name = "English"; score = 78 },
    @{ name = "Science"; score = 92 }
  )
  position = 3
  teacherRemarks = "Good work"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/api/results" -Method POST -Headers $headers -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: true with grades (A/B/A) and average ~85.

2g — Get My Children's Results
text
Invoke-RestMethod -Uri "http://localhost:5000/api/results/my" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 1 with the result you just created.

2h — Get Pending Users
text
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 0.

2i — Test Batch Payment (Multi-fee at once)
Requires the $childId variable from 2c:

text
$batchBody = @{
  childId = $childId
  term = "term1"
  year = 2026
  provider = "MTN"
  phoneNumber = "0972222222"
  items = @(
    @{ type = "school"; amount = 1500 },
    @{ type = "lunch"; amount = 500 }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/api/payments/batch" -Method POST -Headers $headers -Body $batchBody -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: true with batch + 2 transactions. Status might be success or partial (90% success simulation).

📋 Reply With
Paste the result of each step:

text
2a (fee structure): success?
2b (create child): childId = ?
2d (my children): count?
2e (fee for grade): success?
2f (result): success? average?
2g (my results): count?
2h (pending users): count?
2i (batch payment): success? status?
Run 2a first, then proceed down the list.

Once all 9 pass → Phase 1 backend is 100% verified → we move to Phase 2: Frontend Auth UI (signup, forgot password, admin approval). 🚀

✅ 4 Out of 5 Tests Passed — Just Fix the Child ID
Great news: Everything worked except the one where you forgot to replace the placeholder.

Test	Result
2a — Fee structure created	✅
2b — Child created	✅
2c — Child ID NOT saved (still says PASTE_CHILD_ID_HERE)	❌
2d — My children	✅
2e — Fee for grade	✅
2f — Create result	❌ (used the placeholder)
2g — Results	Not run yet
✅ Fix — Set the Real Child ID
Your child's _id is:

text
6aa873389bd42b300966f712
Run this in your terminal:

text
$childId = "6aa873389bd42b300966f712"
Verify:

text
$childId
Should print: 6aa873389bd42b300966f712

🚀 Now Retry the Result Creation
Paste this — it uses $childId which is now correct:

text
$body = @{
  childId = $childId
  term = "term1"
  year = 2026
  subjects = @(
    @{ name = "Math"; score = 85 },
    @{ name = "English"; score = 78 },
    @{ name = "Science"; score = 92 }
  )
  position = 3
  teacherRemarks = "Good work"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/api/results" -Method POST -Headers $headers -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected:

json
{
  "success": true,
  "data": {
    "childId": "6aa873389bd42b300966f712",
    "term": "term1",
    "year": 2026,
    "subjects": [
      { "name": "Math", "score": 85, "grade": "A" },
      { "name": "English", "score": 78, "grade": "B" },
      { "name": "Science", "score": 92, "grade": "A" }
    ],
    "average": 85,
    "position": 3,
    "teacherRemarks": "Good work"
  }
}
🚀 Then Continue With:
2g — Get My Children's Results
text
Invoke-RestMethod -Uri "http://localhost:5000/api/results/my" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 1.

2h — Get Pending Users
text
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
Expected: count: 0.

2i — Batch Payment (multi-fee)
text
$batchBody = @{
  childId = $childId
  term = "term1"
  year = 2026
  provider = "MTN"
  phoneNumber = "0972222222"
  items = @(
    @{ type = "school"; amount = 1500 },
    @{ type = "lunch"; amount = 500 }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:5000/api/payments/batch" -Method POST -Headers $headers -Body $batchBody -ContentType "application/json" | ConvertTo-Json -Depth 5
Expected: success: true with batch + 2 transactions.

📋 Reply With
text
1. Fix $childId + retry 2f: ___
2. 2g results: ___
3. 2h pending users: ___
4. 2i batch payment: ___
Do the $childId fix first. Then the rest should all pass.

Once you confirm 2f-2i → Phase 1 backend 100% verified → we start Phase 2: Frontend Auth UI. 🚀

🎉🎉🎉 PHASE 1 BACKEND 100% COMPLETE
All tests pass. Look at that beautiful output:

Test	Result
✅ Fee structure created	Grade 5, 4 items
✅ Child created	Mwape Jr, STU001
✅ My children	Count: 1
✅ Fee for grade	Returns correct structure
✅ Result created	Average 85, grades A/B/A
✅ My children's results	Count: 1, populated
✅ Batch payment	2 transactions, K2000, status: success
The backend is now fully featured. You have:

Fee structures per grade/term/year

Child records linked to parents

School results with auto-computed grades

Multi-fee batch payments

All the original church payment logic preserved

📊 What's Running Right Now
Terminal	Service	Port	Status
1	MongoDB	27017	✅ Running
2	Backend API	5000	✅ Running
3	(Free)	—	Available
4	Frontend	5173	Maybe running
🎯 Phase 1 — Complete Deliverables
New backend features:

POST /api/children — create child (admin)

GET /api/children/my — my children (parent)

GET /api/children/:id — child detail

POST /api/fees — set fee structure (admin)

GET /api/fees/for-grade — get fees by grade

POST /api/results — upload result (admin)

GET /api/results/my — my children's results

GET /api/results/child/:childId — specific child's results

POST /api/payments/batch — pay multiple fees at once

GET /api/payments/batch/:batchId — batch status

GET /api/admin/pending-users — user approval queue

POST /api/admin/approve/:userId — approve/reject user

🚀 Now — Phase 2: Frontend Auth UI
What we'll build next:

Mobile + Web — Auth Flow
Screen	What It Does
Sign Up	New user registers (member type: church / PTA / both)
Admin Sign Up	Admin registration with approval requirement
Forgot Password	Enter email → reset link
Reset Password	Token-based password reset
Pending Approval	Users waiting for admin approval see a friendly wait screen
Profile Settings	Update phone, preferred provider (MTN/Airtel), member type
Web Dashboard — New Sections
Section	Purpose
Pending Users	Admin approves/rejects new signups
Children	Admin manages student records
Fee Structures	Admin sets fees per grade/term
Results Upload	Admin uploads term results
PTA Transactions	Filter transactions by fee type
Web Dashboard — New Split Navigation
Instead of 4 links, we'll have grouped sections:

text
📊 Dashboard
─────────────
⛪ CHURCH
  ├─ Tithes
  ├─ Offerings  
  └─ Special Giving
─────────────
🎓 PTA
  ├─ Children
  ├─ Fee Structures
  ├─ Payments
  └─ Results
─────────────
👥 MEMBERS
📈 REPORTS
⚙️ SETTINGS
Mobile — Same split
Tabs based on user's memberType:

Church-only user → Church tabs only

PTA-only user → PTA tabs only

Both → All tabs

⚠️ Before We Start Phase 2 — Save Your Work
You've built a lot. Let's push to GitHub before adding more — otherwise you risk losing progress if something breaks.

Do you want to:

A → Push to GitHub first (recommended)

B → Skip GitHub, go straight to Phase 2

C → Take a break, resume later

📋 Reply With
text
1. Phase 1 result: PASSED ✅
2. Next step: A (GitHub) / B (Phase 2) / C (Break)
My strong recommendation: A. 5 minutes to secure everything, then Phase 2 with a clean checkpoint. If Phase 2 has issues, you can always roll back.

Which one? 👇

1. Phase 1 result: PASSED ✅
2. Next step: A (GitHub) / B (Phase 2) / C (Break)
🚀 Let's Push to GitHub
You picked A — smart choice. Let's secure your work before Phase 2.

We'll push two repos:

payment-api-backend (backend)

church-payments (frontend — web + mobile + shared)

🎯 Step 1 — Do You Have a GitHub Account?
Yes → Skip to Step 2

No → Sign up at https://github.com/signup (30 seconds)

🎯 Step 2 — Install GitHub CLI (Easiest Way)
If you have gh installed, we can create repos from the terminal in 2 commands. Let's check:

text
gh --version
If it prints a version → Skip to Step 3.

If it says "not recognized", install it:

Download: https://cli.github.com/

Run the installer

Restart VS Code so the terminal picks up the new PATH

Verify: gh --version

🎯 Step 3 — Login to GitHub via CLI
text
gh auth login
Prompts you'll see — choose these:

Prompt	Answer
What account do you want to log into?	GitHub.com
Preferred protocol?	HTTPS
Authenticate Git with your GitHub credentials?	Yes
How would you like to authenticate?	Login with a web browser
It'll give you an 8-character code (like AB12-CD34). Copy it.

Press Enter → browser opens → paste code → click Authorize.

Back in terminal, you should see:

text
✓ Logged in as <your-username>
🎯 Step 4 — Configure Git Identity (If Not Done)
text
git config --global user.name "Your Full Name"
git config --global user.email "your-github-email@example.com"
⚠️ Use the email attached to your GitHub account.

Verify:

text
git config --global user.name
git config --global user.email
🎯 Step 5 — Check Current Git State
Backend:
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend-"
git status
Note what files show as modified/untracked. Should show:

Modified: src/app.js, src/models/User.js, src/models/Transaction.js, src/controllers/paymentController.js, src/routes/paymentRoutes.js

Untracked: new models, controllers, routes, .env

Frontend:
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
git status 2>&1
If it says "not a git repository" → we'll git init it.

🎯 Step 6 — ⚠️ CRITICAL — Check .gitignore Before Committing
Your .env has secrets (JWT_SECRET). It must NOT go to GitHub.

Backend .gitignore:
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\payment-api-backend-"
Get-Content .gitignore
Look for:

text
.env
node_modules/
If .env is NOT there, add it:

text
@"
node_modules/
.env
.env.local
*.log
.DS_Store
"@ | Out-File -FilePath .gitignore -Encoding ascii -Force
Also verify .env is not tracked:
text
git ls-files | Select-String ".env"
If it prints .env → it's already tracked. Remove it from git:

text
git rm --cached .env
🎯 Step 7 — Tell Me Your GitHub Username
Before I give you the exact push commands, I need:

text
Your GitHub username: ___
Once I have that, I'll give you the exact commands to:

Create 2 new repos on GitHub

Add them as remotes

Commit + push

📋 Reply With
text
1. gh --version output: ___
2. gh auth login — success? Yes/No
3. git config user.name: ___
4. git config user.email: ___
5. Backend git status: ___
6. Frontend git status: ___
7. Backend .gitignore has `.env`? Yes/No
8. Your GitHub username: ___
Steps 2, 5, 6 are critical. Once I have your GitHub username + the git status outputs, I'll give you the exact commands to publish everything. 👇

🚀 Phase 3 — Mobile App for Users
Let's build the mobile app. Members will use this to give tithes, pay PTA fees, and check results.

🎯 What We're Building
Navigation structure:

text
Root
├── Auth Stack (not logged in)
│   ├── Login
│   ├── Signup
│   └── Forgot Password
└── Main Tabs (logged in)
    ├── Home (dashboard)
    ├── Give (church payments)
    ├── PTA (child fees + results)
    └── Profile
This batch — 12 files:

App.tsx — root entry

src/lib/api.ts — API client setup

src/stores/auth.store.ts — auth state

src/navigation/RootNavigator.tsx — top-level

src/navigation/AuthStack.tsx — login flow

src/navigation/MainTabs.tsx — bottom tabs

src/theme/index.ts — colors, spacing

src/screens/LoginScreen.tsx

src/screens/SignupScreen.tsx

src/screens/HomeScreen.tsx

src/screens/ProfileScreen.tsx

src/components/Button.tsx — reusable button

Next batch: Give screen, PTA screen, History, Results, Payment form.

🚀 Step 1 — Create Folders
In a terminal:

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
text
New-Item -ItemType Directory -Path "src\navigation" -Force
New-Item -ItemType Directory -Path "src\screens" -Force
New-Item -ItemType Directory -Path "src\components" -Force
New-Item -ItemType Directory -Path "src\stores" -Force
New-Item -ItemType Directory -Path "src\lib" -Force
New-Item -ItemType Directory -Path "src\theme" -Force
Verify:

text
Get-ChildItem "src" -Directory | Select-Object Name
Should list: components, lib, navigation, screens, stores, theme.

🚀 Step 2 — Check Package.json Has AsyncStorage
text
Get-Content package.json | Select-String "async-storage"
If it prints the line → ✅ installed.
If not → install it:

text
npx expo install @react-native-async-storage/async-storage
📄 FILE 1: App.tsx (REPLACE)
tsx
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./src/lib/api";
import RootNavigator from "./src/navigation/RootNavigator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
📄 FILE 2: src\theme\index.ts (NEW)
ts
export const colors = {
  purple50: "#faf5ff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple400: "#c084fc",
  purple500: "#a855f7",
  purple600: "#9333ea",
  purple700: "#7e22ce",
  purple900: "#581c87",
  pink500: "#ec4899",
  pink600: "#db2777",
  indigo500: "#6366f1",
  indigo900: "#1e1b4b",

  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray500: "#6b7280",
  gray700: "#374151",
  gray900: "#111827",

  green500: "#10b981",
  green600: "#059669",
  red500: "#ef4444",
  red600: "#dc2626",
  yellow500: "#eab308",
};

export const gradients = {
  primary: ["#a855f7", "#ec4899"] as const,
  purple: ["#9333ea", "#6366f1"] as const,
  pink: ["#ec4899", "#a855f7"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
📄 FILE 3: src\lib\api.ts (NEW)
ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, setTokenStorage, setToken } from "@church/shared";

// LAN IP of your PC (replace if changed)
const API_URL = "http://172.20.10.3:5000/api";

setTokenStorage({
  getItem: (key) => null, // async only — we handle below
  setItem: () => {},
  removeItem: () => {},
});

createApi(API_URL);

// Load token into memory on boot
AsyncStorage.getItem("church_payments_token").then((token) => {
  if (token) setToken(token);
});

export { API_URL };
⚠️ We'll update API_URL for mobile access in a later step (LAN IP or ngrok). For now, we'll just have the web dashboard working alongside.

📄 FILE 4: src\stores\auth.store.ts (NEW)
ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken as saveToken, clearToken } from "@church/shared";
import type { UserRole, MemberType, ApprovalStatus } from "@church/shared";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberType?: MemberType;
  approvalStatus?: ApprovalStatus;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  hydrated: boolean;
  setAuth: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isApproved: true,
  isAdmin: false,
  hydrated: false,

  setAuth: async (user, token) => {
    saveToken(token);
    await AsyncStorage.setItem("church_user", JSON.stringify(user));
    set({
      user,
      isAuthenticated: true,
      isApproved: (user.approvalStatus || "approved") === "approved",
      isAdmin: user.role === "admin",
    });
  },

  logout: async () => {
    clearToken();
    await AsyncStorage.removeItem("church_user");
    set({
      user: null,
      isAuthenticated: false,
      isApproved: true,
      isAdmin: false,
    });
  },

  restore: async () => {
    try {
      const stored = await AsyncStorage.getItem("church_user");
      if (stored) {
        const user = JSON.parse(stored) as AuthUser;
        set({
          user,
          isAuthenticated: true,
          isApproved: (user.approvalStatus || "approved") === "approved",
          isAdmin: user.role === "admin",
        });
      }
    } catch {
      // ignore
    } finally {
      set({ hydrated: true });
    }
  },
}));
📄 FILE 5: src\components\Button.tsx (NEW)
tsx
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outline, style]}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={["#a855f7", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, (disabled || loading) && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    shadowColor: colors.purple500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 15,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  outline: {
    paddingVertical: 15,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.purple500,
  },
  outlineText: {
    color: colors.purple600,
    fontSize: 15,
    fontWeight: "600",
  },
});
⚠️ Note: This file uses expo-linear-gradient. Install it:

text
npx expo install expo-linear-gradient
📄 FILE 6: src\screens\LoginScreen.tsx (NEW)
tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { authApi, loginSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";
import Button from "../components/Button";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      Alert.alert("Error", parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(parsed.data);
      if (result.approvalStatus === "pending") {
        Alert.alert(
          "Pending Approval",
          "Your account is awaiting admin approval. Please check back later."
        );
        return;
      }
      await setAuth(
        {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          memberType: result.memberType,
          approvalStatus: result.approvalStatus,
        },
        result.token
      );
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <LinearGradient
            colors={["#a855f7", "#ec4899"]}
            style={styles.logoInner}
          >
            <Text style={{ fontSize: 32 }}>⛪</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.purple400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.purple400}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={{ alignSelf: "flex-end", marginTop: spacing.sm }}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkBold}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: 80,
  },
  logo: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.purple900,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.purple600,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.purple900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.purple900,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  link: {
    color: colors.purple500,
    fontSize: 13,
    fontWeight: "500",
  },
  linkBold: {
    color: colors.purple600,
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.purple600,
    fontSize: 13,
  },
});
📄 FILE 7: src\screens\SignupScreen.tsx (NEW)
tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { authApi, signupSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";
import Button from "../components/Button";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [memberType, setMemberType] = useState<"church" | "pta" | "both">(
    "both"
  );
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSignup = async () => {
    const parsed = signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      memberType,
    });
    if (!parsed.success) {
      Alert.alert("Error", parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.signup(parsed.data);
      await setAuth(
        {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          memberType: result.memberType,
          approvalStatus: result.approvalStatus,
        },
        result.token
      );
    } catch (err) {
      Alert.alert(
        "Signup Failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: "church" as const, label: "Church", icon: "⛪" },
    { value: "pta" as const, label: "PTA", icon: "🎓" },
    { value: "both" as const, label: "Both", icon: "✨" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the payment system</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={colors.purple400}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.purple400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0971234567"
            placeholderTextColor={colors.purple400}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.purple400}
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>I'm joining as</Text>
          <View style={styles.typeRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setMemberType(t.value)}
                style={[
                  styles.typeBtn,
                  memberType === t.value && styles.typeBtnActive,
                ]}
              >
                <Text style={{ fontSize: 18 }}>{t.icon}</Text>
                <Text
                  style={[
                    styles.typeText,
                    memberType === t.value && styles.typeTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={loading ? "Creating account..." : "Create Account"}
            onPress={handleSignup}
            loading={loading}
            style={{ marginTop: spacing.xl }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkBold}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.purple900,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.purple600,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: { width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.purple900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.purple900,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.purple200,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  typeBtnActive: {
    borderColor: colors.purple500,
    backgroundColor: colors.purple100,
  },
  typeText: {
    fontSize: 12,
    color: colors.purple600,
    marginTop: 2,
    fontWeight: "500",
  },
  typeTextActive: {
    color: colors.purple700,
    fontWeight: "700",
  },
  link: {
    color: colors.purple500,
    fontSize: 13,
    fontWeight: "500",
  },
  linkBold: {
    color: colors.purple600,
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.purple600,
    fontSize: 13,
  },
});
📄 FILE 8: src\screens\HomeScreen.tsx (NEW)
tsx
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <LinearGradient
        colors={["#a855f7", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name || "Member"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.memberType === "church"
              ? "⛪ Church Member"
              : user?.memberType === "pta"
              ? "🎓 PTA Parent"
              : "✨ Church + PTA"}
          </Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actions}>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>Give</Text>
          <Text style={styles.actionSub}>Tithe, offering</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>🎓</Text>
          <Text style={styles.actionTitle}>Pay PTA</Text>
          <Text style={styles.actionSub}>School fees</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📜</Text>
          <Text style={styles.actionTitle}>History</Text>
          <Text style={styles.actionSub}>My payments</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Results</Text>
          <Text style={styles.actionSub}>Child results</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Coming Next</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Full payment features will appear here soon. Use the tabs below to
          navigate.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  greeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
  },
  name: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.purple900,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.purple900,
  },
  actionSub: {
    fontSize: 11,
    color: colors.purple500,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  infoText: { fontSize: 13, color: colors.purple700, lineHeight: 20 },
});
📄 FILE 9: src\screens\ProfileScreen.tsx (NEW)
tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#a855f7", "#ec4899"]}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Phone</Text>
          <Text style={styles.rowValue}>{user?.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Role</Text>
          <Text style={styles.rowValue}>{user?.role}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Member Type</Text>
          <Text style={styles.rowValue}>{user?.memberType || "both"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={styles.rowValue}>
            {user?.approvalStatus || "approved"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: spacing.lg,
  },
  email: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  body: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple200,
  },
  rowLabel: { fontSize: 14, color: colors.purple600, fontWeight: "500" },
  rowValue: {
    fontSize: 14,
    color: colors.purple900,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  logout: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.red500,
    alignItems: "center",
  },
  logoutText: {
    color: colors.red600,
    fontSize: 15,
    fontWeight: "600",
  },
});
📄 FILE 10: src\navigation\AuthStack.tsx (NEW)
tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
📄 FILE 11: src\navigation\MainTabs.tsx (NEW)
tsx
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple600,
        tabBarInactiveTintColor: colors.purple400,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.purple200,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
⚠️ Coming next batch: Give, PTA, History tabs. For now, just Home + Profile.

📄 FILE 12: src\navigation\RootNavigator.tsx (NEW)
tsx
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../stores/auth.store";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import { colors } from "../theme";

export default function RootNavigator() {
  const { isAuthenticated, hydrated, restore } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  if (!hydrated) {
    return (
      <LinearGradient
        colors={["#faf5ff",
✅ Folders Created & AsyncStorage Installed
Everything's ready. Now let's paste the 12 files.

⚠️ First, install expo-linear-gradient (needed by the files):

text
npx expo install expo-linear-gradient
Wait for it to finish, then continue.

📄 FILE 1: apps\mobile\App.tsx (REPLACE)
tsx
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./src/lib/api";
import RootNavigator from "./src/navigation/RootNavigator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
📄 FILE 2: apps\mobile\src\theme\index.ts (NEW)
ts
export const colors = {
  purple50: "#faf5ff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple400: "#c084fc",
  purple500: "#a855f7",
  purple600: "#9333ea",
  purple700: "#7e22ce",
  purple900: "#581c87",
  pink500: "#ec4899",
  pink600: "#db2777",
  indigo500: "#6366f1",
  indigo900: "#1e1b4b",

  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray500: "#6b7280",
  gray700: "#374151",
  gray900: "#111827",

  green500: "#10b981",
  green600: "#059669",
  red500: "#ef4444",
  red600: "#dc2626",
  yellow500: "#eab308",
};

export const gradients = {
  primary: ["#a855f7", "#ec4899"] as const,
  purple: ["#9333ea", "#6366f1"] as const,
  pink: ["#ec4899", "#a855f7"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
📄 FILE 3: apps\mobile\src\lib\api.ts (NEW)
ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, setTokenStorage, setToken } from "@church/shared";

// For iPhone USB tether — use PC's tether IP
// If you switch to Wi-Fi, replace with your Wi-Fi IP
const API_URL = "http://172.20.10.3:5000/api";

setTokenStorage({
  getItem: (key) => null,
  setItem: () => {},
  removeItem: () => {},
});

createApi(API_URL);

AsyncStorage.getItem("church_payments_token").then((token) => {
  if (token) setToken(token);
});

export { API_URL };
📄 FILE 4: apps\mobile\src\stores\auth.store.ts (NEW)
ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken as saveToken, clearToken } from "@church/shared";
import type { UserRole, MemberType, ApprovalStatus } from "@church/shared";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberType?: MemberType;
  approvalStatus?: ApprovalStatus;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  hydrated: boolean;
  setAuth: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isApproved: true,
  isAdmin: false,
  hydrated: false,

  setAuth: async (user, token) => {
    saveToken(token);
    await AsyncStorage.setItem("church_user", JSON.stringify(user));
    set({
      user,
      isAuthenticated: true,
      isApproved: (user.approvalStatus || "approved") === "approved",
      isAdmin: user.role === "admin",
    });
  },

  logout: async () => {
    clearToken();
    await AsyncStorage.removeItem("church_user");
    set({
      user: null,
      isAuthenticated: false,
      isApproved: true,
      isAdmin: false,
    });
  },

  restore: async () => {
    try {
      const stored = await AsyncStorage.getItem("church_user");
      if (stored) {
        const user = JSON.parse(stored) as AuthUser;
        set({
          user,
          isAuthenticated: true,
          isApproved: (user.approvalStatus || "approved") === "approved",
          isAdmin: user.role === "admin",
        });
      }
    } catch {
      // ignore
    } finally {
      set({ hydrated: true });
    }
  },
}));
📄 FILE 5: apps\mobile\src\components\Button.tsx (NEW)
tsx
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outline, style]}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={["#a855f7", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, (disabled || loading) && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    shadowColor: colors.purple500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 15,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  outline: {
    paddingVertical: 15,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.purple500,
  },
  outlineText: {
    color: colors.purple600,
    fontSize: 15,
    fontWeight: "600",
  },
});
📄 FILE 6: apps\mobile\src\screens\LoginScreen.tsx (NEW)
tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { authApi, loginSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";
import Button from "../components/Button";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      Alert.alert("Error", parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(parsed.data);
      if (result.approvalStatus === "pending") {
        Alert.alert(
          "Pending Approval",
          "Your account is awaiting admin approval. Please check back later."
        );
        return;
      }
      await setAuth(
        {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          memberType: result.memberType,
          approvalStatus: result.approvalStatus,
        },
        result.token
      );
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <LinearGradient
            colors={["#a855f7", "#ec4899"]}
            style={styles.logoInner}
          >
            <Text style={{ fontSize: 32 }}>⛪</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.purple400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.purple400}
            secureTextEntry
            style={styles.input}
          />

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkBold}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: 80,
  },
  logo: { alignItems: "center", marginBottom: spacing.xl },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.purple900,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.purple600,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  form: { width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.purple900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.purple900,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  linkBold: { color: colors.purple600, fontSize: 13, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: { color: colors.purple600, fontSize: 13 },
});
📄 FILE 7: apps\mobile\src\screens\SignupScreen.tsx (NEW)
tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { authApi, signupSchema } from "@church/shared";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";
import Button from "../components/Button";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [memberType, setMemberType] = useState<"church" | "pta" | "both">(
    "both"
  );
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSignup = async () => {
    const parsed = signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      memberType,
    });
    if (!parsed.success) {
      Alert.alert("Error", parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.signup(parsed.data);
      await setAuth(
        {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          memberType: result.memberType,
          approvalStatus: result.approvalStatus,
        },
        result.token
      );
    } catch (err) {
      Alert.alert(
        "Signup Failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: "church" as const, label: "Church", icon: "⛪" },
    { value: "pta" as const, label: "PTA", icon: "🎓" },
    { value: "both" as const, label: "Both", icon: "✨" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the payment system</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={colors.purple400}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.purple400}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0971234567"
            placeholderTextColor={colors.purple400}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.purple400}
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>I'm joining as</Text>
          <View style={styles.typeRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setMemberType(t.value)}
                style={[
                  styles.typeBtn,
                  memberType === t.value && styles.typeBtnActive,
                ]}
              >
                <Text style={{ fontSize: 18 }}>{t.icon}</Text>
                <Text
                  style={[
                    styles.typeText,
                    memberType === t.value && styles.typeTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={loading ? "Creating account..." : "Create Account"}
            onPress={handleSignup}
            loading={loading}
            style={{ marginTop: spacing.xl }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkBold}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, paddingTop: 60 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.purple900,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.purple600,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: { width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.purple900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.purple900,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.purple200,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  typeBtnActive: {
    borderColor: colors.purple500,
    backgroundColor: colors.purple100,
  },
  typeText: {
    fontSize: 12,
    color: colors.purple600,
    marginTop: 2,
    fontWeight: "500",
  },
  typeTextActive: { color: colors.purple700, fontWeight: "700" },
  linkBold: { color: colors.purple600, fontSize: 13, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: { color: colors.purple600, fontSize: 13 },
});
📄 FILE 8: apps\mobile\src\screens\HomeScreen.tsx (NEW)
tsx
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
    >
      <LinearGradient
        colors={["#a855f7", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name || "Member"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.memberType === "church"
              ? "⛪ Church Member"
              : user?.memberType === "pta"
              ? "🎓 PTA Parent"
              : "✨ Church + PTA"}
          </Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actions}>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>Give</Text>
          <Text style={styles.actionSub}>Tithe, offering</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>🎓</Text>
          <Text style={styles.actionTitle}>Pay PTA</Text>
          <Text style={styles.actionSub}>School fees</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📜</Text>
          <Text style={styles.actionTitle}>History</Text>
          <Text style={styles.actionSub}>My payments</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Results</Text>
          <Text style={styles.actionSub}>Child results</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Coming Next</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Full payment features will appear here soon. Use the tabs below to
          navigate.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: spacing.xl, borderRadius: radius.xl, marginBottom: spacing.xl },
  greeting: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "500" },
  name: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.purple900,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  actionCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.sm },
  actionTitle: { fontSize: 15, fontWeight: "700", color: colors.purple900 },
  actionSub: { fontSize: 11, color: colors.purple500, marginTop: 2 },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.purple200,
  },
  infoText: { fontSize: 13, color: colors.purple700, lineHeight: 20 },
});
📄 FILE 9: apps\mobile\src\screens\ProfileScreen.tsx (NEW)
tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../stores/auth.store";
import { colors, radius, spacing } from "../theme";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#a855f7", "#ec4899"]} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Phone</Text>
          <Text style={styles.rowValue}>{user?.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Role</Text>
          <Text style={styles.rowValue}>{user?.role}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Member Type</Text>
          <Text style={styles.rowValue}>{user?.memberType || "both"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={styles.rowValue}>
            {user?.approvalStatus || "approved"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.xl, paddingTop: 60, alignItems: "center" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: spacing.lg },
  email: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  body: { padding: spacing.xl },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple200,
  },
  rowLabel: { fontSize: 14, color: colors.purple600, fontWeight: "500" },
  rowValue: {
    fontSize: 14,
    color: colors.purple900,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  logout: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.red500,
    alignItems: "center",
  },
  logoutText: { color: colors.red600, fontSize: 15, fontWeight: "600" },
});
📄 FILE 10: apps\mobile\src\navigation\AuthStack.tsx (NEW)
tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
📄 FILE 11: apps\mobile\src\navigation\MainTabs.tsx (NEW)
tsx
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple600,
        tabBarInactiveTintColor: colors.purple400,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.purple200,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
📄 FILE 12: apps\mobile\src\navigation\RootNavigator.tsx (NEW)
tsx
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../stores/auth.store";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

export default function RootNavigator() {
  const { isAuthenticated, hydrated, restore } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  if (!hydrated) {
    return (
      <LinearGradient
        colors={["#faf5ff", "#ede9fe"]}
        style={styles.loading}
      >
        <ActivityIndicator size="large" color="#a855f7" />
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
🚀 After Pasting All 12 Files
Stop any running Expo (Ctrl+C), then:

text
npx expo start
Test it:

Press w in the terminal → opens in web browser (quick test)

Or scan QR code with Expo Go app on iPhone

Expected: Purple-themed login screen with a church icon.

📋 Reply With
text
1. expo-linear-gradient installed? Yes/No
2. All 12 files pasted? Yes/No
3. npx expo start output: ___
4. What you see in the browser: <screenshot>
⚠️ If you're testing on iPhone via Expo Go, the API URL in src/lib/api.ts may need updating — we'll fix that after the login screen renders.

Install expo-linear-gradient, paste the 12 files, then start Expo. 👇

we have some errors
🎯 Paste the Errors So I Can Fix Them
I can't see your screen — tell me what errors you're seeing.

📋 What I Need
1. Terminal errors (from npx expo start):

Copy the last 20 lines of the terminal

Or paste the exact error text

2. VS Code problems panel:

Click the ⚠️ icon at the bottom of VS Code (bottom-left status bar)

Or press Ctrl+Shift+M

Paste the errors listed

3. Red squiggles in files:

Screenshot any file with red underlines

Or paste the error text

🔍 Most Likely Culprits
Since we pasted 12 files with many imports, common errors are:

Error	Cause	Fix
Cannot find module 'expo-linear-gradient'	Not installed	npx expo install expo-linear-gradient
Cannot find module '@react-navigation/native'	Not installed	npx expo install @react-navigation/native
Cannot find module '@church/shared'	Workspace not linked	Run npm install at monorepo root
Cannot find name 'colors'	Missing import	One of the files is truncated
Unexpected token in a file	Paste was cut off	Re-paste that file
JSX element implicitly has type 'any'	TS config issue	Check tsconfig.json
📋 Reply With
text
1. Terminal output from `npx expo start` (last 20 lines): ___
2. VS Code Problems panel errors: ___
3. Which file has red squiggles: ___
Paste everything you see. Once I have the errors, I'll fix them in the next message — likely just 1-2 small files need adjustment.

Screenshot the terminal + the Problems panel — that's fastest. 👇

🎉 EXPO IS RUNNING — No Errors in Terminal
Your output shows:

text
› Metro: exp://172.20.10.3:8081
› Web: http://localhost:8081
› Scan the QR code above to open in Expo Go.
Metro bundler is live and waiting. If VS Code shows red squiggles, they're TypeScript warnings — the app still runs.

🚀 Test It Right Now — 3 Ways
🅰️ Fastest: Test in Browser
In the Expo terminal, press w.

It opens a browser tab at http://localhost:8081.

Expected: Purple login screen with church emoji.

⚠️ Note: Expo web can be flaky. If it errors, use 🅱️ or 🅲.

🅱️ Test on iPhone (Recommended)
Install Expo Go from the App Store

Connect your iPhone to the same USB tether (it already is)

Open the Camera app → point at the QR code in your terminal

Tap the popup that says "Open in Expo Go"

Expected: Purple login screen loads on your phone.

⚠️ If it can't connect → we need to update src/lib/api.ts with the correct URL (see below).

🅲️ Test in Web Browser with localhost
Open http://localhost:8081 directly in your browser.

🚨 IMPORTANT — Update API URL for Mobile
The src/lib/api.ts currently has:

text
const API_URL = "http://172.20.10.3:5000/api";
This may not work from your phone. Two options:

Option 1 — Keep iPhone USB Tether (current setup)
Your PC's tether IP is 172.20.10.3. From the iPhone, that IP doesn't reach your PC (that's the whole USB tether problem we discovered earlier).

BUT — Expo itself is running on 172.20.10.3:8081 and the phone can reach it. So the phone CAN reach your PC's IP for the bundler. The API on port 5000 should work the same way.

Test it: On iPhone Safari, open:

text
http://172.20.10.3:5000
✅ Shows "API is running..." → Phone reaches backend → mobile app will work

❌ Can't reach → we need ngrok for the backend

Option 2 — Use ngrok for the backend
If Option 1 fails, we'll tunnel the backend through ngrok (we set up the token earlier). Then API_URL becomes the ngrok URL.

📋 Test Now — 3 Things
Test 1 — Is the app loading?
Press w in the Expo terminal (or open http://localhost:8081).

Paste a screenshot of what you see.

Test 2 — Can phone reach backend?
On iPhone Safari, open:

text
http://172.20.10.3:5000
Does it show "API is running..."? Yes / No

Test 3 — Any actual errors?
In VS Code:

Press Ctrl+Shift+M (Problems panel)

Screenshot or paste

📋 Reply With
text
1. Browser at localhost:8081 — what shows: <screenshot>
2. iPhone Safari at 172.20.10.3:5000 — what shows: ___
3. Problems panel errors: ___
Do Test 1 first — press w in the Expo terminal. 👇

Once the login screen appears, we'll test the API connection and move on to building the Give + PTA screens.

its saying no usable data found after scanning the code
🎯 iPhone Can't Reach Your PC's Metro Bundler
The QR code scans, but Expo Go can't load the bundle — same network issue as before. Your iPhone's USB tether only gives the PC internet, but the phone can't easily reach PC ports.

This is the exact problem we identified earlier with 172.20.10.3:5000. Now it's happening on 8081 too.

Solution: Expo Tunnel mode. Routes everything through a public URL that works from anywhere.

🚀 Fix — Use Tunnel Mode
Step 1 — Stop Expo
In the Expo terminal: Ctrl+C

Step 2 — Install ngrok for Expo (one-time)
text
npx expo install @expo/ngrok
Wait for it to finish. It'll say "added 1 package".

⚠️ If it fails, use the global install instead:

text
npm install -g @expo/ngrok
Step 3 — Start Expo with Tunnel
text
npx expo start --tunnel
First run:

It may prompt to install @expo/ngrok again → say Yes

Wait 30-60 seconds while it creates the tunnel

Expected output:

text
› Metro: exp://xxxxx-xxxx.anonymous.8081.exp.direct
› Tunnel ready
A new QR code appears.

Step 4 — Scan from iPhone
Open Camera app

Point at the QR code

Tap the "Open in Expo Go" popup

Wait 30-60 seconds — tunnel is slower than LAN

Expected: Purple login screen appears.

⚠️ But — The API Won't Work Over Tunnel
Once the app loads, login will fail because:

Mobile app calls http://172.20.10.3:5000/api

iPhone still can't reach your PC on that IP

Only Expo Metro is tunneled, not your backend

We need to tunnel the backend too.

🚀 Fix the Backend API — 2 Options
🅰️ Tunnel the backend with ngrok (same ngrok token we set up earlier)
In a new terminal:

text
ngrok http 5000
It prints something like:

text
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
Copy the https://...ngrok-free.app URL.

Then edit apps/mobile/src/lib/api.ts:

ts
const API_URL = "https://abc123.ngrok-free.app/api";
⚠️ Replace abc123 with your actual ngrok URL.

Save. Expo will auto-reload.

🅱️ Quick Test — Switch to Wi-Fi
If you have a Wi-Fi router available:

Connect both PC and iPhone to the same Wi-Fi

Stop Expo, restart with npx expo start (no tunnel)

Update API_URL to your Wi-Fi IP (ipconfig → find Wi-Fi IPv4)

📋 Reply With
text
1. Did npx expo install @expo/ngrok succeed? Yes/No
2. Did npx expo start --tunnel start? Yes/No — paste the Metro URL
3. Did the app load on iPhone? Yes/No — screenshot
4. Which backend tunnel option (A / B / none yet)?
Do Steps 1-4 first. Then we fix the API URL.

The mobile app IS working — it's just a network bridge problem. Tunnel mode solves the Metro side; ngrok solves the API side. 👇

🎯 Switch Expo to Tunnel Mode
The Metro URL exp://172.20.10.3:8081 is what your iPhone can't reach. Tunnel fixes that.

🚀 Fix — Do This
Step 1 — Install ngrok for Expo
Open a new terminal (keep the current Expo terminal too):

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
text
npx expo install @expo/ngrok
Wait for added 1 package.

Step 2 — Stop Expo and Restart with Tunnel
In the Expo terminal (the one showing the QR code):

Press Ctrl+C

Then:

text
npx expo start --tunnel
First run:

It may prompt to install @expo/ngrok again → Yes

Wait 30-60 seconds

Expected output:

text
✔ Tunnel ready
› Metro: exp://xxxxx-xxxx-anonymous-8081.exp.direct
› Web: http://localhost:8081
A new QR code appears.

Step 3 — Scan from iPhone
Open Camera app on iPhone

Point at the new QR code

Tap "Open in Expo Go"

Wait 30-60 seconds (tunnel is slower than LAN)

Expected: Purple login screen with ⛪ icon.

⚠️ Even If App Loads, Login Will Fail
The mobile app calls your backend at http://172.20.10.3:5000/api, which the phone can't reach.

After the app loads, do this:

Step 4 — Tunnel the backend too
Open a THIRD terminal:

text
ngrok http 5000
Wait for output like:

text
Forwarding  https://a1b2-c3d4.ngrok-free.app -> http://localhost:5000
Copy the https://...ngrok-free.app URL.

Step 5 — Update mobile API URL
Open apps\mobile\src\lib\api.ts in VS Code.

Change:

ts
const API_URL = "http://172.20.10.3:5000/api";
To:

ts
const API_URL = "https://a1b2-c3d4.ngrok-free.app/api";
⚠️ Replace with your actual ngrok URL.

Save. Expo will auto-reload.

🚀 Step 6 — Test Login
On iPhone in Expo Go:

Email: mwape.kilubi@cs.unza.zm

Password: admin123

Tap Sign In

Expected: Purple home screen with "Welcome back, Mwape Kilubi".

📋 Reply With
text
1. npx expo install @expo/ngrok succeeded? Yes/No
2. npx expo start --tunnel output — Metro URL: ___
3. App loaded on iPhone? Yes/No — screenshot
4. ngrok http 5000 — Forwarding URL: ___
5. After api.ts update — login works? Yes/No
Do steps 1-3 first. The tunnel usually takes 1-2 minutes on first run.

If tunnel fails (network blocks ngrok), tell me — we have fallback options:

Use Wi-Fi instead of USB tether

Or run app in web mode (w key) and test in browser on PC

Run Step 1 now. 👇

PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments>npx expo login
Log in to EAS with email or username (exit and run 'npx expo login --help' for other login options)
√ Email or username ... mwapejoe14@gmail.com
√ Password ... *********
ApiV2Error: Your username, email, or password was incorrect.
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments> 
it needs me to login cli also. how do i do it when i just know my email
🎯 Skip the Login — Tunnel Doesn't Need It
npx expo login is only for EAS build. You don't need it for tunnel mode.

The expo start --tunnel command works without any account. Let's just run it directly.

✅ Do This — Skip Login Entirely
Step 1 — Stop any running Expo
In your Expo terminal, press Ctrl+C.

Step 2 — Install ngrok package (if not already)
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
text
npx expo install @expo/ngrok
If it says "already installed" → fine, continue.

Step 3 — Start Expo with tunnel
text
npx expo start --tunnel
What happens:

If it asks "Install @expo/ngrok? (Y/n)" → press Y

Waits 30-60 seconds

Prints a new QR code with a URL like exp://xxxx-anonymous-8081.exp.direct

No login required. The tunnel service runs anonymously.

Step 4 — Scan from iPhone
Use your Camera app → tap the "Open in Expo Go" popup.

Wait 30-60 seconds for the first load.

⚠️ If the Password Was Wrong for a Different Reason
If npx expo login was for something else and you actually do want to log in:

Go to https://expo.dev/forgot-password

Enter mwapejoe14@gmail.com

Check your email → reset password

Then npx expo login should work

But you don't need this for tunnel mode. Skip it.

🔧 If Tunnel Still Fails
Sometimes ngrok tunnel gets blocked. Fallback options:

🅰️ Use Expo's --web mode (test in PC browser)
text
npx expo start --web
Opens the app in Chrome on your PC. No phone needed. Good for verifying the code works.

🅱️ Switch phone + PC to same Wi-Fi
Then run plain npx expo start (no tunnel). The LAN IP will work.

🅲 Use a development build
More complex setup. Only if you plan to distribute the app.

📋 Reply With
text
1. Ctrl+C pressed on Expo terminal? Yes/No
2. npx expo start --tunnel output: ___
3. New QR code URL: ___
4. Did app load on iPhone? Yes/No — screenshot
Skip the login. Just run npx expo start --tunnel directly. 👇

If tunnel doesn't work in 2 minutes, tell me and we'll go with --web mode to verify the code on your PC first.

🎯 Found the Root Cause
Your package.json says:

json
"main": "index.ts"
But there is no index.ts file in apps\mobile\ — that's why Expo can't find the entry point.

Where did this come from? When create-expo-app was originally run, it may have had a different template, OR one of our earlier edits accidentally changed it.

✅ Fix — Pick One
🅰️ Option A — Point to App.tsx directly (Simplest)
Open apps\mobile\package.json in VS Code.

Change line:

json
"main": "index.ts",
To:

json
"main": "App.tsx",
Save.

Then restart Expo:

text
Ctrl+C
npx expo start --tunnel --clear
🅱️ Option B — Create index.ts (Recommended for Expo)
Keep main as index.ts, but create the file.

Create apps\mobile\index.ts:

text
New-Item -ItemType File -Path "index.ts" -Force
Paste:

ts
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
Save.

Then restart Expo:

text
Ctrl+C
npx expo start --tunnel --clear
🎯 Why Option B Is Better
Expo's default entry chain expects main: "expo/AppEntry.js" which internally imports ../../App. But when expo is hoisted, that breaks. Setting main: "index.ts" + providing a custom index.ts bypasses the whole issue.

This also matches the newer Expo template conventions.

🔍 Verify Before Restarting
Check:

text
Test-Path "index.ts"
If True → Option B is set up, restart Expo

If False → create it (see above)

🚀 Then Restart Expo
text
Ctrl+C
npx expo start --tunnel --clear
Wait for QR code.

Scan with iPhone Camera → tap "Open in Expo Go" → wait 30-60s.

📋 Reply With
text
1. Which option? A / B
2. Test-Path "index.ts" result: ___
3. Expo started clean? Yes/No
4. App loaded on iPhone? Yes/No — screenshot
My recommendation: Option B. It matches Expo conventions and won't break if you add more setup later.

Do it now and paste results. 👇

send me the whole new code to change
🚀 Complete Files to Fix the Entry Point
Two files to change. Then restart Expo.

📄 FILE 1: apps\mobile\package.json (REPLACE ENTIRE)
Open in VS Code → Ctrl+A → paste:

json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@church/shared": "file:../../packages/shared",
    "@hookform/resolvers": "^5.9.1",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.18.18",
    "@react-navigation/native": "^7.3.18",
    "@react-navigation/native-stack": "^7.18.10",
    "@tanstack/react-query": "^5.102.8",
    "axios": "^1.20.0",
    "expo": "~54.0.22",
    "expo-linear-gradient": "~14.0.2",
    "expo-status-bar": "~3.0.1",
    "react": "19.2.3",
    "react-hook-form": "^7.88.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "^5.9.1",
    "react-native-screens": "~4.16.0",
    "zod": "^3.25.76",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@types/react": "~19.2.3",
    "typescript": "~5.9.3"
  },
  "private": true
}
⚠️ Important: The versions here match what npx expo install --check recommended. If you get errors after this, we'll adjust.

Save.

📄 FILE 2: apps\mobile\index.ts (CREATE NEW)
In VS Code Explorer:

Right-click on the mobile folder (top-level)

New File

Name it: index.ts

Paste:

ts
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
Save.

🚀 Then Do This
Step 1 — Stop Expo
In the Expo terminal: Ctrl+C

Step 2 — Verify the entry file exists
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
Test-Path "index.ts"
Should print True.

Step 3 — Restart Expo with cache clear
text
npx expo start --tunnel --clear
Wait 30-60 seconds for:

text
✔ Tunnel ready
› Metro: exp://xxxxx-anonymous-XXXX.exp.direct
Step 4 — Scan from iPhone
Open Camera app

Point at QR code

Tap "Open in Expo Go"

Wait 30-60s

Expected: Purple login screen.

⚠️ If package.json Versions Fail
If after restarting, you see errors like:

text
Cannot find module 'expo-linear-gradient'
or version conflicts, run this to fix versions automatically:

text
npx expo install --check
Then:

text
npx expo install --fix
This will correct the versions to match your Expo SDK.

📋 Reply With
text
1. Both files replaced? Yes/No
2. Test-Path index.ts: ___
3. Expo start output: ___
4. App loaded on iPhone? Yes/No — screenshot
5. Any red errors in Expo terminal? ___
Paste both files, save, restart Expo with --clear.

If it still fails, paste the new terminal error and I'll fix it. 👇

🎯 Two Issues in the Screenshot
Issue 1: index.ts has wrong content
Look at the editor tab — your index.ts shows:

ts
import { registerRootComponent } from "expo";
import App from "../../App";
Wrong path! It says "../../App" — but it should be "./App".

Why: earlier when we pasted the AppEntry.js content, the path ../../App got copied into your index.ts. But since your index.ts lives at apps/mobile/index.ts, and App.tsx lives at apps/mobile/App.tsx, the correct path is "./App".

Fix: Open apps\mobile\index.ts → Ctrl+A → paste:

ts
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
Save.

Issue 2: package.json warning
text
Unable to load schema from 'https://www.schemastore.org/package'
Unable to connect... getaddrinfo ENOTFOUND www.schemastore.org
This is NOT an error — it's just VS Code trying to fetch JSON schema documentation for package.json and failing because you're on tethered internet.

Ignore it. The app will still work.

🚀 Then Restart Expo
In the Expo terminal:

text
Ctrl+C
text
npx expo start --tunnel --clear
Wait for the new QR code.

Scan with iPhone Camera → tap "Open in Expo Go".

Expected: Purple login screen loads.

📋 Reply With
text
1. After fixing index.ts — npx tsc --noEmit output: ___
2. npx expo start --tunnel --clear output (last 10 lines): ___
3. App loaded on iPhone? Yes/No — screenshot
The ../../App → ./App change is the key fix. 👇

import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App); still giving the same error
🎯 Let's Get the Exact Error
"Same error" could mean a few different things. I need the actual text.

🔍 Step 1 — Which Error Is It?
A) Red screen on iPhone with "Unable to resolve module ../../App"

B) Red screen with a different message

C) Terminal error (from npx expo start)

D) Nothing loads, stuck on splash

E) Something else

🔍 Step 2 — Run This Test
In a terminal:

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
text
Get-Content "index.ts"
Paste the output.

Expected:

text
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
text
Get-Content "package.json" | Select-String "main"
Paste the output.

Expected:

text
"main": "index.ts",
🔍 Step 3 — Clear Everything and Restart
Sometimes Metro caches the old bundle. Do a full clean restart:

1. Stop Expo
Ctrl+C in the Expo terminal.

2. Nuke Metro cache
text
Remove-Item "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue
3. Also delete the local .expo folder
text
Remove-Item ".expo" -Recurse -Force -ErrorAction SilentlyContinue
4. Restart Expo with --clear flag
text
npx expo start --tunnel --clear
Wait for QR code.

5. Fully close Expo Go on iPhone (swipe up from the app switcher), then rescan the QR code.
⚠️ Just re-opening the old app won't work — you must close Expo Go completely and re-scan.

🔍 Step 4 — Check the Terminal Error
When you scan the QR code, the Expo terminal should print:

text
iOS Bundling...
or

text
error: ...
Paste the last 20-30 lines of the Expo terminal after scanning.

That's the actual error — the phone red screen is just a summary.

📋 Reply With
text
1. Which error? A / B / C / D / E
2. Get-Content index.ts: ___
3. Get-Content package.json main field: ___
4. Expo terminal output after scanning QR (last 20 lines): ___
🅱️ Fallback — Try Web Mode
If iPhone keeps failing, let's confirm the code works in the browser first:

text
Ctrl+C
npx expo start --web
It opens Chrome at http://localhost:8081.

Screenshot what you see.

✅ Purple login screen → code is correct, phone issue is network

❌ Red error → paste it, we fix the code

This removes the phone variable. If web works, we know the code is fine.

Run Step 2 first — paste index.ts and package.json main field. Then Step 4 — the terminal error after scanning.

If nothing works in 2 minutes, do the Fallback (web mode) — it's 10 seconds. 👇

PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments>cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Test-Path "App.tsx"
True
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Test-Path "..\..\App.tsx"
False
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Test-Path "..\..\node_modules\expo"
True
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Test-Path "node_modules\expo"Get-Content "package.json" | Select-String "main"
Test-Path : A positional parameter cannot be found 
that accepts argument 'Get-Content'.
At line:1 char:1
+ Test-Path "node_modules\expo"Get-Content 
"package.json" | Select-Stri ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~
    + CategoryInfo          : InvalidArgument: (:)  
   [Test-Path], ParameterBindingException
    + FullyQualifiedErrorId : PositionalParameterNo 
   tFound,Microsoft.PowerShell.Commands.TestPathCo  
  mmand
 
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Get-Content "package.json" | Select-String "main"

  "main": "index.ts",


PS C:\Users\cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile"
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile> Get-Content "index.ts"
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
PS C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\apps\mobile>
✅ All Files Look Correct Now
App.tsx at mobile = ✅

package.json main = "index.ts" ✅

index.ts content = correct ✅

So why is the error still happening? Almost certainly Metro cache. The bundler is serving the old cached version.

🚀 Do a Full Clean Restart
Step 1 — Stop Expo
In the Expo terminal: Ctrl+C

Step 2 — Delete local Expo cache
text
Remove-Item ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Step 3 — Delete Metro global cache
text
Remove-Item "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue
Step 4 — Restart Expo with --clear
text
npx expo start --tunnel --clear
Wait 30-60 seconds.

Step 5 — Force close Expo Go on iPhone
CRITICAL: Don't just switch away — fully kill Expo Go:

On iPhone, swipe up from bottom → shows app switcher

Swipe Expo Go up and away to force-close it

Now open the Camera app

Point at the QR code

Tap "Open in Expo Go"

Wait 30-60 seconds.

🚨 If Still Broken — The Definitive Test
Run this in the Expo terminal (don't scan QR yet):

text
Ctrl+C
npx expo start --web
This opens Chrome at http://localhost:8081.

Screenshot what you see in Chrome.

✅ Purple login screen → code is correct, phone issue is Metro tunnel cache

❌ Red error → paste it, we fix the code

Do this 10-second test before more phone attempts. It's the fastest way to know if the code is fine or broken.

📋 Reply With
text
1. After clean restart — did iPhone load app? Yes/No
2. If No — npx expo start --web output (Chrome screenshot): ___
3. Any terminal errors during restart: ___
Do Step 1-5 (clean restart + force-close Expo Go) first. 90% chance this fixes it.

If still failing, run npx expo start --web and screenshot Chrome. That single test tells us everything. 👇

🎯 Same Error — A Corrupted package.json Inside node_modules
Look at the path in the error:

text
C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments\node_modules\metro\src\node-haste\PackageCache.js
Metro is trying to JSON.parse() a package.json file and failing. But which one? The error doesn't say directly — it just says "line 27:27" of Metro's own code.

This means: somewhere in your node_modules, there's a package.json file that has garbage before the {.

Most likely: the file has a BOM (byte order mark) or a stray character at the beginning.

🔍 Step 1 — Find the Corrupted package.json
Run this — it finds all package.json files that fail to parse:

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
Get-ChildItem -Path "node_modules" -Recurse -Filter "package.json" -ErrorAction SilentlyContinue | ForEach-Object { try { $null = Get-Content $_.FullName -Raw | ConvertFrom-Json } catch { Write-Host "❌ CORRUPTED: $($_.FullName)" -ForegroundColor Red } }
⚠️ This will take 30-90 seconds (thousands of package.json files).

Paste the output — it'll list any corrupted files.

🔍 Step 2 — Check Metro's Own package.json
The error path mentions metro. Let's check that specific one:

text
Get-Content "node_modules\metro\package.json" -TotalCount 3 | Format-Hex
Paste the output.

Expected: starts with 7B 0D 0A (that's { + newline) or 7B 22 ({").

If it starts with EF BB BF 7B → there's a UTF-8 BOM. That's the corruption.

🔍 Step 3 — Broad Check for BOM-Corrupted Files
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
Get-ChildItem -Path "node_modules" -Recurse -Filter "package.json" -ErrorAction SilentlyContinue | Where-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $bytes.Length -gt 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
} | Select-Object FullName
This finds every package.json with a BOM — the likely culprit.

Paste the output.

⚠️ Again, 30-90 seconds.

🅱️ If That's Too Slow — The Nuclear Option
Just wipe node_modules and reinstall. It's guaranteed to fix it.

Stop Expo first (Ctrl+C).

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item "apps\mobile\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "apps\web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "packages\shared\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Then:

text
npm install
⚠️ Wait 5-15 minutes. Do NOT interrupt.

Then verify — check Metro's package.json is clean now:

text
Get-Content "node_modules\metro\package.json" -TotalCount 1
Should print: {

Then restart Expo:

text
cd apps\mobile
npx expo start --tunnel --clear
📋 Reply With
text
1. Corrupted files found (from Step 1): ___
2. Metro package.json first bytes (from Step 2): ___
3. Files with BOM (from Step 3): ___
OR — just do the nuclear option. It's 15 minutes but guaranteed.

Given how many times we've hit corruption from the earlier paste issues, the nuclear option is honestly the safest path here. 👇

Run the reinstall now and tell me when npm install finishes.

🎯 FOUND IT — The Corrupted File Is in @church/shared
Look at the Import stack in the error:

text
apps\mobile\src\lib\api.ts
  | import "@church/shared"

apps\mobile\App.tsx
  | import "./src/lib/api"

apps\mobile\index.ts
  | import "./App"
Metro traced the error from index.ts → App.tsx → api.ts → @church/shared.

The corrupted package.json is at packages\shared\package.json.

When we set that file up earlier with an Out-File command, the file got a BOM ('') at the start — exactly what the error says:

Unexpected token '', "{ "name"... is not valid JSON

🔍 Verify
Run:

text
Get-Content "packages\shared\package.json" -TotalCount 2 | Format-Hex
You should see something like:

text
EF BB BF 7B 0D 0A   ← the EF BB BF is the BOM = corrupted
Paste the output.

✅ Fix — Rewrite Without BOM
Step 1 — Overwrite the file with clean content (using ASCII encoding, which has no BOM):

text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
text
@'
{
  "name": "@church/shared",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./api": "./src/api.ts",
    "./validation": "./src/validation.ts",
    "./endpoints": "./src/endpoints/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
'@ | Out-File -FilePath "packages\shared\package.json" -Encoding ascii -Force
⚠️ Important: Notice the @' ... '@ (single-quoted here-string). This avoids PowerShell interpolating anything.

Step 2 — Verify it's clean:

text
Get-Content "packages\shared\package.json" -TotalCount 2 | Format-Hex
Expected: starts with 7B 0D 0A (that's { and newline). No EF BB BF prefix.

Step 3 — Also check other important package.json files

text
Get-Content "package.json" -TotalCount 2 | Format-Hex
Get-Content "apps\mobile\package.json" -TotalCount 2 | Format-Hex
Get-Content "apps\web\package.json" -TotalCount 2 | Format-Hex
If any show EF BB BF, fix them the same way.

🚀 Then Restart Expo
text
cd apps\mobile
Ctrl+C  (if Expo still running)
npx expo start --tunnel --clear
Scan from iPhone.

Expected: Purple login screen loads.

📋 Reply With
text
1. Format-Hex of packages\shared\package.json (before fix): ___
2. After fix — Format-Hex again: ___
3. Other 3 package.json files — any BOM? ___
4. Expo restart output: ___
5. App loaded on iPhone? Yes/No — screenshot
💡 Why This Happened
Earlier, when we created packages\shared\package.json with:

text
"@ | Out-File -FilePath "packages\shared\package.json" -Encoding utf8 -Force
PowerShell's -Encoding utf8 adds a BOM by default in Windows PowerShell 5.x.

Node.js's JSON.parse() can't handle a BOM — hence Metro's crash.

The fix: always use -Encoding ascii (or -Encoding utf8NoBOM on PowerShell 7+).

Run Step 1's Format-Hex first to confirm. Then apply the fix. 👇

🎯 Found the Cached Credential — Let's Delete It
Your Windows Credential Manager has:

text
Target: LegacyGeneric:target=git:https://github.com
That's the wrong-user credential. Delete it.

📋 Step 1 — Delete the Cached Credential
Copy the exact target name from above:

text
cmdkey /delete:LegacyGeneric:target=git:https://github.com
Expected: CMAKED: Credential deleted successfully.

Verify it's gone:

text
cmdkey /list | findstr git
Should print nothing.

📋 Step 2 — Push Again
text
git push origin main
Expected:

A popup window appears (Git Credential Manager)

OR terminal asks for username/password

Enter:

Username: mwapejoe14-bit

Password: Personal Access Token for mwapejoe14-bit

🔑 If You Don't Have a Token for mwapejoe14-bit
Generate one now:

Open browser in Incognito/Private mode (or log out first)

Go to https://github.com/login

Log in as mwapejoe14-bit

Verify top-right shows mwapejoe14-bit

Go to https://github.com/settings/tokens

Generate new token → Generate new token (classic)

Note: Lenovo-git-cli

Expiration: 90 days

Scopes: ✅ repo (full control)

Scroll down → Generate token

COPY the token (starts with ghp_...)

Paste it as the password when Git prompts.

📋 Step 3 — Verify Push Succeeded
Expected output:

text
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
...
To https://github.com/mwapejoe14-bit/church-payments-api.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
Then open:
👉 https://github.com/mwapejoe14-bit/church-payments-api

Should show all your files.

🅱️ If Login Still Shows tech-kilubi
Windows may auto-fill the wrong user. Do this:

Delete the credential again:

text
cmdkey /delete:LegacyGeneric:target=git:https://github.com
Also clear generic github credentials:

text
cmdkey /list
Look for any entry with github.com → delete each

Disable Git Credential Manager temporarily:

text
git config --global credential.helper ""
Push with explicit credentials in URL (one-time):

text
git push https://mwapejoe14-bit:YOUR_TOKEN_HERE@github.com/mwapejoe14-bit/church-payments-api.git main
⚠️ Replace YOUR_TOKEN_HERE with your actual token. This bypasses the credential manager entirely.

After success, restore the helper:

text
git config --global credential.helper manager
🅲 Nuclear Option — SSH Keys (No More Password Prompts Ever)
If you keep fighting credentials, switch to SSH:

1. Generate key
text
ssh-keygen -t ed25519 -C "mwapejoe14@gmail.com"
Press Enter 3 times (default path, no passphrase).

2. Copy public key
text
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
3. Add to GitHub mwapejoe14-bit account
Log into mwapejoe14-bit in browser

Go to https://github.com/settings/keys

New SSH key

Title: Lenovo

Key: paste (Ctrl+V)

Add SSH key

4. Test
text
ssh -T git@github.com
Should say: Hi mwapejoe14-bit! You've successfully authenticated...

5. Change remote
text
git remote set-url origin git@github.com:mwapejoe14-bit/church-payments-api.git
6. Push
text
git push origin main
No more prompts.

📋 Reply With
text
1. cmdkey /list | findstr git (after delete): ___
2. git push origin main output: ___
3. If prompted — which username appeared? ___
4. Push succeeded? Yes/No
5. Any errors: ___
Delete the credential (Step 1) and push again (Step 2). 👇

If the wrong user still appears, go with the SSH approach — it's the cleanest fix.

This response is AI-generated, for reference only.
🎉 Credentials Fixed — Now Just One Last Step
Look at the new error:

text
! [rejected]  main -> main (fetch first)
error: failed to push some refs
hint: Updates were rejected because the remote contains work that you do not have locally.
Translation: Your GitHub repo (mwapejoe14-bit/church-payments-api) already has commits (probably a README or initial commit auto-created by GitHub). Your local repo has a different history. Git refuses to overwrite.

Good news: The credential issue is fully fixed — Git authenticated as mwapejoe14-bit (no more tech-kilubi error).

✅ Fix — Force Push (Safe Here)
Since this is a fresh repo you just created, and you own both sides, force push is safe:

text
git push origin main --force
Expected:

text
Enumerating objects: 45, done.
...
To https://github.com/mwapejoe14-bit/church-payments-api.git
 + abc1234...def5678 main -> main (forced update)
🅱️ Alternative — Pull Then Push (Safer, More "Correct")
If you want to keep whatever's on GitHub (probably just a default README):

text
git pull origin main --allow-unrelated-histories
When the merge editor opens:

Press Ctrl+X (notepad)

Press Y to save

Press Enter to confirm filename

Then push:

text
git push origin main
This merges GitHub's initial commit with yours. You may see a merge conflict if GitHub had a README — just resolve it.

🎯 My Recommendation
Use the force push. Since you're the owner and this is your initial push, there's nothing of value on the GitHub side worth preserving:

text
git push origin main --force
📋 Reply With
text
1. git push --force output: ___
2. Any errors: ___
3. Open https://github.com/mwapejoe14-bit/church-payments-api — files visible? Yes/No
🎯 After Push Succeeds
Verify on GitHub:

Open 👉 https://github.com/mwapejoe14-bit/church-payments-api

You should see:

✅ Latest commit: "Phase 1: Add children, fee structures, results, batch payments"

✅ src/ folder with all your controllers, models, routes

✅ package.json, server.js, .gitignore

❌ No .env, no node_modules

🚀 Then Frontend
Once backend is pushed:

Go to https://github.com/new

Create repo: church-payments-frontend

Private

No README / .gitignore / license (leave unchecked)

Then we push church-payments folder

Run the force push now and paste result. 👇

🎉🎉🎉 BACKEND PUSHED TO GITHUB
Look at the final line:

text
To https://github.com/mwapejoe14-bit/church-payments-api.git
 + fe84799...0c192c1 main -> main (forced update)
Your backend is now live on GitHub. 2261 objects pushed, ~3 MB total.

✅ Verify It Worked
Open in your browser:

👉 https://github.com/mwapejoe14-bit/church-payments-api

You should see:

✅ Latest commit: "Phase 1: Add children, fee structures, results, batch payments"

✅ src/ folder

✅ package.json, server.js, .gitignore

❌ No .env (good — that has secrets)

❌ No node_modules (good — those are huge)

Click through:

src → controllers → should see adminController.js, childController.js, etc.

src → models → should see Child.js, FeeStructure.js, PaymentBatch.js, Result.js

src → routes → should see adminRoutes.js, childRoutes.js, etc.

Screenshot it — that's your first deployed repo. 🎉

🚀 Now the Frontend
Step 1 — Create the Frontend Repo on GitHub
Open https://github.com/new

Fill in:

Repository name: church-payments-frontend

Description: Church + PTA mobile + web app (React Native, Expo, Vite)

Visibility: Private

❌ Leave all "Initialize this repository with" boxes UNCHECKED

Click Create repository

Step 2 — Go to the Frontend Folder
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
Step 3 — Check Git Status
text
git status
Paste the output.

If "not a git repository" → we init

If it's a git repo → check current branch and remotes

📋 Reply With
text
1. GitHub backend URL loads correctly? Yes/No — screenshot
2. Frontend repo created? Yes/No
3. Frontend git status: ___
4. Frontend git remote -v (if any): ___
Then we'll push the frontend (which has the same JollyLwiindi issue to fix).

Take a moment — you've officially shipped your first backend to GitHub. 🚀

Paste the frontend git status next. 👇

https://github.com/mwapejoe14-bit/church-payments-frontend.git
🚀 Push Frontend to mwapejoe14-bit/church-payments-frontend
Let's do the same, but this repo is fresh so it should be easier.

📋 Step 1 — Navigate to Frontend Folder
text
cd "C:\Users\SIMS-TECH ZAMBIA\Finals\church-payments"
Verify:

text
Get-Location
Should show ...\Finals\church-payments

📋 Step 2 — Check Git Status
text
git status
Paste the output.

Two possibilities:

🅰️ If "not a git repository":
text
git init
git branch -M main
🅱️ If already a git repo:
Check branch:

text
git branch -M main
Check existing remote:

text
git remote -v
If a remote exists (maybe JollyLwiindi or old repo):

text
git remote set-url origin https://github.com/mwapejoe14-bit/church-payments-frontend.git
If no remote:

text
git remote add origin https://github.com/mwapejoe14-bit/church-payments-frontend.git
📋 Step 3 — Create .gitignore
Check if it exists:

text
Get-Content .gitignore -ErrorAction SilentlyContinue
If empty or wrong, rewrite it:

text
@"
# Dependencies
node_modules/

# Env files
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
web-build/

# Expo
.expo/
.expo-shared/

# Turbo
.turbo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/

# Vercel
.vercel
"@ | Out-File -FilePath ".gitignore" -Encoding ascii -Force
Verify:

text
Get-Content .gitignore
📋 Step 4 — Check What Would Be Committed
⚠️ CRITICAL step — the frontend has node_modules in 4 places. We need to make sure none get committed.

text
git add .
Then:

text
git status
Look for node_modules in the list. It should NOT appear.

If you see node_modules anywhere:

text
git rm -r --cached node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/web/node_modules -ErrorAction SilentlyContinue
git rm -r --cached packages/shared/node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/.expo -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/android -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/ios -ErrorAction SilentlyContinue
git add .
git status
Also check for .env files:

text
git status | Select-String "\.env"
If .env files appear → they're fine to commit if they only have API URLs (not secrets). Frontend .env typically has:

text
VITE_API_URL=https://trousers-bucked-syndrome.ngrok-free.dev/api
That's not a secret, so OK to commit.

📋 Step 5 — Verify Staged Files List
Expected to see:

✅ package.json, package-lock.json, turbo.json, tsconfig.base.json

✅ apps/mobile/ (files but NOT node_modules)

✅ apps/web/ (files but NOT node_modules)

✅ packages/shared/ (files but NOT node_modules)

❌ NO node_modules folders

❌ NO .expo folders

📋 Step 6 — Commit
text
git commit -m "Initial commit: Church + PTA mobile + web app"
Expected:

text
[main (root-commit) abc1234] Initial commit: Church + PTA mobile + web app
 200+ files changed, 50000+ insertions(+)
 ...
📋 Step 7 — Push to GitHub
text
git push -u origin main
First push will prompt for credentials — but we cleared them earlier. It should:

Ask for username → mwapejoe14-bit

Ask for password → Personal Access Token

Or it might fail with "fetch first" (if GitHub added initial files). Then:

text
git push origin main --force
Expected success:

text
To https://github.com/mwapejoe14-bit/church-payments-frontend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
✅ Step 8 — Verify on GitHub
Open:

👉 https://github.com/mwapejoe14-bit/church-payments-frontend

Check:

✅ apps/ folder

✅ packages/ folder

✅ package.json

❌ No node_modules

📋 Reply With
text
1. git status after add .: ___
2. Any node_modules appear? Yes/No
3. Commit output: ___
4. Push output: ___
5. GitHub URL shows files? Yes/No
🚨 Common Issues
Issue	Fix
node_modules in git status	Run the git rm -r --cached commands
Push rejected (fetch first)	git push origin main --force
403 Permission denied	cmdkey /delete:LegacyGeneric:target=git:https://github.com then retry
.expo folder listed	Add to .gitignore and re-add
Very slow push	First push of 50k+ files can take 5-10 minutes
🎯 After Push Succeeds
You'll have two repos live:

Repo	URL
Backend	https://github.com/mwapejoe14-bit/church-payments-api
Frontend	https://github.com/mwapejoe14-bit/church-payments-frontend
Then you can:

Deploy backend to Render

Deploy web to Vercel

Build mobile with EAS

Share with supervisor

Run Steps 1-8 and paste outputs. 👇

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validatePayment } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", validatePayment, makePayment);
router.post("/batch", makeBatchPayment);
router.get("/my-payments", getMyPayments);
router.get("/admin/all", adminOnly, getAllPayments);
router.get("/batch/:batchId", getBatch);

export default router;
🎯 That's the paymentRoutes.js File — All Correct
Looks good — that's the current state of your backend routes. No action needed unless something's broken.

Question: Why did you paste this? What are you trying to do?

🔍 Possible Reasons You Sent This
Pick one:

🅰️ You're still debugging a payment error
Tell me the error and we'll fix it.

🅱️ You want to add more routes
Tell me what feature (e.g., refunds, receipts, payment history filters).

🅲 You want to continue pushing frontend to GitHub
Say "frontend push" — we'll pick up where we left off.

🅳 You're double-checking the file is correct
Yes, it's correct. ✅

router.use(protect) — all routes need auth

Single POST / — no duplicate

makeBatchPayment, getMyPayments, getAllPayments, getBatch all present

adminOnly on the admin list route

🅴 Something else?
Explain what you're trying to do.

📋 Reply With
text
1. What you're trying to do: ___
2. Any error message: ___
3. Next step: frontend push / test app / fix bug / other
🎯 Current Status Recap
Task	Status
Backend on GitHub	✅ Pushed
Frontend on GitHub	⏳ Pending
MongoDB	✅ Windows Service
Backend running	✅ Port 5000
Mobile app	✅ On iPhone
Web dashboard	✅ Working
Payment API	✅ Working
What's your next move? 👇

🎯 Good Progress — Add Remote and Push
Your frontend is git-initialized with a .gitignore. Now add the GitHub remote and push.

📋 Step 1 — Update .gitignore (Add More Rules)
Your current .gitignore is good but missing a few things. Let's update it:

text
@"
# Dependencies
node_modules/

# Env files
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
web-build/

# Expo
.expo/
.expo-shared/

# Turbo
.turbo

# Logs
*.log
npm-debug.log*

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/

# Vercel
.vercel
"@ | Out-File -FilePath ".gitignore" -Encoding ascii -Force
Verify:

text
Get-Content .gitignore
📋 Step 2 — Add the Remote
text
git remote add origin https://github.com/mwapejoe14-bit/church-payments-frontend.git
Verify:

text
git remote -v
Expected:

text
origin  https://github.com/mwapejoe14-bit/church-payments-frontend.git (fetch)
origin  https://github.com/mwapejoe14-bit/church-payments-frontend.git (push)
📋 Step 3 — Stage Everything
text
git add .
📋 Step 4 — Verify What's Staged
⚠️ Critical check — the frontend has node_modules in 4 places. Make sure they're not staged.

text
git status
Look for:

✅ package.json, package-lock.json, turbo.json, tsconfig.base.json

✅ apps/mobile/... files (but NOT apps/mobile/node_modules/)

✅ apps/web/... files (but NOT apps/web/node_modules/)

✅ packages/shared/... files (but NOT packages/shared/node_modules/)

❌ NO node_modules folders

❌ NO .expo folders

If you see node_modules anywhere in the list, run:

text
git rm -r --cached node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/web/node_modules -ErrorAction SilentlyContinue
git rm -r --cached packages/shared/node_modules -ErrorAction SilentlyContinue
git rm -r --cached apps/mobile/.expo -ErrorAction SilentlyContinue
git add .
git status
📋 Step 5 — Check File Count
If node_modules somehow got staged, you'd see 50,000+ files. If not, you'll see ~150-300 files.

Quick check:

text
git status --short | Measure-Object
Paste the Count. Should be under 500. If it's over 10,000 → node_modules got staged, run the git rm commands above.

📋 Step 6 — Commit
text
git commit -m "Initial commit: Church + PTA mobile + web app"
Expected:

text
[main (root-commit) abc1234] Initial commit: Church + PTA mobile + web app
 200 files changed, 40000 insertions(+)
 ...
Paste the output.

📋 Step 7 — Push to GitHub
text
git push -u origin main
Since the GitHub repo may have an initial README, you might see:

text
! [rejected]  main -> main (fetch first)
Then run:

text
git push -u origin main --force
Expected success:

text
To https://github.com/mwapejoe14-bit/church-payments-frontend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
✅ Step 8 — Verify on GitHub
Open:

👉 https://github.com/mwapejoe14-bit/church-payments-frontend

Should show:

✅ apps/ folder with mobile/ and web/

✅ packages/ folder with shared/

✅ package.json

❌ No node_modules

📋 Reply With
text
1. git remote -v output: ___
2. git status --short | Measure-Object — Count: ___
3. Commit output: ___
4. Push output: ___
5. Any errors: ___
6. GitHub URL shows files? Yes/No
Run Steps 1-7. 👇

If node_modules got staged, the file count will be huge — check that first.

🎯 Two Issues to Fix Before Committing
Issue 1: apps/mobile Is Being Treated as a Submodule
Look at this line:

text
new file: apps/mobile
...
modified: apps/mobile (modified content, untracked content)
Git thinks apps/mobile is a submodule (a nested git repo). This happens because apps/mobile has its own .git folder (from when you ran git init earlier during backend/frontend work).

The result: Only the folder pointer gets committed, not the files inside. Your mobile app code won't be on GitHub.

Issue 2: apps/mobile Files Are Missing
The list shows apps/web/... files but no apps/mobile/src/... files. Same reason — mobile is being treated as a submodule.

🔧 Fix — Remove Nested .git from apps/mobile
Step 1 — Check if mobile has its own .git
text
Test-Path "apps\mobile\.git"
If it prints True → that's the problem.

Step 2 — Remove the nested .git folder
text
Remove-Item "apps\mobile\.git" -Recurse -Force
Step 3 — Also check apps/web and packages/shared
text
Test-Path "apps\web\.git"
Test-Path "packages\shared\.git"
If True for either → remove them too:

text
Remove-Item "apps\web\.git" -Recurse -Force
Remove-Item "packages\shared\.git" -Recurse -Force
Step 4 — Unstage everything
text
git rm -r --cached . > $null
This removes everything from the staging area (files stay on disk).

Step 5 — Re-stage everything
text
git add .
Step 6 — Verify
text
git status
Now you should see:

✅ apps/mobile/src/App.tsx, apps/mobile/src/screens/..., etc. (individual files)

✅ NOT just apps/mobile as a single line

Paste the output.

🔍 Quick Check — Count Files
text
git status --short | Measure-Object
Paste the Count.

Under 500 → ✅ good

Over 10,000 → ❌ node_modules snuck in, let me know

📋 After Fix — Commit & Push
Once git status shows the mobile files properly:

text
git commit -m "Initial commit: Church + PTA mobile + web app"
text
git push -u origin main
If push is rejected:

text
git push -u origin main --force
📋 Reply With
text
1. Test-Path apps\mobile\.git: ___
2. Test-Path apps\web\.git: ___
3. Test-Path packages\shared\.git: ___
4. After removing and re-adding — git status (paste)
5. git status --short | Measure-Object — Count: ___
Run the checks first, then remove the nested .git folders. 👇

This is the same class of issue that hit the backend — nested repos confuse Git. Fix is quick.


