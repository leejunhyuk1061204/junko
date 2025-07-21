export default function EntryTable({ entries, selectedList, setSelectedList, onClickEntry }) {
    const toggleSelect = (entry_idx) => {
        setSelectedList(selectedList.includes(entry_idx)
            ? selectedList.filter(id => id !== entry_idx)
            : [...selectedList, entry_idx])
    }

    const isAllChecked = entries.length > 0 && selectedList.length === entries.length;

    const handleAllCheck = (e) => {
        if (e.target.checked) {
            const allIds = entries.map(entry => entry.entry_idx);
            setSelectedList(allIds);
        } else {
            setSelectedList([]);
        }
    };

    return (
        <table className="entryList-table">
            <thead>
            <tr>
                <th>
                    NO.<input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleAllCheck}/>
                </th>
                <th>전표 번호</th>
                <th>전표 유형</th>
                <th>거래처명</th>
                <th>고객명</th>
                <th>금액</th>
                <th>일자</th>
                <th>작성자</th>
                <th>상태</th>
                <th>첨부</th>
                <th>승인</th>
            </tr>
            </thead>
            <tbody>
            {entries.length > 0 ? (
                <>
                    {entries.map((entry, index) => (
                <tr key={entry.entry_idx} className={selectedList.includes(entry.entry_idx) ? 'selected' : ''}>
                    <td>
                        {index + 1}
                        <input type="checkbox" checked={selectedList.includes(entry.entry_idx)}
                               onChange={() => toggleSelect(entry.entry_idx)} />
                    </td>
                    <td className="entryList-entryNo link" onClick={() => onClickEntry(entry.entry_idx)}>
                        {`JV${entry.entry_date?.replaceAll('-', '')}${String(entry.entry_idx).padStart(3, '0')}`}
                    </td>
                    <td>{entry.entry_type}</td>
                    <td>{entry.custom_name || '-'}</td>
                    <td>{entry.customer_name || '-'}</td>
                    <td>{entry.amount?.toLocaleString()}원</td>
                    <td>{entry.entry_date}</td>
                    <td>{entry.user_name || '-'}</td>
                    <td className={`status ${entry.status}`}>{entry.status}</td>
                    <td>{entry.has_file === true || entry.has_file === 1 ? '○' : 'X'}</td>
                    <td>{entry.approved ? '○' : 'X'}</td>
                </tr>
            ))}
            {entries.length < 10 &&
                Array.from({ length: 10 - entries.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                        <td colSpan="11" style={{ height: '36px' }}>&nbsp;</td>
                    </tr>
                ))}
            </>
            ) : (
            <tr>
                <td colSpan="11">데이터가 없습니다.</td>
            </tr>
            )}
            </tbody>
        </table>
    )
}
