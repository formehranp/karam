import { Task } from '../types';
import { toPersianDigits, jalaliToGregorian } from './jalali';

/**
 * Computes the Persian weekday name from a Jalali ISO date (YYYY-MM-DD).
 */
export function getJalaliWeekdayName(isoDate: string): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length < 3) return '-';
    const jy = parseInt(parts[0], 10);
    const jm = parseInt(parts[1], 10);
    const jd = parseInt(parts[2], 10);
    const g = jalaliToGregorian(jy, jm, jd);
    const dayIndex = new Date(g.year, g.month - 1, g.day).getDay();
    // 0: یکشنبه, 1: دوشنبه, 2: سه‌شنبه, 3: چهارشنبه, 4: پنج‌شنبه, 5: جمعه, 6: شنبه
    const map = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return map[dayIndex] || '-';
  } catch {
    return '-';
  }
}

/**
 * Exports tasks to completely Persian & Right-to-Left (RTL) Microsoft Excel (.xls) file.
 * Includes <x:DisplayRightToLeft/> so Excel opens in native RTL mode with Column A on the right.
 */
export function exportTasksToXLS(tasks: Task[], filename: string) {
  const escapeHtml = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const rowsHtml = tasks
    .map((t, idx) => {
      const rowNumFa = toPersianDigits(idx + 1);
      const prioFa =
        t.priority === 'high' ? 'فوری' : t.priority === 'medium' ? 'متوسط' : 'عادی';
      const catMap: Record<string, string> = {
        work: 'کاری',
        personal: 'شخصی',
        learning: 'یادگیری',
        shopping: 'خرید',
        other: 'سایر',
      };
      const catFa = catMap[t.category] || 'سایر';
      const statusFa = t.completed ? 'انجام‌شده' : 'در انتظار';
      const statusClass = t.completed ? 'completed' : 'pending';
      const prioClass = t.priority === 'high' ? 'high-prio' : '';

      // Persian Due Date (with / instead of -)
      const dueDateFa = toPersianDigits(t.dueDate.replace(/-/g, '/'));
      const weekdayFa = getJalaliWeekdayName(t.dueDate);
      const reminderFa = t.reminderTime ? toPersianDigits(t.reminderTime) : '-';

      const createdObj = new Date(t.createdAt);
      const createdFa = toPersianDigits(createdObj.toLocaleDateString('fa-IR'));

      return `      <tr>
        <td class="center font-bold">${escapeHtml(rowNumFa)}</td>
        <td class="title-cell">${escapeHtml(t.title)}</td>
        <td>${escapeHtml(t.description || '-')}</td>
        <td class="center font-mono">${escapeHtml(dueDateFa)}</td>
        <td class="center">${escapeHtml(weekdayFa)}</td>
        <td class="center font-mono">${escapeHtml(reminderFa)}</td>
        <td class="center ${prioClass}">${escapeHtml(prioFa)}</td>
        <td class="center">${escapeHtml(catFa)}</td>
        <td class="center ${statusClass}">${escapeHtml(statusFa)}</td>
        <td class="center font-mono">${escapeHtml(createdFa)}</td>
      </tr>`;
    })
    .join('\n');

  const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="application/vnd.ms-excel; charset=UTF-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>لیست کارها</x:Name>
          <x:WorksheetOptions>
            <x:DisplayRightToLeft/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body, table, th, td {
      font-family: 'Vazirmatn', 'Tahoma', 'Segoe UI', Arial, sans-serif;
      direction: rtl;
      text-align: right;
    }
    table {
      border-collapse: collapse;
      direction: rtl;
      width: 100%;
    }
    th {
      background-color: #1a73e8;
      color: #ffffff;
      font-weight: bold;
      font-size: 11pt;
      padding: 10px 14px;
      border: 1px solid #0d47a1;
      text-align: center;
      mso-number-format: "\\@";
    }
    td {
      padding: 8px 12px;
      border: 1px solid #dcdcdc;
      text-align: right;
      font-size: 10pt;
      mso-number-format: "\\@";
    }
    .center {
      text-align: center;
    }
    .font-bold {
      font-weight: bold;
    }
    .font-mono {
      mso-number-format: "\\@";
    }
    .title-cell {
      font-weight: bold;
      color: #1f2937;
    }
    .completed {
      color: #0f825a;
      background-color: #e6f4ea;
      font-weight: bold;
      text-align: center;
    }
    .pending {
      color: #b26c00;
      background-color: #fef7e0;
      text-align: center;
    }
    .high-prio {
      color: #d93025;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body dir="rtl">
  <table dir="rtl" border="1">
    <thead>
      <tr>
        <th style="width: 50px;">ردیف</th>
        <th style="width: 200px;">عنوان تسک</th>
        <th style="width: 250px;">توضیحات</th>
        <th style="width: 110px;">تاریخ سررسید</th>
        <th style="width: 90px;">روز هفته</th>
        <th style="width: 90px;">ساعت یادآوری</th>
        <th style="width: 80px;">اولویت</th>
        <th style="width: 90px;">دسته‌بندی</th>
        <th style="width: 100px;">وضعیت</th>
        <th style="width: 110px;">تاریخ ثبت</th>
      </tr>
    </thead>
    <tbody>
${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports tasks to CSV with UTF-8 BOM for 100% native Excel compatibility in Persian.
 */
export function exportTasksToCSV(tasks: Task[], filename: string) {
  const headers = [
    'ردیف',
    'عنوان تسک',
    'توضیحات',
    'تاریخ سررسید',
    'روز هفته',
    'ساعت یادآوری',
    'اولویت',
    'دسته‌بندی',
    'وضعیت',
    'تاریخ ثبت',
  ];

  const escapeCSV = (field: string | number | undefined | null) => {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tasks.map((t, idx) => {
    const rowNumFa = toPersianDigits(idx + 1);
    const prioFa = t.priority === 'high' ? 'فوری' : t.priority === 'medium' ? 'متوسط' : 'عادی';
    const catMap: Record<string, string> = {
      work: 'کاری',
      personal: 'شخصی',
      learning: 'یادگیری',
      shopping: 'خرید',
      other: 'سایر',
    };
    const catFa = catMap[t.category] || 'سایر';
    const statusFa = t.completed ? 'انجام‌شده' : 'در انتظار';
    const dueDateFa = toPersianDigits(t.dueDate.replace(/-/g, '/'));
    const weekdayFa = getJalaliWeekdayName(t.dueDate);
    const reminderFa = t.reminderTime ? toPersianDigits(t.reminderTime) : '-';
    const createdFa = toPersianDigits(new Date(t.createdAt).toLocaleDateString('fa-IR'));

    return [
      escapeCSV(rowNumFa),
      escapeCSV(t.title),
      escapeCSV(t.description || '-'),
      escapeCSV(dueDateFa),
      escapeCSV(weekdayFa),
      escapeCSV(reminderFa),
      escapeCSV(prioFa),
      escapeCSV(catFa),
      escapeCSV(statusFa),
      escapeCSV(createdFa),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
