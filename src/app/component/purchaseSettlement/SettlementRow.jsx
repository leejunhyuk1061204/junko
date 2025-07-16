'use client';
import '../../globals.css';

export default function SettlementRow({ item, index, onClick }) {
    const { settlement_idx, status, settlement_day, custom_name } = item;

    const statusClass = {
        '미정산': 'status-red',
        '정산': 'status-green',
        '부분정산': 'status-yellow'
    };

    console.log("👀 렌더링할 항목:", item);

    return (
        <tr className="settlement-row" onClick={() => onClick(settlement_idx)}>
            <td>{index}</td>
            <td>{`정산 #${settlement_idx}`}</td>
            <td>
                <span className={`status-label ${statusClass[status] || ''}`}>
                    {status}
                </span>
            </td>
            <td>-</td>
            <td>{settlement_day}</td>
            <td>{custom_name}</td>
            <td>{settlement_day}</td>
        </tr>
    );
}

