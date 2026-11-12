# BantayBayad (Interactive Prototype)

> **"Protektado ang Pera, Sigurado ang Benta."**

BantayBayad is a front-end escrow and identity verification platform engineered for online peer-to-peer buyers and sellers in the Philippines who do not know each other. It mitigates digital fraud by combining eKYC verification, device binding, vaulted escrow deposits, third-party courier telemetry, and automated evidence dossiers compliant with the **Anti-Financial Account Scamming Act (AFASA / Republic Act No. 12010)**.

---

## 📌 Problem Context
Online commerce in the Philippines predominantly runs on blind trust without statutory escrow:
- **#1 Reported Cybercrime**: Online scams are the top reported cybercrime to the Philippine National Police Anti-Cybercrime Group (PNP-ACG).
- **11% Recovery Rate**: Only 11% of scam victims ever recover their funds.
- **77% Fraud Exposure**: 77% of Filipinos encounter digital financial fraud annually (GASA 2025).

---

## 🛠 Tech Stack
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Royal Blue branding (`#0033B8`, `#0A7BFF`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `localStorage` persistence
- **Icons**: [lucide-react](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: Google Fonts — Plus Jakarta Sans

---

## 📁 Project Structure

```
bantaybayad/
├── index.html                     # HTML5 entry with Plus Jakarta Sans & SEO meta
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── README.md                      # Architecture & integration documentation
└── src/
    ├── main.jsx                   # React root entry
    ├── App.jsx                    # Router, phone frame shell, responsive toggle
    ├── index.css                  # Tailwind tokens, phone frame & animations
    │
    ├── assets/                    # Static assets & logos
    │
    ├── components/                # Reusable UI primitives
    │   ├── BottomNav.jsx          # Mobile tab navigation (Home, Dash, New, Verify, Plans)
    │   ├── DemoControls.jsx       # Floating demo controls (role switch, courier FF, reset)
    │   ├── Footer.jsx             # UN SDG 10 & 16 badges and partner mentions
    │   ├── Header.jsx             # Top bar, prototype banner, EN/FIL language switch
    │   ├── Logo.jsx               # Police cap over "B" SVG insignia
    │   ├── ProgressStepper.jsx    # Visual 6-stage escrow state stepper
    │   ├── ToastContainer.jsx     # Floating animated notification system
    │   └── UI.jsx                 # Button, Card, StatusChip, VerifiedBadge, Spinners
    │
    ├── data/                      # Seed data & localization
    │   ├── seedData.js            # 3 preloaded transactions, plans, valid transitions
    │   └── translations.js        # English and Filipino (Taglish) translations
    │
    ├── pages/                     # Complete 10-screen flow
    │   ├── Landing.jsx            # Screen 1: Hero, 3 PNP/GASA stats, 6-step flow, plans
    │   ├── Verification.jsx       # Screen 2: Gov ID upload, webcam/liveness scan, device binding
    │   ├── Dashboard.jsx          # Screen 3: Verification badge, daily gauge, transaction cards
    │   ├── CreateTransaction.jsx  # Screen 4: Deal form, 2.5% fee breakdown, daily limit guard
    │   ├── ReVerify.jsx           # Screen 5: Face re-scan before locking deal
    │   ├── DepositFunds.jsx       # Screen 6: QR Ph, GCash, Maya, Xendit, animated vault lock
    │   ├── TransactionDetail.jsx  # Screen 7 & 8: Courier booking, 24h countdown, mutual release, dispute
    │   ├── EvidenceReport.jsx     # Screen 9: Printable AFASA RA 12010 audit dossier & PDF export
    │   └── Pricing.jsx            # Screen 10: Freemium vs Pro comparison & mock upgrade
    │
    ├── services/                  # Mock API layer (800-1500ms async simulation)
    │   ├── ekycService.js         # Government ID OCR & biometric liveness
    │   ├── paymentService.js      # QR Ph generation, escrow deposit, fund release
    │   └── courierService.js      # Lalamove delivery dispatch & tracking
    │
    └── store/
        └── useStore.js            # Zustand store with state machine & localStorage sync
```

---

## ⚡ Setup & Run Instructions

```bash
# 1. Clone or open the project directory
cd bantaybayad

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production preview
npm run build
```

---

## 🔄 Escrow State Machine
The core transaction lifecycle enforces strict transitions defined in `src/data/seedData.js` and validated in `src/store/useStore.js`:

```
DRAFT ──> REVERIFIED ──> FUNDED ──> SHIPPED ──> DELIVERED ──┬──> RELEASED
                                                            └──> DISPUTED
```

1. **`DRAFT`**: Deal created with item details, price, and condition.
2. **`REVERIFIED`**: User passes biometric face re-scan to lock agreement.
3. **`FUNDED`**: Buyer deposits payment into the vaulted escrow account (QR Ph / GCash / Maya).
4. **`SHIPPED`**: Seller books courier (Lalamove mock) with real-time tracking code.
5. **`DELIVERED`**: Courier confirms delivery; initiates 24-hour buyer inspection countdown.
6. **`RELEASED`**: Buyer confirms item matches description; funds disburse to seller.
7. **`DISPUTED`**: Either party files a claim; escrow is frozen and an official AFASA evidence dossier is generated.

---

## 🔌 Mock Service to Real API Mapping

| Mock Service | Local File | Production Integration | Implementation Notes |
|---|---|---|---|
| **eKYC & Identity** | `src/services/ekycService.js` | **Jumio**, **Onfido**, or **PhilSys eKYC** | Sends national ID photo for OCR extraction and performs 3D selfie liveness check (ISO/IEC 30107-3 compliant). Returns cryptographic device binding token. |
| **Escrow & Payments** | `src/services/paymentService.js` | **Xendit Philippines** / **QR Ph** | Generates dynamic QR Ph codes and e-wallet checkout sessions (GCash, Maya, ShopeePay, BPI, UnionBank). Holds funds in an escrow vault until webhook release. |
| **Courier Logistics** | `src/services/courierService.js` | **Lalamove Partner API** / **GrabExpress** | Books motorcycle or 4-wheel delivery, retrieves live driver coordinates and updates status (`Booked` ➔ `Picked up` ➔ `In transit` ➔ `Delivered`). |
| **Dispute & Legal** | `src/pages/EvidenceReport.jsx` | **PNP-ACG & NBI Cybercrime Portal** | Formats immutable audit trail and device fingerprints into standardized complaint dossiers under Republic Act 12010 (AFASA). |

---

## 🎮 Presentation & Multi-Device Deployment Modes

### 1. 👥 Dual Screen Live Simulator (Buyer & Seller Side-by-Side)
- Toggle the **👥 Dual Screen (Buyer & Seller)** mode in the top desktop toolbar.
- Renders **two live mobile phones side-by-side**:
  - **Left Phone (Buyer Device)**: Scoped to buyer actions (deposit funds, inspect item, approve release, file dispute).
  - **Right Phone (Seller Device)**: Scoped to seller actions (book courier via Lalamove, monitor transit, receive payout).
- Both phones interact on the **exact same transaction in real-time**:
  - Click **"Deposit Funds"** on the Buyer phone ➔ Seller phone immediately updates to **"Funded! Ready to Ship"**.
  - Click **"Book Courier"** on the Seller phone ➔ Buyer phone immediately updates to **"Courier Dispatched"**.
  - Click **"Confirm & Release"** on the Buyer phone ➔ Seller phone immediately renders the **Payout Receipt**.

### 2. 📱 Multi-Device Interaction (Deployable to 2 Separate Physical Phones)
You can deploy this prototype to **Vercel**, **Netlify**, or run locally on Wi-Fi (`npm run dev -- --host`):
- Click **"Share Links"** on any transaction (or immediately after creating one).
- A modal generates:
  - **Buyer Direct Link**: `[URL]/transaction/[id]?role=buyer&data=[payload]`
  - **Seller Direct Link**: `[URL]/transaction/[id]?role=seller&data=[payload]`
  - **QR Code Generator**: Scan directly with an iPhone or Android camera to open on a second physical device.
- **How Real-Time Sync Works Across Devices**:
  - **Cross-Tab / Same Device**: Synchronizes in **0ms** using the browser's `BroadcastChannel` API and storage event bus.
  - **Separate Devices / Deployed**: Automatically broadcasts updates to a free cloud relay (`api.restful-api.dev`) and continuously polls every 2.5 seconds.
  - **Self-Contained URL Fallback**: The link embeds an encoded base64 transaction payload so even a brand-new phone that has never visited the app will **immediately load the transaction without a backend**.

### 3. ⚡ Floating Demo Controls
A floating button at the bottom-right allows presenters to:
- Switch roles manually (`Buyer` ↔ `Seller`).
- Fast-forward courier shipping stages (`Booked` ➔ `Picked up` ➔ `In transit` ➔ `Delivered`).
- Fast-forward the 24-hour inspection timer to 3 seconds.
- Trigger a demo dispute path.
- Reset all mock data to factory state.

---

## 📜 Legal & Compliance Notes
- Prototype purely handles client-side mock transactions; no real currency or identity records are collected.
- Designed in accordance with **Republic Act No. 12010 (Anti-Financial Account Scamming Act of 2024)** and the **Philippine Data Privacy Act of 2012 (RA 10173)**.
- Aligned with **United Nations Sustainable Development Goals**:
  - **SDG 10**: Reduced Inequalities (financial inclusion for unbanked micro-sellers).
  - **SDG 16**: Peace, Justice, and Strong Institutions (fraud deterrence and rule of law in digital commerce).
