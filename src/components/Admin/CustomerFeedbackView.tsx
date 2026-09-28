import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Sparkles, 
  Heart, 
  Smile, 
  Utensils, 
  Music, 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  ThumbsUp,
  Award,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { CustomerReview, CSATSummaryMetrics, UserAccount } from '../../types';
import { 
  getStoredCustomerReviews, 
  respondToCustomerReview, 
  calculateCSATMetrics 
} from '../../services/storage';

interface CustomerFeedbackViewProps {
  currentUser?: UserAccount | null;
}

export const CustomerFeedbackView: React.FC<CustomerFeedbackViewProps> = ({
  currentUser
}) => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => getStoredCustomerReviews());
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'below_3' | 'needs_reply'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Responding state
  const [activeReplyingReviewId, setActiveReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [selectedVoucherGift, setSelectedVoucherGift] = useState<string>('NONE');

  const metrics: CSATSummaryMetrics = useMemo(() => {
    return calculateCSATMetrics(reviews);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Rating filter
      if (ratingFilter === '5' && rev.overallRating !== 5) return false;
      if (ratingFilter === '4' && rev.overallRating !== 4) return false;
      if (ratingFilter === 'below_3' && rev.overallRating > 3) return false;
      if (ratingFilter === 'needs_reply' && rev.staffResponse) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rev.customerName.toLowerCase().includes(q);
        const matchTable = rev.tableName.toLowerCase().includes(q);
        const matchCode = rev.bookingCode.toLowerCase().includes(q);
        const matchComment = rev.comment.toLowerCase().includes(q);
        const matchDish = rev.favoriteDishName?.toLowerCase().includes(q);
        return matchName || matchTable || matchCode || matchComment || matchDish;
      }
      return true;
    });
  }, [reviews, ratingFilter, searchQuery]);

  const handleSendResponse = (reviewId: string) => {
    if (!replyText.trim()) return;

    const staffName = currentUser?.name || 'Ban Quản Lý Le Gourmet Bistro';
    const voucher = selectedVoucherGift !== 'NONE' ? selectedVoucherGift : undefined;

    const updated = respondToCustomerReview(reviewId, replyText.trim(), staffName, voucher);
    setReviews(updated);
    setActiveReplyingReviewId(null);
    setReplyText('');
    setSelectedVoucherGift('NONE');
  };

  const renderStars = (count: number, max = 5) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < count 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-stone-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-6 rounded-3xl shadow-md border border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Phân Hệ Quản Trị Trải Nghiệm & Độ Hài Lòng Khách Hàng</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-amber-100">
            Chỉ Số CSAT & Đánh Giá Dịch Vụ 5 Sao
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Theo dõi thời gian thực cảm nhận của thực khách, mức độ hài lòng về hương vị món ăn, tốc độ phục vụ và chỉ số giới thiệu NPS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReviews(getStoredCustomerReviews())}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Overall CSAT */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>ĐIỂM CSAT TRUNG BÌNH</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{metrics.averageOverall}</span>
            <span className="text-xs font-bold text-amber-700">/ 5.0 ⭐</span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-emerald-600" />
            <span>Từ {metrics.totalReviews} lượt đánh giá</span>
          </div>
        </div>

        {/* NPS Net Promoter Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>CHỈ SỐ NPS (0-10)</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${metrics.npsScore >= 70 ? 'text-emerald-700' : 'text-blue-700'}`}>
              +{metrics.npsScore}
            </span>
            <span className="text-xs font-bold text-stone-600">Đẳng cấp 5★</span>
          </div>
          <div className="text-[11px] text-stone-500">
            {metrics.promoterCount} ủng hộ • {metrics.detractorCount} cần lưu ý
          </div>
        </div>

        {/* Food Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>ẨM THỰC & HƯƠNG VỊ</span>
            <Utensils className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{metrics.averageFood}</span>
            <span className="text-xs font-bold text-rose-700">/ 5.0 ⭐</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Độ tươi ngon & nêm nếm
          </div>
        </div>

        {/* Service Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>THÁI ĐỘ PHỤC VỤ</span>
            <Smile className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{metrics.averageService}</span>
            <span className="text-xs font-bold text-indigo-700">/ 5.0 ⭐</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Cung cách sảnh & Sommelier
          </div>
        </div>

        {/* Ambiance Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>KHÔNG GIAN & ÂM NHẠC</span>
            <Music className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{metrics.averageAmbiance}</span>
            <span className="text-xs font-bold text-emerald-700">/ 5.0 ⭐</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Ánh sáng & không khí tiệc
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              ratingFilter === 'all'
                ? 'bg-stone-900 text-amber-300 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất Cả ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('5')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              ratingFilter === '5'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ⭐⭐⭐⭐⭐ 5 Sao ({reviews.filter(r => r.overallRating === 5).length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              ratingFilter === '4'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ⭐⭐⭐⭐ 4 Sao ({reviews.filter(r => r.overallRating === 4).length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('below_3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              ratingFilter === 'below_3'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Cần Lưu Ý (≤ 3★) ({reviews.filter(r => r.overallRating <= 3).length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter('needs_reply')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              ratingFilter === 'needs_reply'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Chưa Phản Hồi ({reviews.filter(r => !r.staffResponse).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, bàn, món ăn..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-500 text-sm">
            Không tìm thấy đánh giá nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isReplying = activeReplyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition p-5 space-y-4"
              >
                {/* Header: Customer Info, Table, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-300 font-bold flex items-center justify-center text-sm font-serif-heading">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900 text-sm">{rev.customerName}</strong>
                        {rev.customerPhone && (
                          <span className="text-xs text-stone-400 font-mono">({rev.customerPhone})</span>
                        )}
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {rev.tableName}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Mã đặt: <span className="text-amber-700 font-mono font-semibold">{rev.bookingCode}</span> • Ngày gửi: {new Date(rev.createdAt).toLocaleDateString('vi-VN')} {new Date(rev.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="text-right">
                      {renderStars(rev.overallRating)}
                      <span className="text-[10px] font-bold text-stone-500 mt-0.5 block">
                        NPS: <strong className="text-amber-700">{rev.npsScore}/10</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub ratings breakdown pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-stone-600 font-medium">Ẩm thực:</span>
                    <strong className="text-stone-800">{rev.foodRating}/5★</strong>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-stone-600 font-medium">Phục vụ:</span>
                    <strong className="text-stone-800">{rev.serviceRating}/5★</strong>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-stone-600 font-medium">Không gian:</span>
                    <strong className="text-stone-800">{rev.ambianceRating}/5★</strong>
                  </div>

                  {rev.favoriteDishName && (
                    <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-900 font-medium flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-amber-600" />
                      <span>Món tâm đắc: <strong>{rev.favoriteDishName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Comment Text */}
                <div className="text-sm text-stone-800 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                  "{rev.comment}"
                </div>

                {/* Staff Response (if exists) */}
                {rev.staffResponse && (
                  <div className="ml-4 pl-4 border-l-2 border-amber-400 bg-amber-50/40 p-3 rounded-r-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Phản hồi từ {rev.respondedBy || 'Nhà hàng'}</span>
                      </strong>
                      {rev.respondedAt && (
                        <span className="text-[10px] text-stone-600">
                          {new Date(rev.respondedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <p className="text-stone-700 leading-relaxed italic">
                      "{rev.staffResponse}"
                    </p>
                    {rev.compensationVoucherCode && (
                      <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[10px] mt-1">
                        <Gift className="w-3 h-3 text-amber-700" />
                        <span>Đã đính kèm E-Voucher: {rev.compensationVoucherCode}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action: Open Response Box */}
                {!rev.staffResponse && !isReplying && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyingReviewId(rev.id);
                        setReplyText(`Kính gửi ${rev.customerName}, Le Gourmet Bistro chân thành cảm ơn những đánh giá quý báu của bạn...`);
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Viết Phản Hồi Cho Khách</span>
                    </button>
                  </div>
                )}

                {/* Replying Form Box */}
                {isReplying && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-amber-600" />
                        <span>Phản Hồi Trực Tiếp Tới {rev.customerName}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveReplyingReviewId(null)}
                        className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      {/* Optional Voucher gift */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-[11px] font-bold text-stone-700 whitespace-nowrap">
                          Tặng E-Voucher:
                        </span>
                        <select
                          value={selectedVoucherGift}
                          onChange={(e) => setSelectedVoucherGift(e.target.value)}
                          className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-800 focus:outline-hidden"
                        >
                          <option value="NONE">Không tặng voucher</option>
                          <option value="VIPCARE150">VIPCARE150 (Giảm 150.000đ bồi hoàn)</option>
                          <option value="LEVIP10">LEVIP10 (Giảm 10% tri ân)</option>
                          <option value="DESSERTFREE">DESSERTFREE (Tặng bánh tráng miệng)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveReplyingReviewId(null)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs font-semibold cursor-pointer"
                        >
                          Đóng
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendResponse(rev.id)}
                          className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Lưu & Gửi Phản Hồi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
