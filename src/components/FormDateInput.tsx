import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

export function parseTypedDate(inputStr: string): Date | undefined {
  if (!inputStr) return undefined;
  const cleaned = inputStr.trim();
  const digits = cleaned.replace(/\D/g, '');
  
  // Format DDMMYYYY (8 digits)
  if (digits.length === 8) {
    const day = parseInt(digits.substring(0, 2), 10);
    const month = parseInt(digits.substring(2, 4), 10);
    const year = parseInt(digits.substring(4, 8), 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2026) {
      const d = new Date(year, month - 1, day);
      if (d.getDate() === day && d.getMonth() === month - 1) return d;
    }
  }

  // Format YYYYMMDD (8 digits starting with 19 or 20)
  if (digits.length === 8 && (digits.startsWith('19') || digits.startsWith('20'))) {
    const year = parseInt(digits.substring(0, 4), 10);
    const month = parseInt(digits.substring(4, 6), 10);
    const day = parseInt(digits.substring(6, 8), 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2026) {
      const d = new Date(year, month - 1, day);
      if (d.getDate() === day && d.getMonth() === month - 1) return d;
    }
  }

  // Standard string parsing (e.g. 30/06/2003 or 2003-06-30 or 30-06-2003)
  if (cleaned.includes('/') || cleaned.includes('-')) {
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length === 3) {
      let day = 0, month = 0, year = 0;
      if (parts[0].length === 4) { // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else { // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2026) {
        const d = new Date(year, month - 1, day);
        if (d.getDate() === day && d.getMonth() === month - 1) return d;
      }
    }
  }

  return undefined;
}

export function formatTypedDateInput(raw: string): string {
  if (!raw) return '';

  // Extract only digits up to 8 (DDMMYYYY)
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';

  // Preserve explicit trailing slash when user explicitly types it after 2 or 4 digits
  if (raw.endsWith('/') && digits.length === 2) {
    return `${digits}/`;
  }
  if (raw.endsWith('/') && digits.length === 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/`;
  }

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

interface DateInputFieldProps {
  date: Date | undefined;
  onDateChange: (d: Date | undefined, formattedDobStr: string) => void;
  calendarMonth: Date;
  onMonthChange: (m: Date) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export function DateInputField({
  date,
  onDateChange,
  calendarMonth,
  onMonthChange,
  error,
  placeholder = "DD/MM/YYYY",
  className
}: DateInputFieldProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (date) {
        setInputValue(format(date, "dd/MM/yyyy"));
      } else {
        setInputValue("");
      }
    }
  }, [date, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatTypedDateInput(rawVal);
    setInputValue(formatted);

    const parsed = parseTypedDate(formatted);
    if (parsed) {
      onDateChange(parsed, format(parsed, "yyyy-MM-dd"));
      onMonthChange(parsed);
    } else if (formatted === "") {
      onDateChange(undefined, "");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"));
    } else if (inputValue) {
      const parsed = parseTypedDate(inputValue);
      if (parsed) {
        onDateChange(parsed, format(parsed, "yyyy-MM-dd"));
        onMonthChange(parsed);
        setInputValue(format(parsed, "dd/MM/yyyy"));
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <div className="relative group">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={handleInputChange}
          className={cn(
            "h-14 px-4 pr-12 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60",
            error && "border-destructive",
            className
          )}
        />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-primary/70 hover:text-primary transition-colors focus:outline-none"
            title="Open Calendar"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="end">
          <div className="bg-white border border-border/60 rounded-xl shadow-xl overflow-hidden flex flex-col p-3 gap-3">
            <div className="flex items-center border border-border/60 rounded-md bg-white">
              <Select
                value={calendarMonth.getMonth().toString()}
                onValueChange={(v) => {
                  const newDate = new Date(calendarMonth);
                  newDate.setMonth(parseInt(v));
                  onMonthChange(newDate);
                }}
              >
                <SelectTrigger className="h-10 flex-1 border-none bg-transparent shadow-none focus:ring-0 text-foreground font-medium px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border/60 max-h-[250px]">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date(2000, i, 1);
                    return <SelectItem key={i} value={i.toString()}>{format(d, 'MMMM')}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <div className="w-px h-6 bg-border/50"></div>
              <Select
                value={calendarMonth.getFullYear().toString()}
                onValueChange={(v) => {
                  const newDate = new Date(calendarMonth);
                  newDate.setFullYear(parseInt(v));
                  onMonthChange(newDate);
                }}
              >
                <SelectTrigger className="h-10 flex-1 border-none bg-transparent shadow-none focus:ring-0 text-foreground font-medium px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border/60 max-h-[250px]">
                  {Array.from({ length: 130 }).map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="border border-border/60 rounded-md bg-white pb-1">
              <Calendar
                mode="single"
                month={calendarMonth}
                onMonthChange={onMonthChange}
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    onDateChange(d, format(d, "yyyy-MM-dd"));
                    onMonthChange(d);
                    setInputValue(format(d, "dd/MM/yyyy"));
                  }
                }}
                initialFocus
                disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                className="border-none shadow-none bg-transparent p-2"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      </div>
      {error && <span className="text-xs text-destructive font-medium ml-1 mt-1 block">{error}</span>}
    </div>
  );
}

interface TimeInputFieldProps {
  time: { hour: string; minute: string };
  onTimeChange: (newTime: { hour: string; minute: string }) => void;
  placeholder?: string;
  className?: string;
}

export function TimeInputField({
  time,
  onTimeChange,
  placeholder = "HH:MM (e.g. 12:00)",
  className
}: TimeInputFieldProps) {
  const [inputValue, setInputValue] = useState<string>(`${time.hour}:${time.minute}`);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(`${time.hour}:${time.minute}`);
    }
  }, [time.hour, time.minute, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '');
    let formatted = rawVal.replace(/[^\d:]/g, '');

    if (!rawVal.includes(':') && digitsOnly.length > 2) {
      formatted = `${digitsOnly.substring(0, 2)}:${digitsOnly.substring(2, 4)}`;
    }
    setInputValue(formatted);

    if (formatted.includes(':')) {
      const [h, m] = formatted.split(':');
      const hNum = parseInt(h, 10);
      const mNum = parseInt(m, 10);
      if (!isNaN(hNum) && hNum >= 0 && hNum <= 23 && !isNaN(mNum) && mNum >= 0 && mNum <= 59) {
        onTimeChange({
          hour: String(hNum).padStart(2, '0'),
          minute: String(mNum).padStart(2, '0')
        });
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(`${time.hour}:${time.minute}`);
  };

  return (
    <div className="relative group">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onChange={handleInputChange}
        className={cn(
          "h-14 px-4 pr-12 rounded-xl border border-border/60 bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base sm:text-lg hover:border-primary/60 placeholder:text-muted-foreground/60",
          className
        )}
      />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-primary/70 hover:text-primary transition-colors focus:outline-none"
            title="Select Time"
          >
            <Clock className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-6 rounded-2xl border border-border/60 bg-white shadow-xl" align="end">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-bold text-primary text-center uppercase tracking-wider">Hour</Label>
              <Select value={time.hour} onValueChange={(v) => onTimeChange({ ...time, hour: v })}>
                <SelectTrigger className="w-[90px] h-12 text-lg px-3 bg-white border-b-2 border-0 border-border/60 text-foreground rounded-none shadow-none focus:ring-0 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="h-[200px] bg-white border-border/60">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const val = i.toString().padStart(2, '0');
                    return <SelectItem key={val} value={val}>{val}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-bold text-primary text-center uppercase tracking-wider">Minute</Label>
              <Select value={time.minute} onValueChange={(v) => onTimeChange({ ...time, minute: v })}>
                <SelectTrigger className="w-[90px] h-12 text-lg px-3 bg-white border-b-2 border-0 border-border/60 text-foreground rounded-none shadow-none focus:ring-0 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="h-[200px] bg-white border-border/60">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const val = i.toString().padStart(2, '0');
                    return <SelectItem key={val} value={val}>{val}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
