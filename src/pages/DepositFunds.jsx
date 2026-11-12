import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import useStore from '../store/useStore';
import { Button } from '../components/UI';

export default function DepositFunds() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions } = useStore();
  const txn = transactions.find((t) => t.id === id);

  if (!txn) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary">Transaction not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <PaymentModal
      isOpen={true}
      onClose={() => navigate(`/transaction/${id}`)}
      txn={txn}
      onPaymentSuccess={() => navigate(`/transaction/${id}`)}
    />
  );
}
