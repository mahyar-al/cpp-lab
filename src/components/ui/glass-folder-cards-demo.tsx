import React from 'react';
import { GlassFolder } from './glass-folder-cards';

export function GlassFolderCardsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 p-8 min-h-[400px] bg-slate-900/40 rounded-2xl">
      <GlassFolder
        label="آرشیو هفته سوم آبان"
        meta="۴ گزارش تحلیلی"
        tone="dark"
        art="aurora"
        files={[
          { name: "خلاصه مطالعه و تست‌ها", meta: "۲۴ ساعت" },
          { name: "تکالیف تحویل‌شده", meta: "۱۰۰٪ کامل" },
          { name: "بزرگترین دستاورد", meta: "ثبت رکورد" },
          { name: "اولویت‌های هفته بعد", meta: "آزمون جامع" },
        ]}
      />
      <GlassFolder
        label="آرشیو هفته دوم آبان"
        meta="۴ گزارش تحلیلی"
        tone="dark"
        art="verdant"
        files={[
          { name: "خلاصه مرور لایتنر", meta: "۱۸ ساعت" },
          { name: "تکالیف فیزیک و گسسته", meta: "۹۰٪ کامل" },
          { name: "تمرین‌های المپیاد", meta: "حل ۶ مسئله" },
        ]}
      />
    </div>
  );
}

export default GlassFolderCardsDemo;
