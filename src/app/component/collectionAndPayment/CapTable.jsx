'use client';
import React from 'react';

const CapTable = ({ capList, onEdit, onFile, onDelete }) => {
    return (
        <table className="cap-table">
            <thead>
            <tr>
                <th>No</th>
                <th>일자</th>
                <th>유형</th>
                <th>거래처</th>
                <th>금액</th>
                <th>전표</th>
                <th>비고</th>
                <th>관리</th>
            </tr>
            </thead>
            <tbody>
            {Array.isArray(capList) && capList.length > 0 ? (
                capList.map((item, index) => (
                    <tr key={item.cap_idx}>
                        <td>{index + 1}</td>
                        <td>{item.date}</td>
                        <td style={{ color: item.type === '수금' ? 'blue' : 'red' }}>{item.type}</td>
                        <td>{item.customName}</td>
                        <td>{item.amount.toLocaleString()}원</td>
                        <td>{item.entryTitle || '-'}</td>
                        <td>{item.memo || '-'}</td>
                        <td>
                            <button onClick={() => onEdit(item.cap_idx)}>✏</button>
                            <button onClick={() => onFile(item.cap_idx)}>📎</button>
                            <button onClick={() => onDelete(item.cap_idx)}>🗑</button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="8">데이터가 없습니다.</td>
                </tr>
            )}
            </tbody>
        </table>
    );
};

export default CapTable;
