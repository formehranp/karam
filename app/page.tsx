'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  // مدیریت وضعیت اسلایدر هیرو سکشن
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, title: "تجربه‌ای اصیل از ورزش پادشاهان", subtitle: "آموزش حرفه‌ای چوگان در قلب اصفهان" },
    { id: 2, title: "تجهیزات تخصصی و استاندارد", subtitle: "فروشگاه جامع لوازم سوارکاری و چوگان" },
    { id: 3, title: "محیطی خانوادگی و آرامش‌بخش", subtitle: "پانسیون اسب و خدمات رفاهی ویژه اعضا" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ۱. هدر (Header) - مینیمال و شفاف */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* لوگو */}
          <div className="text-2xl font-black text-teal-900 tracking-tighter">
            بسپار شیمی<span className="text-yellow-500"> سپیدان</span>
          </div>

          {/* فهرست */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="/" className="hover:text-teal-700 transition">خانه</Link>
            <Link href="/courses" className="hover:text-teal-700 transition">دوره‌های آموزشی</Link>
            <Link href="/shop" className="hover:text-teal-700 transition">فروشگاه</Link>
            <Link href="/about" className="hover:text-teal-700 transition">درباره ما</Link>
          </nav>

          {/* اکشن‌ها (سبد خرید + ورود) */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-teal-900 transition relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="absolute top-0 right-0 bg-yellow-500 text-xs text-teal-900 font-bold w-4 h-4 rounded-full flex items-center justify-center">۲</span>
            </button>
            <Link href="/login" className="hidden md:flex items-center gap-2 bg-teal-900 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg transition text-sm font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ورود | ثبت‌نام
            </Link>
          </div>
        </div>
      </header>

      {/* ۲. هیرو سکشن (Hero Slider) */}
      <section className="relative h-[80vh] w-full bg-slate-900 overflow-hidden">
        {/* پس‌زمینه گرادینت کله‌غازی به عنوان Placeholder عکس */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 opacity-90 z-0"></div>
        
        <div className="absolute inset-0 z-10 container mx-auto px-6 flex flex-col justify-center items-start">
          <div className="max-w-2xl transition-all duration-700 ease-in-out">
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold mb-6 border border-yellow-500/30">
              آکادمی تخصصی بسپار شیمی
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-teal-100 mb-10 opacity-90">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex gap-4">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-teal-950 font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-yellow-500/30">
                شروع یادگیری
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 font-bold px-8 py-4 rounded-xl transition">
                مشاهده دوره‌ها
              </button>
            </div>
          </div>
        </div>

        {/* نشانگرهای اسلایدر */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-10 bg-yellow-500' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      {/* ۳. آیکن باکس خدمات (Services) */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-teal-900 mb-4">خدمات آکادمی چوگان</h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* باکس ۱ */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-yellow-200 transition duration-300 group">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 mb-6 group-hover:bg-yellow-500 group-hover:text-teal-950 transition">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">دوره‌های آموزشی</h3>
            <p className="text-slate-500 leading-relaxed">آموزش گام به گام سوارکاری و چوگان از سطح مبتدی تا شرکت در مسابقات حرفه‌ای با مربیان مجرب.</p>
          </div>
          {/* باکس ۲ */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-yellow-200 transition duration-300 group">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 mb-6 group-hover:bg-yellow-500 group-hover:text-teal-950 transition">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">فروشگاه تجهیزات</h3>
            <p className="text-slate-500 leading-relaxed">تامین استانداردترین لوازم سوارکاری، چوب چوگان، کلاه ایمنی و پوشاک تخصصی ورزشکاران.</p>
          </div>
          {/* باکس ۳ */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-yellow-200 transition duration-300 group">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 mb-6 group-hover:bg-yellow-500 group-hover:text-teal-950 transition">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">پانسیون اسب</h3>
            <p className="text-slate-500 leading-relaxed">نگهداری تخصصی، تغذیه علمی و مراقبت‌های دامپزشکی شبانه‌روزی برای اسب‌های شما.</p>
          </div>
        </div>
      </section>

      {/* ۴. معرفی آکادمی (About Us) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-900 mb-6 leading-normal">
              احیای ورزش کهن ایرانی<br/>با استانداردهای جهانی
            </h2>
            <p className="text-slate-600 mb-6 leading-loose text-lg text-justify">
              باشگاه چوگان بسپار شیمی سپیدان با هدف احیای این ورزش اصیل و باستانی ایران زمین تاسیس شده است. ما با بهره‌گیری از زمین‌های استاندارد (مانژ)، مربیان تراز اول و اسب‌های آموزش‌دیده، بستری امن و حرفه‌ای برای علاقه‌مندان فراهم کرده‌ایم.
            </p>
            <ul className="space-y-4 mb-8">
              {['دارای مانژ استاندارد بین‌المللی', 'برگزاری مسابقات دوره‌ای کلاسی', 'محیطی کاملاً ایزوله و خانوادگی'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="text-teal-700 font-bold flex items-center gap-2 hover:text-teal-900 transition">
              بیشتر درباره ما بخوانید
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
          {/* محل قرارگیری عکس - در حال حاضر یک کادر مینیمال جایگزین است */}
          <div className="order-1 lg:order-2 relative h-[500px] rounded-3xl bg-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-teal-900/5 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               [ محل قرارگیری عکس محیط باشگاه ]
            </div>
            {/* المان تزئینی */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-500 rounded-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* ۵. فراخوان عمل (Call to Action) */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-teal-900 to-teal-800 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-teal-900/20">
            {/* پترن تزئینی ساده */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">آماده ورود به دنیای چوگان هستید؟</h2>
            <p className="text-teal-100 mb-10 max-w-2xl mx-auto relative z-10 text-lg">
              همین امروز ثبت‌نام کنید، اولین جلسه مشاوره رایگان را دریافت کنید و مسیر حرفه‌ای شدن را با ما آغاز کنید.
            </p>
            <button className="relative z-10 bg-yellow-500 hover:bg-yellow-400 text-teal-950 font-bold px-10 py-4 rounded-xl transition shadow-lg shadow-yellow-500/20 text-lg">
              ثبت‌نام در دوره جدید
            </button>
          </div>
        </div>
      </section>

      {/* ۶. فوتر (Footer) */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t-4 border-yellow-500 text-slate-400">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black text-white tracking-tighter mb-6">
                بسپار شیمی<span className="text-yellow-500"> سپیدان</span>
              </div>
              <p className="max-w-md leading-relaxed mb-6">
                نخستین و مجهزترین آکادمی تخصصی چوگان در مرکز کشور. ارائه دهنده خدمات نوین آموزش، پانسیون و فروش تجهیزات تخصصی.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">دسترسی سریع</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="hover:text-yellow-500 transition">لیست دوره‌ها</Link></li>
                <li><Link href="/" className="hover:text-yellow-500 transition">قوانین و مقررات باشگاه</Link></li>
                <li><Link href="/" className="hover:text-yellow-500 transition">راهنمای خرید تجهیزات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">ارتباط با ما</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">تلفن:</span> ۰۳۱۱۲۳۴۵۶۷۸
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">ایمیل:</span> info@bcspolo.ir
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">آدرس:</span> اصفهان، مجموعه ورزشی...
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
            <p>تمامی حقوق برای آکادمی چوگان بسپار شیمی سپیدان محفوظ است. © ۱۴۰۳</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               {/* آیکن شبکه‌های اجتماعی - Placeholder */}
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-yellow-500 hover:text-teal-900 flex items-center justify-center transition cursor-pointer">In</div>
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-yellow-500 hover:text-teal-900 flex items-center justify-center transition cursor-pointer">Tg</div>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}