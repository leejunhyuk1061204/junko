'use client'
import {useDatePickerStore} from "@/app/zustand/store";
import ReactDatePicker from "react-datepicker";
import {LeftArrow} from "next/dist/client/components/react-dev-overlay/ui/icons/left-arrow";
import {RightArrow} from "next/dist/client/components/react-dev-overlay/ui/icons/right-arrow";
import {format, getMonth, getYear} from 'date-fns';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

const YEARS = Array.from({ length: getYear(new Date()) + 1 - 2000 }, (_, i) => getYear(new Date()) - i);
const MONTHS = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
];

const DatePickerModal = () => {

    const {
        isOpen,
        selectedDate,
        selectedDates,
        setSelectedDate,
        setSelectedDates,
        closeDatePicker,
        onConfirm,
        targetIndex,
        mode,
        modeSelect
    } = useDatePickerStore();

    if (!isOpen) return null;

    const isRangeMode = mode === 'range';

    const handleConfirm = () => {
        if (onConfirm) {
            if(isRangeMode) {
                onConfirm(targetIndex, selectedDates);
            }else{
                onConfirm(targetIndex, selectedDate);
            }
        }
        console.log(selectedDate);
        console.log(selectedDates);
        closeDatePicker();
    };

    return (
        <div className='date-modal-overlay'>
            <div className='date-modal-content'>

                {modeSelect &&(
                    <div className='flex gap_20 justify-content-center margin-0'>
                        <div className={mode==='single'?'font-bold':''} style={mode==='single'?{color:'black'}:{color:'gray'}}
                            onClick={() => useDatePickerStore.setState({ mode: 'single' })}
                        >날짜 선택</div>
                        <div className={mode==='range'?'font-bold':''} style={mode==='range'?{color:'black'}:{color:'gray'}}
                            onClick={() => useDatePickerStore.setState({ mode: 'range' })}
                        >기간 선택</div>
                    </div>
                )}

                <ReactDatePicker
                    dateFormat="yyyy.MM.dd"
                    formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
                    showYearDropdown
                    scrollableYearDropdown
                    shouldCloseOnSelect={!isRangeMode}
                    yearDropdownItemNumber={100}
                    selected={!isRangeMode ? selectedDate : null}
                    onChange={(dateOrDates) => {
                        if(isRangeMode) {
                            const [start, end] = dateOrDates;
                            setSelectedDates([start, end]);
                        }else {
                            setSelectedDate(dateOrDates);
                        }
                    }}
                    selectsRange={isRangeMode}
                    startDate={isRangeMode ? selectedDates[0] : null}
                    endDate={isRangeMode ? selectedDates[1] : null}
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
                {mode==='range'&& (
                    <div className='flex flex-direction-col justify-left gap_5'>
                        <span>{selectedDates[0] !==null ? `기간 : ${format(selectedDates[0],'yyyy-MM-dd')}`:''} {selectedDates[1] !==null ? `~ ${format(selectedDates[1],'yyyy-MM-dd')}` : ''}</span>
                    </div>
                )}

                <div className='calendar-footer'>
                    <button className='calendar-btn cancel' onClick={closeDatePicker}>취소</button>
                    <button className='calendar-btn confirm' onClick={handleConfirm}>확인</button>
                </div>
            </div>
        </div>
    );
};

export default DatePickerModal;