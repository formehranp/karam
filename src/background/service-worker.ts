import { Task } from '../types';
import {
  gregorianToJalali,
  jalaliToGregorian,
  formatJalaliDateISO,
  parseJalaliDateString,
  toPersianDigits,
} from '../utils/jalali';

const ALARM_MIDNIGHT_CHECK = 'check-daily-tasks';
const REMINDER_PREFIX = 'task-reminder-';

/**
 * Returns current Jalali date string (YYYY-MM-DD) in Tehran timezone.
 */
function getTodayTehranJalaliISO(): string {
  const tehranNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' })
  );
  const jalali = gregorianToJalali(
    tehranNow.getFullYear(),
    tehranNow.getMonth() + 1,
    tehranNow.getDate()
  );
  return formatJalaliDateISO(jalali);
}

/**
 * Updates extension action badge with count of today's pending tasks.
 */
async function updateExtensionBadge(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['tasks']);
    const tasks: Task[] = (result.tasks as Task[]) || [];
    const todayISO = getTodayTehranJalaliISO();

    const pendingToday = tasks.filter(
      (task) => task.dueDate === todayISO && !task.completed
    );

    const count = pendingToday.length;
    const badgeText = count > 0 ? toPersianDigits(count.toString()) : '';

    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' }); // M3 Google Blue
  } catch (error) {
    console.warn('Failed to update extension badge:', error);
  }
}

/**
 * Schedules alarms for tasks with reminder times.
 */
async function scheduleTaskAlarms(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['tasks']);
    const tasks: Task[] = (result.tasks as Task[]) || [];
    const nowEpoch = Date.now();

    // Clear old task reminder alarms first
    const existingAlarms = await chrome.alarms.getAll();
    for (const alarm of existingAlarms) {
      if (alarm.name.startsWith(REMINDER_PREFIX)) {
        await chrome.alarms.clear(alarm.name);
      }
    }

    for (const task of tasks) {
      if (task.completed || !task.reminderTime || !task.dueDate) continue;

      const jalaliDate = parseJalaliDateString(task.dueDate);
      const greg = jalaliToGregorian(
        jalaliDate.year,
        jalaliDate.month,
        jalaliDate.day
      );

      const [hoursStr, minutesStr] = task.reminderTime.split(':');
      const hours = hoursStr.padStart(2, '0');
      const minutes = (minutesStr || '00').padStart(2, '0');

      // Iran is permanently UTC+03:30
      const gyStr = greg.year.toString();
      const gmStr = greg.month.toString().padStart(2, '0');
      const gdStr = greg.day.toString().padStart(2, '0');
      const isoDateTimeIran = `${gyStr}-${gmStr}-${gdStr}T${hours}:${minutes}:00+03:30`;

      const targetEpoch = Date.parse(isoDateTimeIran);

      if (!isNaN(targetEpoch) && targetEpoch > nowEpoch) {
        chrome.alarms.create(`${REMINDER_PREFIX}${task.id}`, {
          when: targetEpoch,
        });
      }
    }
  } catch (error) {
    console.warn('Failed to schedule alarms:', error);
  }
}

// Listen to storage changes to update badge and alarms
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.tasks) {
    updateExtensionBadge();
    scheduleTaskAlarms();
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_MIDNIGHT_CHECK) {
    updateExtensionBadge();
    scheduleTaskAlarms();
    return;
  }

  if (alarm.name.startsWith(REMINDER_PREFIX)) {
    const taskId = alarm.name.replace(REMINDER_PREFIX, '');
    try {
      const result = await chrome.storage.local.get(['tasks']);
      const tasks: Task[] = (result.tasks as Task[]) || [];
      const task = tasks.find((t) => t.id === taskId);

      if (task && !task.completed) {
        chrome.notifications.create(`notify-${task.id}-${Date.now()}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
          title: 'یادآور کار روزانه (کارام)',
          message: task.title + (task.description ? `\n${task.description}` : ''),
          priority: 2,
          requireInteraction: true,
        });
      }
    } catch (e) {
      console.warn('Error handling reminder alarm:', e);
    }
  }
});

// Initialization on extension load or install
chrome.runtime.onInstalled.addListener(() => {
  updateExtensionBadge();
  scheduleTaskAlarms();

  // Create recurring alarm every 30 minutes to ensure date rollover badge is accurate
  chrome.alarms.create(ALARM_MIDNIGHT_CHECK, {
    periodInMinutes: 30,
  });
});

chrome.runtime.onStartup.addListener(() => {
  updateExtensionBadge();
  scheduleTaskAlarms();
});
