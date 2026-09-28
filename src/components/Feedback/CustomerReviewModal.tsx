import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Sparkles, 
  Send, 
  Heart, 
  CheckCircle2, 
  Award,
  Utensils,
  Smile,
  Music,
  Gift
} from 'lucide-react';
import { CustomerReview, MenuItem } from '../../types';
import { submitCustomerReview, getStoredMenuItems } from '../../services/storage';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode?: string;
  customerName?: string;
  customerPhone?: string;
  tableName?: string;
  tableId?: string;
  reservationId?: string;
  onReviewSubmitted?: (review: CustomerReview) => void;
}

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = ({
  isOpen,
  onClose,
  bookingCode = 'BK-9999',
  customerName = 'Quý Khách',
  customerPhone = '',
  tableName = 'Bàn Tiệc',
  tableId = 'T-01',
  reservationId = 'res-current',
  onReviewSubmitted,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [ambianceRating, setAmbianceRating] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number>(10);
  const [favoriteDishName, setFavoriteDishName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdReview, setCreatedReview] = useState<CustomerReview | null>(null);

  const menuItems = getStoredMenuItems();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng chia sẻ đôi lời cảm nhận về trải nghiệm dùng bữa của bạn!');
      return;
    }

    const review = submitCustomerReview({
      reservationId,
      bookingCode,
      customerName: customerName || 'Quý Thực Khách',
      customerPhone,
      tableId,
      tableName,
      overallRating,
      foodRating,
      serviceRating,
      ambianceRating,
      npsScore,
      favoriteDishName: favoriteDishName || undefined,
      comment: comment.trim(),
    });

    setCreatedReview(review);
    setIsSubmitted(true);
    if (onReviewSubmitted) {
      onReviewSubmitted(review);
    }
  };

  const renderStarPicker = (
    label: string, 
    value: number, 
    onChange: (val: number) => void,
    icon: any
  ) => {
    const IconComponent = icon;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 gap-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-stone-800">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition cursor-pointer"
              title={`${star} sao`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= value 
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                    : 'text-stone-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-amber-700 ml-1.5 w-6 text-center">
            {value}/5
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-6 pb-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white bg-stone-800/60 hover:bg-stone-800 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Khảo Sát Chất Lượng 5 Sao</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-amber-100">
            Cảm Nhận Trải Nghiệm Ẩm Thực
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Bàn: <strong className="text-amber-300">{tableName}</strong> • Mã phiếu: <strong className="text-amber-300">{bookingCode}</strong>
          </p>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900 font-serif-heading">
                Chân Thành Cảm Ơn Quý Khách!
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Đánh giá quý báu của <strong>{customerName}</strong> là động lực to lớn giúp đội ngũ đầu bếp và phục vụ của Le Gourmet Bistro không ngừng nâng cao chất lượng dịch vụ.
              </p>
            </div>

            {/* Gift Voucher Award */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-300 rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Quà Tri Ân Khách Hàng Thân Thiết</span>
              </div>
              <div className="text-2xl font-extrabold tracking-widest text-amber-900 font-mono my-1">
                LEVIP10
              </div>
              <p className="text-xs text-amber-700">
                Ưu đãi <strong>giảm ngay 10%</strong> cho lần đặt bàn tiếp theo tại Le Gourmet Bistro.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold shadow-lg transition cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Rating categories */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                1. Chấm điểm trải nghiệm (1 - 5 Sao)
              </span>

              {renderStarPicker('Mức độ hài lòng chung', overallRating, setOverallRating, Heart)}
              {renderStarPicker('Chất lượng món ăn & Độ tươi ngon', foodRating, setFoodRating, Utensils)}
              {renderStarPicker('Thái độ & Tốc độ phục vụ', serviceRating, setServiceRating, Smile)}
              {renderStarPicker('Không gian, ánh sáng & âm nhạc', ambianceRating, setAmbianceRating, Music)}
            </div>

            {/* NPS 0-10 Score */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-700">
                  2. Khả năng bạn sẽ giới thiệu nhà hàng cho bạn bè, đối tác?
                </span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {npsScore}/10 điểm
                </span>
              </div>
              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNpsScore(num)}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      npsScore === num
                        ? 'bg-amber-600 text-white shadow-sm scale-105'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-stone-600 px-1">
                <span>0 - Chắc chắn không</span>
                <span>10 - Rất nhiệt tình giới thiệu</span>
              </div>
            </div>

            {/* Favorite Dish selection */}
            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">
                3. Món ăn bạn tâm đắc nhất trong bữa tiệc? (Tùy chọn)
              </label>
              <select
                value={favoriteDishName}
                onChange={(e) => setFavoriteDishName(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Chọn món bạn ưng ý nhất --</option>
                {menuItems.map((dish) => (
                  <option key={dish.id} value={dish.name}>
                    {dish.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">
                4. Nhận xét & Góp ý chân thực của bạn <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về hương vị món ăn, cung cách phục vụ, hoặc điều cần nhà hàng cải thiện..."
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 px-4 rounded-xl border border-stone-300 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition cursor-pointer"
              >
                Để Sau
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Đánh Giá Ngay</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
