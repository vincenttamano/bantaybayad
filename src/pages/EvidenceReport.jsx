import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download, Printer, ArrowLeft, ShieldCheck,
  CheckCircle, AlertTriangle, FileText, MapPin, ZoomIn
} from 'lucide-react';
import { Button, LoadingSpinner } from '../components/UI';
import useStore from '../store/useStore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Reusable Official Dispute Document formatted identically to the Philippine Bank (BDO) Dispute Form
function OfficialDisputeDocument({ txn, caseId, txnDate, postDate, currentDate, totalAmount, formatCurrency, isPrintOnly = false }) {
  return (
    <div
      className={`bg-white text-slate-950 font-sans leading-tight select-text ${isPrintOnly
        ? 'w-[794px] p-6 text-[10px]'
        : 'w-full min-w-[700px] sm:min-w-0 p-3 sm:p-5 text-[9.5px] sm:text-[10px]'
        }`}
    >
      {/* 1. Header of BantayBayad (matches authentic bank dispute form header layout) */}
      <div className="flex items-center justify-between border-b-2 border-[#002d72] pb-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002d72] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002d72] font-serif">
                BantayBayad
              </span>
              <span className="text-[8px] sm:text-[9px] bg-slate-100 text-[#002d72] font-bold px-1.5 py-0.5 rounded border border-[#002d72]/30 uppercase font-mono">
                Western Visayas Hub · Iloilo
              </span>
            </div>
            <p className="text-[8px] text-slate-500 font-medium">
              BantayBayad Escrow Trust Corporation · Mandurriao, Iloilo City
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-[#002d72] leading-none">
            AFASA Escrow Dispute Form
          </h1>
          <span className="text-[8px] font-mono text-slate-600 block mt-0.5 font-bold">
            RA 12010 COMPLIANT OFFICIAL E-DISPUTE RECORD
          </span>
        </div>
      </div>

      {/* Form Instructions Box */}
      <div className="text-[8.5px] text-slate-700 leading-snug mb-2 px-1 border-b border-slate-200 pb-1.5">
        <p className="font-bold text-slate-900">In order for us to investigate your dispute:</p>
        <ol className="list-decimal pl-4 space-y-0.5">
          <li>The CARDHOLDER/COMPLAINANT INFORMATION AND TRANSACTION DISPUTE DETAILS should be complete and legibly filled-out.</li>
          <li>Please CHECK ONE category which BEST describes your dispute and enclose all SUPPORTING DOCUMENTS.</li>
          <li>Please complete one form for each disputed transaction if dispute type is different in nature.</li>
        </ol>
      </div>

      {/* Section 1: Cardholder / Complainant Information */}
      <div className="mb-2">
        <div className="bg-[#002d72] text-white text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wide mb-0.5">
          Cardholder / Complainant Information
        </div>

        <div className="border border-slate-400">
          {/* Name row */}
          <div className="p-1 border-b border-slate-300">
            <span className="text-[7.5px] text-slate-500 block uppercase font-semibold">
              Cardholder Name (Last, First, Middle Name)
            </span>
            <span className="font-bold text-[10.5px] font-serif uppercase tracking-wide text-slate-950">
              {txn.role === 'buyer' ? 'Dela Cruz, Juan Santos' : 'Santos, Maria Clara'}
            </span>
          </div>

          {/* Card / Account row */}
          <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
            <div className="p-1">
              <span className="text-[7.5px] text-slate-500 block uppercase font-semibold">
                PhilSys National ID / Card Number
              </span>
              <span className="font-mono font-bold text-[9.5px] text-slate-950">
                4895 0404 1585 0912
              </span>
            </div>
            <div className="p-1">
              <span className="text-[7.5px] text-slate-500 block uppercase font-semibold">
                Escrow Reference / Case Number
              </span>
              <span className="font-mono font-bold text-[9.5px] text-slate-950">
                010360150152 (Case: {caseId})
              </span>
            </div>
          </div>

          {/* Iloilo Branch / Home Address */}
          <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
            <div className="p-1">
              <span className="text-[7.5px] text-slate-500 block uppercase font-semibold">
                Branch of Account / Registered Hub
              </span>
              <span className="font-semibold text-slate-900 leading-tight block text-[8.5px]">
                BantayBayad Western Visayas Hub, Iloilo Business Park, Mandurriao, Iloilo City
              </span>
            </div>
            <div className="p-1">
              <span className="text-[7.5px] text-slate-500 block uppercase font-semibold">
                Home / Registered Address
              </span>
              <span className="font-medium text-slate-900 leading-tight block text-[8.5px]">
                Zone 3, Brgy. San Rafael, Mandurriao, Iloilo City 5000 / Western Visayas
              </span>
            </div>
          </div>

          {/* Iloilo Contact Info */}
          <div className="grid grid-cols-3 divide-x divide-slate-300 text-[8.5px]">
            <div className="p-1">
              <span className="text-[7px] text-slate-500 block uppercase font-semibold">Landline</span>
              <span className="font-mono font-semibold">(033) 330-8821</span>
            </div>
            <div className="p-1">
              <span className="text-[7px] text-slate-500 block uppercase font-semibold">Mobile Number</span>
              <span className="font-mono font-bold">0927 130 0080</span>
            </div>
            <div className="p-1">
              <span className="text-[7px] text-slate-500 block uppercase font-semibold">Email Address</span>
              <span className="font-mono truncate block">juan.delacruz@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Transaction Dispute Details Table */}
      <div className="mb-2">
        <div className="bg-[#002d72] text-white text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wide mb-0.5">
          Transaction Dispute Details
        </div>

        <div className="w-full border border-slate-400">
          <table className="w-full border-collapse text-[8.5px]">
            <thead>
              <tr className="bg-slate-100 text-center font-bold text-slate-800 border-b border-slate-400">
                <th className="border-r border-slate-400 p-1 w-20">Txn Date</th>
                <th className="border-r border-slate-400 p-1 w-20">Posting Date</th>
                <th className="border-r border-slate-400 p-1 w-24">Type</th>
                <th className="border-r border-slate-400 p-1 w-24">Total Amount (PHP)</th>
                <th className="p-1 text-left">Remarks / Merchandising Details</th>
              </tr>
            </thead>
            <tbody className="text-center font-medium divide-y divide-slate-300">
              <tr>
                <td className="border-r border-slate-400 p-1 font-mono font-bold">{txnDate}</td>
                <td className="border-r border-slate-400 p-1 font-mono font-bold">{postDate}</td>
                <td className="border-r border-slate-400 p-1 font-bold uppercase">{txn.paymentMethod || 'P2P ESCROW'}</td>
                <td className="border-r border-slate-400 p-1 font-mono font-black text-slate-950">
                  ₱{formatCurrency(totalAmount)}
                </td>
                <td className="p-1 text-left font-sans">
                  <strong>{txn.itemName}</strong> ({txn.condition}) — Counterparty: @{txn.counterparty}
                </td>
              </tr>
              <tr className="text-slate-500 bg-slate-50/50">
                <td className="border-r border-slate-400 p-0.5">&nbsp;</td>
                <td className="border-r border-slate-400 p-0.5">&nbsp;</td>
                <td className="border-r border-slate-400 p-0.5">&nbsp;</td>
                <td className="border-r border-slate-400 p-0.5">&nbsp;</td>
                <td className="p-0.5 text-left text-[7.5px] italic text-slate-600">
                  Courier: Lalamove Western Visayas (Iloilo Business Park Hub, Mandurriao to Jaro, Waybill #{txn.trackingId || 'LLM-ILO-78432'})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7px] text-slate-500 italic mt-0.5 text-right">
          NOTE: ALL ADDITIONAL INFORMATION MAY BE ATTACHED AS CRYPTOGRAPHIC TELEMETRY
        </div>
      </div>

      {/* Section 3: Type of Dispute (Checkboxes grid) */}
      <div className="mb-2">
        <div className="bg-[#002d72] text-white text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wide mb-0.5">
          Type of Dispute (Check Applicable Box)
        </div>

        <div className="border border-slate-400 p-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px] text-slate-800">
          {/* Left Column: Unauthorized Transactions */}
          <div>
            <span className="font-bold underline block mb-0.5 text-slate-900">Unauthorized Transactions</span>
            <div className="space-y-0.5">
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={txn.disputeReason === 'Unauthorized transaction'} />
                <span>Unauthorized Escrow Withdrawal</span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={false} />
                <span>Unauthorized Fund Transfer</span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={false} />
                <span>Unauthorized Online Biometric Bypass</span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={false} />
                <span>Account Takeover Scheme (RA 12010 AFASA)</span>
              </label>
            </div>
          </div>

          {/* Right Column: Other Transactions & Marketplace Issues */}
          <div>
            <span className="font-bold underline block mb-0.5 text-slate-900">Marketplace & Escrow Disputes</span>
            <div className="space-y-0.5">
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={txn.status === 'DISPUTED' && (!txn.disputeReason || txn.disputeReason.includes('defective') || txn.disputeReason.includes('described'))} />
                <span className="font-bold text-slate-950">
                  Purchase via POS/ internet but defective / not as described
                </span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={txn.disputeReason === 'Item not received'} />
                <span>Non-delivery / Item not received from merchant</span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={txn.disputeReason === 'Counterfeit or fake item'} />
                <span>Counterfeit or fake merchandise delivered</span>
              </label>
              <label className="flex items-start gap-1">
                <input type="checkbox" className="mt-0.5" readOnly checked={false} />
                <span>Single transaction but charged more than once</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Terms and Conditions with Signature */}
      <div className="mb-2 border-b border-slate-300 pb-1.5">
        <div className="text-[8.5px] font-bold text-slate-900 uppercase mb-0.5">Terms and Conditions</div>
        <p className="text-[7.5px] text-slate-600 leading-snug">
          All disputed transactions are subject to investigation. Pursuant to Republic Act No. 12010 (AFASA), false reporting or fraudulent chargebacks are subject to criminal penalties. For disputed transactions beyond 60 days from transaction date, please attach a formal explanatory letter.
        </p>
        <div className="mt-1 flex items-end justify-between">
          <div className="border-t border-slate-900 w-48 text-center pt-0.5">
            <span className="font-serif italic font-bold text-[9.5px] block text-slate-900">
              Jimson Alfafete / Juan Dela Cruz
            </span>
            <span className="text-[7px] uppercase font-bold text-slate-600 block">
              Cardholder's Signature over Printed Name / Date: {currentDate}
            </span>
          </div>
          <div className="text-right text-[7.5px] font-mono text-slate-500">
            Verified eKYC Biometric Signature Match
          </div>
        </div>
      </div>

      {/* Section 5: Deed of Release and Quitclaim */}
      <div className="mb-2 bg-slate-50 border border-slate-300 p-1.5 text-[7px] text-slate-700 leading-tight font-serif">
        <div className="font-sans font-bold uppercase text-[7.5px] text-slate-900 mb-0.5">
          Deed of Release and Quitclaim (applicable if dispute / unauthorized transaction resolved)
        </div>
        <p className="mb-0.5">
          In the event that BantayBayad / Escrow Partner, upon merit of its investigation and findings and its commitment to its depositors in general and solely as a sign of goodwill / liberality, is willing to credit the indicated account for the disputed amount, the Undersigned hereby agrees to receive and accept from BantayBayad the total amount credited as and by way of full and final settlement of the disputed transaction and any other claims arising from the above-stated incidents.
        </p>
        <div className="mt-1 flex items-end justify-between font-sans">
          <div className="border-t border-slate-900 w-48 text-center pt-0.5">
            <span className="font-serif italic font-bold text-[9px] block text-slate-900">
              Jimson Alfafete / Juan Dela Cruz
            </span>
            <span className="text-[6.5px] uppercase font-bold text-slate-600 block">
              Cardholder's Signature over Printed Name / Date: {currentDate}
            </span>
          </div>
          <div className="text-[6.5px] text-slate-500 font-mono">
            Authenticated under BSP Circular No. 1195
          </div>
        </div>
      </div>

      {/* Section 6: Official Iloilo Notarization Block */}
      <div className="border border-slate-400 p-1.5 text-[7.5px] text-slate-800 leading-tight">
        <div className="bg-[#002d72] text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide mb-0.5">
          Notarization
        </div>
        <p className="font-bold text-slate-950 mb-0.5">REPUBLIC OF THE PHILIPPINES ) S.S. CITY AND PROVINCE OF ILOILO</p>
        <p className="mb-0.5">
          BEFORE ME, a Notary Public, for and in the City and Province of Iloilo, on this day of <span className="underline font-bold">November 2026</span> at <span className="underline font-bold">Iloilo City</span>, personally appeared the affiant exhibiting Competent Evidence of Identity (PhilSys Card #****-****-6794), and who represented to me that the foregoing Deed of Release and Dispute Affidavit was voluntarily affixed by him for the purposes stated therein.
        </p>
        <div className="mt-1 flex justify-between items-end text-[6.5px] font-mono">
          <div className="space-y-0.5">
            <div>Doc. No. <strong className="underline">412</strong>; Page No. <strong className="underline">83</strong>;</div>
            <div>Book No. <strong className="underline">XIV</strong>; Series of <strong className="underline">2026</strong>.</div>
          </div>
          <div className="text-center border-t border-slate-900 w-48 pt-0.5 font-sans">
            <strong className="block text-[8px] text-slate-950">ATTY. FRITZ MARICK FERNANDEZ</strong>
            <span className="text-[6.5px] text-slate-600 block">NOTARY PUBLIC FOR ILOILO CITY & PROVINCE OF ILOILO</span>
            <span className="text-[6px] text-slate-500 block">PTR No. ILO-12366767 / IBP Iloilo Chapter Lifetime No. 01428</span>
          </div>
        </div>
      </div>

      {/* Footer Barcode / Verification Hash */}
      <div className="mt-1.5 pt-1 border-t border-slate-300 flex justify-between items-center text-[6.5px] text-slate-500 font-mono">
        <div>
          FORM ID: BB-DISPUTE-ILOILO-REV2026 · SECURITY HASH: SHA256:{caseId}-99B14F
        </div>
        <div>
          AUTHORIZED BY BANTAYBAYAD WESTERN VISAYAS COMPLIANCE
        </div>
      </div>
    </div>
  );
}

export default function EvidenceReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, addToast } = useStore();
  const txn = transactions.find((t) => t.id === id);

  const [isGenerating, setIsGenerating] = useState(false);

  if (!txn) {
    return (
      <div className="p-8 text-center bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-slate-600">Dispute evidence record not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const caseId = `BB-ILO-${txn.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  const currentDate = new Date().toLocaleDateString('en-PH', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
  const txnDate = txn.createdAt
    ? new Date(txn.createdAt).toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '10/26/2026';
  const postDate = txn.updatedAt
    ? new Date(txn.updatedAt).toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '10/26/2026';

  const formatCurrency = (n) => Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  const totalAmount = txn.price + (txn.fee || 0);

  // Directly generates and downloads a guaranteed 1-PAGE A4 PDF covering the whole page
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    addToast('Generating 1-Page Official Iloilo PDF...', 'info');

    try {
      // Target the unconstrained offscreen print canvas element (exact 794px A4 standard width)
      const element = document.getElementById('print-official-doc');
      if (!element) {
        throw new Error('Print canvas element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const printEl = clonedDoc.getElementById('print-official-doc');
          if (printEl) {
            printEl.style.display = 'block';
            printEl.style.visibility = 'visible';
            printEl.style.position = 'static';
            printEl.style.left = '0';
            printEl.style.top = '0';
            printEl.style.width = '794px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Margin 5mm each side: renderWidth = 200mm, fills the whole page
      const margin = 5;
      const renderWidth = pageWidth - margin * 2;
      const renderHeight = Math.min((canvas.height * renderWidth) / canvas.width, pageHeight - margin * 2);

      pdf.addImage(imgData, 'JPEG', margin, margin, renderWidth, renderHeight);
      pdf.save(`BantayBayad_Dispute_Form_${caseId}.pdf`);
      addToast('Official 1-Page PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF Generation error:', err);
      addToast(`PDF error: ${err.message || 'Could not generate PDF'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-slate-100 text-slate-900 pb-12 print:bg-white print:p-0 print:pb-0">
      {/* Top Action Sub-bar: 100% Responsive, perfectly fits 320px+ mobile screens without clipping */}
      <div className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 flex items-center justify-between shadow-xs">
        <button
          onClick={() => navigate(`/transaction/${id}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Back to Deal</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold border-slate-300 !py-1 px-2.5 h-8 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="text-xs font-bold shadow-xs !py-1 px-3 h-8 bg-[#002d72] hover:bg-[#002052] text-white flex items-center gap-1"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Dispute Document on Screen: Full width, scrollable horizontally if needed, with authentic Bank format */}
      <div className="w-full p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-x-auto w-full">
          <OfficialDisputeDocument
            txn={txn}
            caseId={caseId}
            txnDate={txnDate}
            postDate={postDate}
            currentDate={currentDate}
            totalAmount={totalAmount}
            formatCurrency={formatCurrency}
            isPrintOnly={false}
          />
        </div>
      </div>

      {/* Portal attached to document.body: Renders the unconstrained 794px print/PDF document */}
      {ReactDOM.createPortal(
        <div id="print-official-doc" className="offscreen-print-canvas">
          <OfficialDisputeDocument
            txn={txn}
            caseId={caseId}
            txnDate={txnDate}
            postDate={postDate}
            currentDate={currentDate}
            totalAmount={totalAmount}
            formatCurrency={formatCurrency}
            isPrintOnly={true}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
