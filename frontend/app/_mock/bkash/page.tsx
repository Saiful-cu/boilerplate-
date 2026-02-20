'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function MockBkashPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentID = searchParams.get('paymentID') || 'MOCK-PAY';
  const amount = searchParams.get('amount') || '0.00';

  useEffect(() => {
    // No-op — wait for user action to "complete" payment
  }, []);

  const complete = (status: 'success' | 'failed' | 'cancelled') => {
    const trx = `MOCK-TRX-${Date.now()}`;
    const redirect = `/checkout/bkash-result?status=${status}&paymentID=${encodeURIComponent(paymentID)}&trxID=${encodeURIComponent(trx)}&amount=${encodeURIComponent(amount)}`;
    // emulate redirect back to frontend callback
    router.push(redirect);
  };

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 520, bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>bKash Sandbox — Mock Gateway</Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>Payment ID: {paymentID} · Amount: ৳{amount}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={() => complete('success')}>Complete (success)</Button>
          <Button variant="outlined" color="error" onClick={() => complete('failed')}>Fail payment</Button>
          <Button variant="text" onClick={() => complete('cancelled')}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  );
}
