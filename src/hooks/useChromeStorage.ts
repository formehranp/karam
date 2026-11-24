import { useState, useEffect, useCallback, useRef } from 'react';

const isChromeStorageAvailable = (): boolean => {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome.storage) &&
    Boolean(chrome.storage.local)
  );
};

export function useChromeStorage<T>(
  key: string,
  initialValue: T
): [T, (valOrUpdater: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(() => {
    if (!isChromeStorageAvailable()) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (
            typeof initialValue === 'object' &&
            initialValue !== null &&
            !Array.isArray(initialValue) &&
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            return { ...initialValue, ...parsed };
          }
          return parsed as T;
        }
        return initialValue;
      } catch (e) {
        console.warn(`Error reading localStorage key "${key}":`, e);
        return initialValue;
      }
    }
    return initialValue;
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(!isChromeStorageAvailable());
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  useEffect(() => {
    let isMounted = true;

    if (isChromeStorageAvailable()) {
      chrome.storage.local.get([key], (result) => {
        if (!isMounted) return;
        if (!chrome.runtime.lastError && result[key] !== undefined) {
          const val = result[key];
          if (
            typeof initialValue === 'object' &&
            initialValue !== null &&
            !Array.isArray(initialValue) &&
            typeof val === 'object' &&
            val !== null &&
            !Array.isArray(val)
          ) {
            setValue({ ...initialValue, ...val });
          } else {
            setValue(val);
          }
        }
        setIsLoaded(true);
      });

      // 2. React to external updates in chrome.storage
      const handleStorageChanged = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === 'local' && changes[key]) {
          const newVal = changes[key].newValue !== undefined ? changes[key].newValue : initialValue;
          setValue(newVal);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChanged);
      return () => {
        isMounted = false;
        chrome.storage.onChanged.removeListener(handleStorageChanged);
      };
    } else {
      // Fallback: React to localStorage events across browser tabs
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key && event.newValue !== null) {
          try {
            setValue(JSON.parse(event.newValue) as T);
          } catch (e) {
            console.error('Failed to parse storage event value', e);
          }
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => {
        isMounted = false;
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, [key]);

  // Setter function supporting direct value or functional updater
  const updateValue = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      setValue((currentVal) => {
        const resolvedValue =
          typeof valOrUpdater === 'function'
            ? (valOrUpdater as (prev: T) => T)(currentVal)
            : valOrUpdater;

        if (isChromeStorageAvailable()) {
          chrome.storage.local.set({ [key]: resolvedValue }, () => {
            if (chrome.runtime.lastError) {
              console.error(`chrome.storage.local.set error for ${key}:`, chrome.runtime.lastError);
            }
          });
        } else {
          try {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
          } catch (e) {
            console.error(`localStorage.setItem error for ${key}:`, e);
          }
        }

        return resolvedValue;
      });
    },
    [key]
  );

  return [value, updateValue, isLoaded];
}
