'use client'
import {useDatePickerStore} from "@/app/zustand/store";
import ReactDatePicker from "react-datepicker";
import {LeftArrow} from "next/dist/client/components/react-dev-overlay/ui/icons/left-arrow";
import {RightArrow} from "next/dist/client/components/react-dev-overlay/ui/icons/right-arrow";
import { getMonth, getYear } from 'date-fns';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

const YEARS = Array.from({ length: getYear(new Date()) + 1 - 2000 }, (_, i) => getYear(new Date()) - i);
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DatePickerModal = () => {
    const {
        isOpen,
        selectedDate,
        setSelectedDate,
        closeDatePicker,
        onConfirm,
        targetIndex,
    } = useDatePickerStore();

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm(targetIndex, selectedDate);
        closeDatePicker();
    };

    return (
        <div className='date-modal-overlay'>
            <div className='date-modal-content'>
                <ReactDatePicker
                    dateFormat="yyyy.MM.dd"
                    formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
                    showYearDropdown
                    scrollableYearDropdown
                    shouldCloseOnSelect
                    yearDropdownItemNumber={100}
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    calendarClassName='calendar-wrapper'
                    className='date-picker-input'
                    renderCustomHeader={({
                                             date,
                                             changeYear,
                                             decreaseMonth,
                                             increaseMonth,
                                             prevMonthButtonDisabled,
                                             nextMonthButtonDisabled,
                                         }) => (
                        <div className='calendar-header flex justify-content-between'>
                            <div className='calendar-header-left flex flex-1 justify-content-center'>
                                <Listbox value={getYear(date)} onChange={(year) => changeYear(year)}>
                                    <div className="date-listBox-container">
                                        <ListboxButton className="calendar-year-select date-listBox-btn" onClick={(e) => e.stopPropagation()}>
                                            {getYear(date)}
                                        </ListboxButton>
                                        <ListboxOptions className="date-listBox-option">
                                            {YEARS.map((year) => (
                                                <ListboxOption
                                                    key={year}
                                                    value={year}
                                                    className="date-listBox-option-item"
                                                >
                                                    {year}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>
                            </div>
                            <div className='calendar-header-center flex flex-1 justify-content-center'>
                                <span className='calendar-month'>{MONTHS[getMonth(date)]}</span>
                            </div>
                            <div className='calendar-header-right flex flex-1 justify-content-center'>
                                <button
                                    type="button"
                                    onClick={decreaseMonth}
                                    className='calendar-nav-button'
                                    disabled={prevMonthButtonDisabled}
                                >
                                    <LeftArrow fill="#ffffff" />
                                </button>
                                <button
                                    type="button"
                                    onClick={increaseMonth}
                                    className='calendar-nav-button'
                                    disabled={nextMonthButtonDisabled}
                                >
                                    <RightArrow fill="#ffffff" />
                                </button>
                            </div>
                        </div>
                    )}
                    inline
                />

                <div className='calendar-footer'>
                    <button className='calendar-btn cancel' onClick={closeDatePicker}>취소</button>
                    <button className='calendar-btn confirm' onClick={handleConfirm}>확인</button>
                </div>
            </div>
        </div>
    );
};

export default DatePickerModal;