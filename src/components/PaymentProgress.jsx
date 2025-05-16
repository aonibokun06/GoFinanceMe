import React from 'react';

function PaymentProgress({ paidAmount, totalAmount }) {
  // Calculate percentage complete (0–100)
  const percent = Math.min((paidAmount / totalAmount) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Bar container */}
      <div
        style={{
          position: 'relative',
          flexGrow: 1,
          height: '12px',
          backgroundColor: '#e2e8f0',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: '#3182ce',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Label */}
      <span style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
        ${paidAmount.toLocaleString()} / ${totalAmount.toLocaleString()} ({Math.round(percent)}%)
      </span>
    </div>
  );
}

export default PaymentProgress;