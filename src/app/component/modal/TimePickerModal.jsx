import {useTimePickerStore} from "@/app/zustand/store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../globals.css";

export default function TimePickerModal() {
    const {
        isOpen,
        selectedTime,
        setSelectedTime,
        onConfirm,
        closeTimePicker,
    } = useTimePickerStore();

    if (!isOpen) return null;

    return (
        <div className="time-modal-overlay" onClick={closeTimePicker}>
            <div className="time-modal" onClick={(e) => e.stopPropagation()}>
                <h4>시간 선택</h4>
                <DatePicker
                    selected={selectedTime}
                    onChange={(date) => setSelectedTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={10}
                    timeCaption="시간"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    minTime={new Date(0, 0, 0, 1, 0)}
                    maxTime={new Date(0, 0, 0, 23, 50)}
                    onKeyDown={(e) => e.preventDefault()}
                />
                <button
                    onClick={() => {
                        if (onConfirm) onConfirm(selectedTime);
                        closeTimePicker();
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    );

}