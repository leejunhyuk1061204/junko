'use client';

export default function SettlementFilter({ filter, onChange, onSearch }) {
    return (
        <div className="settlement-filter">
            <select name="status" value={filter.status} onChange={onChange}>
                <option value="">전체 상태</option>
                <option value="미정산">미정산</option>
                <option value="정산">정산 완료</option>
                <option value="부분정산">부분 정산</option>
            </select>

            <input
                type="text"
                name="customName"
                placeholder="거래처명"
                value={filter.customName}
                onChange={onChange}
            />

            <input type="date" name="startDate" value={filter.startDate} onChange={onChange} />
            <input type="date" name="endDate" value={filter.endDate} onChange={onChange} />

            <button onClick={onSearch}>검색</button>
        </div>
    );
}
