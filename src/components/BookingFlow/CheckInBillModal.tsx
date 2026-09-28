import React from 'react';
import { X } from 'lucide-react';
import { Reservation } from '../../types';
import { CheckInBill } from './CheckInBill';

interface CheckInBillModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onOpenEmailPreview?: (reservation: Reservation) => void;
}

export const CheckInBillModal: React.FC<CheckInBillModalProps> = ({
  reservation,
  onClose,
  onOpenEmailPreview,
}) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:py-8 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl my-auto print:max-w-none print:w-full">
        {/* Close button - hidden during print */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-4 -right-2 sm:-top-4 sm:-right-4 z-50 p-2.5 rounded-full bg-stone-900 text-stone-300 hover:text-white border border-stone-700 shadow-xl transition print:hidden cursor-pointer"
          title="Đóng phiếu check-in"
        >
          <X className="w-5 h-5" />
        </button>

        <CheckInBill
          reservation={reservation}
          onOpenEmailPreview={onOpenEmailPreview}
          onClose={onClose}
          showNewBookingBtn={false}
        />
      </div>
    </div>
  );
};
