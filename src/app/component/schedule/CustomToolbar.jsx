const CustomToolbar =(props) => {
    const {label, onNavigate, localizer} = props;

    return (
        <div className="rbc-toolbar no-wrap" style={{position: 'relative'}}>
            <span className="rbc-btn-group">
                <button type="button" onClick={() => onNavigate('PREV')}>{localizer.messages.previous}</button>
                <button type="button" onClick={() => onNavigate('TODAY')}>{localizer.messages.today}</button>
                <button type="button" onClick={() => onNavigate('NEXT')}>{localizer.messages.next}</button>
            </span>
            <span className="rbc-toolbar-label flex-1">{label}</span>
            <div className="schedule-label-opt">
                <p style={{backgroundColor: '#90A4AE'}}>일정</p>
                <p style={{backgroundColor: '#A8B88A'}}>연차</p>
                <p style={{backgroundColor: '#D6BFA7'}}>반차</p>
                <p style={{backgroundColor: '#9FA8DA'}}>회의</p>
                <p style={{backgroundColor: '#E0B084'}}>외근</p>
                <p style={{backgroundColor: '#A1887F'}}>출장</p>
                <p style={{backgroundColor: '#AED9B4'}}>행사</p>
                <p style={{backgroundColor: '#D78888'}}>중요</p>
            </div>
        </div>
    );
}

export default CustomToolbar;