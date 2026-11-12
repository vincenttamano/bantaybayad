// Comprehensive, natural Filipino (Taglish/Metro Manila marketplace) and English translations
const translations = {
  en: {
    // Brand
    appName: 'BantayBayad',
    tagline: 'Protektado ang Pera, Sigurado ang Benta.',
    heroTitle: 'Safe Online Transactions for Every Filipino',
    heroSubtitle: 'Identity-verified escrow protecting buyers and sellers on Facebook Marketplace, Carousell, and chat trades.',
    getStarted: 'Get Started Now',
    howItWorks: 'How It Works',
    pricing: 'Pricing & Plans',
    dashboard: 'Dashboard',
    newTransaction: 'New Transaction',

    // Core Actions
    verify: 'Verify Identity',
    deposit: 'Deposit to Escrow',
    ship: 'Book Courier',
    approve: 'Confirm & Release',
    dispute: 'File Dispute',
    shareLinks: 'Share Deal Links',

    // Workflow Steps
    step1: 'PhilSys eKYC Verification',
    step1desc: 'Upload Philippine government ID and complete a 2-second liveness check.',
    step2: 'Create Escrow Deal',
    step2desc: 'Set the price, condition, and generate a secure deal link for your buyer or seller.',
    step3: 'Biometric Re-Verification',
    step3desc: 'Instant face scan to lock device credentials before funds enter the vault.',
    step4: 'Escrow Vault Deposit',
    step4desc: 'Buyer deposits via QR Ph (GCash, Maya, Bank Transfer). Funds are vaulted safely.',
    step5: 'Courier Dispatch & Tracking',
    step5desc: 'Seller books delivery via partner Lalamove API with real-time GPS tracking.',
    step6: 'Inspection & Payout',
    step6desc: 'Buyer inspects within 24 hours. Once confirmed, funds release to seller.',

    // Stats (Problem & Validation)
    stat1: '#1 Cybercrime in PH',
    stat1desc: 'Online buy-and-sell scams are the top reported cybercrime to PNP-ACG.',
    stat2: 'Only 11% Recovered',
    stat2desc: 'Just 11% of scam victims ever recover their lost funds.',
    stat3: '77% Face Fraud',
    stat3desc: '77% of Filipino online consumers encounter digital scam attempts annually (GASA 2025).',

    // Status Labels
    statusDraft: 'Draft',
    statusReverified: 'Re-verified',
    statusFunded: 'Funded',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    statusReleased: 'Released',
    statusDisputed: 'Disputed',

    // Deal Stages Guidance
    draftBannerTitle: 'Biometric Re-Verification Required',
    draftBannerDesc: 'Under AFASA RA 12010, you must confirm your identity via a 2-second facial scan to lock your device credentials before funds can be deposited.',
    reverifiedBuyerTitle: 'Deposit Funds to Escrow Vault',
    reverifiedBuyerDesc: 'Biometric identity is locked. Deposit into the protected escrow vault. Seller cannot touch these funds until you inspect and approve delivery.',
    reverifiedSellerTitle: 'Awaiting Buyer\'s Deposit',
    reverifiedSellerDesc: 'Buyer has been verified and notified to deposit into escrow. You will be alerted the instant funds are locked in the vault.',
    fundedSellerTitle: 'Funds Vaulted! Dispatch Item Now',
    fundedSellerDesc: 'Payment is safely locked in the escrow vault. You can now dispatch the item with 100% payment guarantee.',
    fundedBuyerTitle: 'Payment Vaulted in Escrow',
    fundedBuyerDesc: 'Your payment is secured in the vault. The seller has been authorized to dispatch your package via Lalamove.',
    shippedTitle: 'Package In Transit',
    deliveredBuyerTitle: '24-Hour Inspection Window',
    deliveredBuyerDesc: 'Inspect your package carefully. If you are satisfied, release funds to the seller. If there is an issue, lodge a dispute before time expires.',
    deliveredSellerTitle: 'Buyer is Inspecting Item',
    deliveredSellerDesc: 'Package delivered. Buyer has 24 hours to inspect. Funds auto-release upon buyer approval or countdown expiry.',

    // Pricing & Lean Canvas
    freePlan: 'Freemium',
    premiumPlan: 'Premium',
    perMonth: '/ month',
    dailyLimit: 'Daily Limit',
    txFee: 'Transaction Fee',
    freeTx: 'Free Deals',
    firstThree: 'First 3 deals/month free',
    upgrade: 'Upgrade to Pro',
    currentPlan: 'Current Plan',
    pricingHeadline: 'Simple, Fair Escrow Pricing',
    pricingSubtitle: '1.5% fee per deal (drops to 0.5% on deals ₱15k+). First 3 deals free every month.',

    // Dossier & Legal
    viewEvidence: 'View Certified Legal Dossier',
    downloadPdf: 'Print / Save Legal PDF',
    back: 'Back',
    buyerView: 'Buyer View 🛒',
    sellerView: 'Seller View 🏪',
    prototypeBanner: '⚠️ Prototype — Simulated Escrow & eKYC (AFASA RA 12010)',
    verified: 'eKYC Verified',
    unverified: 'Unverified',
    language: 'Language',
  },

  fil: {
    // Brand
    appName: 'BantayBayad',
    tagline: 'Protektado ang Pera, Sigurado ang Benta.',
    heroTitle: 'Ligtas na Online na Transaksyon para sa Bawat Pilipino',
    heroSubtitle: 'Escrow na may identity verification para protektado ang buyer at seller sa Facebook Marketplace, Carousell, at chat deals.',
    getStarted: 'Magsimula Na',
    howItWorks: 'Paano Gumagana',
    pricing: 'Presyo at Plano',
    dashboard: 'Dashboard',
    newTransaction: 'Bagong Deal',

    // Core Actions
    verify: 'I-verify ang ID',
    deposit: 'I-deposit sa Vault',
    ship: 'I-book ang Courier',
    approve: 'Kumpirmahin at I-release',
    dispute: 'Mag-file ng Reklamo',
    shareLinks: 'I-share ang Deal Link',

    // Workflow Steps
    step1: 'PhilSys eKYC Verification',
    step1desc: 'I-upload ang Philippine government ID at kumpletuhin ang 2-segundong face scan.',
    step2: 'Gumawa ng Escrow Deal',
    step2desc: 'I-set ang presyo, condition, at mag-generate ng link para kay buyer o seller.',
    step3: 'Biometric Re-Verification',
    step3desc: 'Mabilisang face scan para i-lock ang credentials bago pumasok ang pera sa vault.',
    step4: 'Deposito sa Escrow Vault',
    step4desc: 'Magdedeposito ang buyer gamit ang QR Ph (GCash, Maya, Bank). Ligtas na naka-vault ang pera.',
    step5: 'Courier Dispatch at Tracking',
    step5desc: 'Ibu-book ng seller sa partner Lalamove API na may real-time GPS tracking.',
    step6: 'Inspection at Payout',
    step6desc: 'May 24 oras si buyer para i-check ang item. Pagka-confirm, direktang matatanggap ng seller ang bayad.',

    // Stats (Problem & Validation)
    stat1: '#1 Cybercrime sa Pilipinas',
    stat1desc: 'Ang online buy-and-sell scam ang pinakamadalas i-report sa PNP-ACG.',
    stat2: '11% Lang ang Nababawi',
    stat2desc: 'Kakaunting 11% lang ng mga biktima ng scam ang muling nakakakuha ng pera nila.',
    stat3: '77% ang Nakakaranas ng Fraud',
    stat3desc: '77% ng mga Pilipinong online consumers ang nakakaranas ng tangkang scam taon-taon (GASA 2025).',

    // Status Labels
    statusDraft: 'Draft',
    statusReverified: 'Re-verified',
    statusFunded: 'Funded (Naka-vault)',
    statusShipped: 'Shipped (Kasalukuyang Dinadala)',
    statusDelivered: 'Delivered (Na-deliver)',
    statusReleased: 'Released (Bayad Na)',
    statusDisputed: 'Disputed (Naka-freeze)',

    // Deal Stages Guidance
    draftBannerTitle: 'Kailangan ng Biometric Re-Verification',
    draftBannerDesc: 'Alinsunod sa AFASA RA 12010, kailangang kumpirmahin ang iyong pagkakakilanlan gamit ang 2-segundong face scan para maiwasan ang account takeover bago mag-deposit.',
    reverifiedBuyerTitle: 'I-deposit ang Pera sa Escrow Vault',
    reverifiedBuyerDesc: 'Na-verify na ang identity! I-deposit ang pondo sa ligtas na vault. Hindi ito makukuha ng seller hangga\'t hindi mo nasusuri at naaaprubahan ang item.',
    reverifiedSellerTitle: 'Naghihintay sa Deposito ni Buyer',
    reverifiedSellerDesc: 'Na-verify na ang buyer at inabisuhang mag-deposit sa vault. Makakatanggap ka agad ng alert kapag ligtas nang naka-vault ang bayad.',
    fundedSellerTitle: 'Naka-vault na ang Pera! I-dispatch ang Item',
    fundedSellerDesc: 'Ligtas nang nakakandado ang bayad sa vault. Pwede mo nang ipadala ang item nang may 100% garantiya na matatanggap mo ang bayad.',
    fundedBuyerTitle: 'Nasa Escrow Vault na ang Bayad',
    fundedBuyerDesc: 'Ligtas na ang iyong pera sa vault. Awtorisado na ang seller na i-dispatch ang item sa pamamagitan ng Lalamove.',
    shippedTitle: 'Kasalukuyang Dinadala ng Courier',
    deliveredBuyerTitle: '24-Oras na Inspection Window',
    deliveredBuyerDesc: 'Suriin nang mabuti ang iyong package. Kapag maayos ang item, i-release ang bayad kay seller. Kung may problema, mag-dispute bago matapos ang oras.',
    deliveredSellerTitle: 'Sinusuri ni Buyer ang Item',
    deliveredSellerDesc: 'Na-deliver na ang package. May 24 oras si buyer para mag-inspect. Awtomatikong mare-release sa iyo ang bayad kapag nag-confirm o natapos ang countdown.',

    // Pricing & Lean Canvas
    freePlan: 'Freemium',
    premiumPlan: 'Premium',
    perMonth: '/ buwan',
    dailyLimit: 'Arawang Limit',
    txFee: 'Bayad sa Escrow',
    freeTx: 'Libreng Deals',
    firstThree: 'Unang 3 deal bawat buwan ay LIBRE',
    upgrade: 'Mag-upgrade sa Pro',
    currentPlan: 'Kasalukuyang Plano',
    pricingHeadline: 'Patas at Malinaw na Presyo ng Escrow',
    pricingSubtitle: '1.5% fee bawat deal (bumababa hanggang 0.5% sa deals na ₱15k+). Unang 3 deal libre buwan-buwan.',

    // Dossier & Legal
    viewEvidence: 'Tingnan ang Certified Legal Dossier',
    downloadPdf: 'I-print / I-save ang Legal PDF',
    back: 'Bumalik',
    buyerView: 'Pananaw ng Buyer 🛒',
    sellerView: 'Pananaw ng Seller 🏪',
    prototypeBanner: '⚠️ Prototype — Simulated Escrow at eKYC (AFASA RA 12010)',
    verified: 'eKYC Na-verify',
    unverified: 'Hindi Na-verify',
    language: 'Wika',
  }
};

export default translations;
