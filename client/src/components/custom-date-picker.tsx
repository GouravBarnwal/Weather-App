import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker-fix.css';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  selected: Date | null | undefined;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  isClearable?: boolean;
  className?: string;
  required?: boolean;
}

export function CustomDatePicker({
  selected,
  onChange,
  placeholderText = 'Select date',
  minDate,
  maxDate,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
  isClearable = false,
  className = '',
  required = false,
}: CustomDatePickerProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <DatePicker
        selected={selected || null}
        onChange={onChange}
        placeholderText={placeholderText}
        minDate={minDate || undefined}
        maxDate={maxDate || undefined}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        isClearable={isClearable}
        className={cn(
          'flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800 px-4 py-2 text-base',
          'text-gray-900 dark:text-white placeholder-gray-400',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800',
          'focus:ring-opacity-50 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'pr-10' // Add padding for the calendar icon
        )}
        popperClassName="react-datepicker-popper z-[9999]"
        wrapperClassName="w-full"
        calendarClassName="!border-2 !border-gray-200 dark:!border-gray-700 rounded-lg shadow-xl overflow-hidden"
        dayClassName={(date) => 
          cn(
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors duration-200 rounded-md',
            'flex items-center justify-center',
            'text-sm font-medium'
          )
        }
        weekDayClassName={() => 'text-gray-700 dark:text-gray-300 font-medium text-xs uppercase tracking-wider'}
        onCalendarOpen={() => {}}
        onCalendarClose={() => {}}
        required={required}
        showPopperArrow={false}
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />
    </div>
  );
}
