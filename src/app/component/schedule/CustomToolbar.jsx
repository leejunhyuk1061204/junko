const CustomToolbar =(props) => {
    const {label, onNavigate, localizer} = props;

    return (
        <div>
            <div className="schedule-toolbar-wrapper">
                <div className="schedule-custom-toolbar">
                    <button type="button" onClick={() => onNavigate('PREV')}>&lt;</button>
                    <span className="rbc-toolbar-label">{label}</span>
                    <button type="button" onClick={() => onNavigate('NEXT')}>&gt;</button>
                </div>

            </div>

            <div className="schedule-label-opt-wrapper">
                <div className="schedule-label-opt">
                    <p style={{backgroundColor: '#90A4AE'}}>개인 일정</p>
                    <p style={{backgroundColor: '#D6BFA7'}}>근무 상태</p>
                    <p style={{backgroundColor: '#AED9B4'}}>회사 일정</p>
                    <p style={{backgroundColor: '#D78888'}}>중요</p>
                </div>
                <div className="schedule-today-btn">
                    <button type="button" onClick={() => onNavigate('TODAY')}>{localizer.messages.today}</button>
                </div>
            </div>
        </div>
    );
}

export default CustomToolbar;