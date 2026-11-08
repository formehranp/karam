import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css"; // فرض بر این است که فایل استایل‌های شما اینجاست

export const metadata: Metadata = {
  title: "بسپار شیمی سپیدان | آکادمی چوگان",
  description: "نخستین و مجهزترین آکادمی تخصصی چوگان در مرکز کشور",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
        
        {/* ۱. هدر (Header) */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            {/* لوگو */}
            <Link href="/" className="text-2xl font-black text-teal-900 tracking-tighter flex items-center gap-2">
              {/* کامپوننت تصویر که مسیر لوگو را می‌خواند */}
              <Image 
                src="/images/logo.png" 
                alt="لوگوی باشگاه بسپار شیمی سپیدان" 
                width={48} 
                height={48} 
                className="object-contain"
              />
              <span>بسپار شیمی<span className="text-yellow-500"> سپیدان</span></span>
            </Link>

            {/* فهرست */}
            <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
              <Link href="/" className="hover:text-teal-700 transition">خانه</Link>
              <Link href="/courses" className="hover:text-teal-700 transition">دوره‌های آموزشی</Link>
              <Link href="/shop" className="hover:text-teal-700 transition">فروشگاه</Link>
              <Link href="/about" className="hover:text-teal-700 transition">درباره ما</Link>
            </nav>

            {/* اکشن‌ها */}
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

        {/* محتوای متغیر هر صفحه در اینجا رندر می‌شود */}
        <main className="flex-grow">
          {children}
        </main>

        {/* ۶. فوتر (Footer) */}
        <footer className="bg-slate-900 pt-20 pb-10 border-t-4 border-yellow-500 text-slate-400">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="text-2xl font-black text-white tracking-tighter mb-6 flex items-center gap-2">
                  <Image src="/images/logo.png" alt="لوگو" width={40} height={40} className="object-contain opacity-80 grayscale hover:grayscale-0 transition" />
                  <span>بسپار شیمی<span className="text-yellow-500"> سپیدان</span></span>
                </div>
                <p className="max-w-md leading-relaxed mb-6">
                  نخستین و مجهزترین آکادمی تخصصی چوگان در مرکز کشور. ارائه دهنده خدمات نوین آموزش، پانسیون و فروش تجهیزات تخصصی.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6 text-lg">دسترسی سریع</h4>
                <ul className="space-y-3">
                  <li><Link href="/courses" className="hover:text-yellow-500 transition">لیست دوره‌ها</Link></li>
                  <li><Link href="/rules" className="hover:text-yellow-500 transition">قوانین و مقررات باشگاه</Link></li>
                  <li><Link href="/shop" className="hover:text-yellow-500 transition">راهنمای خرید تجهیزات</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6 text-lg">ارتباط با ما</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><span className="text-yellow-500">تلفن:</span> ۰۳۱۱۲۳۴۵۶۷۸</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500">ایمیل:</span> info@bcspolo.ir</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500">آدرس:</span> اصفهان، مجموعه ورزشی...</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
              <p>تمامی حقوق برای آکادمی چوگان بسپار شیمی سپیدان محفوظ است. © ۱۴۰۳</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}