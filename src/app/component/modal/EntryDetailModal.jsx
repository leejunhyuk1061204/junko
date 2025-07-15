'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import EntryEditModal from "@/app/component/modal/EntryEditModal";

const EntryDetailModal = ({ open, onClose, entry }) => {
    const [files, setFiles] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [loginUserId, setLoginUserId] = useState(null)
    const [editOpen, setEditOpen] = useState(false)

    useEffect(() => {
        const userId = sessionStorage.getItem('user_id') // 또는 쿠키에서 가져오기
        setLoginUserId(userId)
    }, [])

    const handlePreview = (file) => {
        setSelectedFile(file)
    }
    useEffect(() => {
        if (!open || !entry) return
        axios.get(`http://localhost:8080/entryFileList/${entry.entry_idx}/upload`)
            .then(res => setFiles(res.data.files || []))
            .catch(err => console.error("첨부파일 로딩 실패", err))
    }, [entry, open])

    if (!open || !entry) return null;

    return (
        <div className="modal_overlay" style={modalOverlayStyle}>
            <div className="modal_content" style={modalContentStyle}>
                <button style={closeBtnStyle} onClick={onClose}>×</button>
                <h3 style={titleStyle}>전표 상세</h3>

                <div className="entryDetail-item"><strong>전표번호:</strong>
                    <span>{`JV${entry.entry_date?.replaceAll('-', '')}${String(entry.entry_idx).padStart(3, '0')}`}</span>
                </div>
                <div className="entryDetail-item"><strong>유형:</strong> <span>{entry.entry_type}</span></div>
                <div className="entryDetail-item"><strong>거래처명:</strong> <span>{entry.custom_name || '-'}</span></div>
                <div className="entryDetail-item"><strong>고객명:</strong> <span>{entry.customer_name || '-'}</span></div>
                <div className="entryDetail-item"><strong>금액:</strong> <span>{entry.amount?.toLocaleString()} 원</span></div>
                <div className="entryDetail-item"><strong>일자:</strong> <span>{entry.entry_date}</span></div>
                <div className="entryDetail-item"><strong>상태:</strong> <span>{entry.status}</span></div>
                <div className="entryDetail-item"><strong>작성자:</strong> <span>{entry.user_name}</span></div>
                <div className="entryDetail-item"><strong>승인자:</strong> <span>{entry.approver_name || '-'}</span></div>

                <div className="entryDetail-item">
                    <strong>첨부파일:</strong>
                    <ul>
                        {files.length > 0 ? files.map(file => (
                            <li key={file.file_idx}>
                                📎 {file.ori_filename}
                                <button
                                    className="entryList-fabBtn blue"
                                    onClick={() => handlePreview(file)}
                                    style={{ marginLeft: '10px' }}
                                >
                                    미리보기
                                </button>
                                <button
                                    className="entryList-fabBtn gray"
                                    onClick={() =>
                                        window.open(`http://localhost:8080/entryFileDown/${file.file_idx}`, '_blank')
                                    }
                                    style={{ marginLeft: '5px' }}
                                >
                                    다운로드
                                </button>
                            </li>
                        )) : '없음'}
                    </ul>
                </div>
                {selectedFile && (
                    <div style={{ marginTop: '20px' }}>
                        <strong>미리보기:</strong>
                        {selectedFile.type === 'pdf' ? (
                            <iframe
                                src={`http://localhost:8080/entryFileDown/${selectedFile.file_idx}?preview=true`}
                                width="100%"
                                height="500px"
                                style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                            />
                        ) : (
                            <img
                                src={`http://localhost:8080/entryFileDown/${selectedFile.file_idx}?preview=true`}
                                alt="첨부 이미지"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '500px',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px'
                                }}
                                onError={() => alert('이미지 로딩 실패!')}
                            />
                        )}
                    </div>
                )}
                {loginUserId === entry.user_id && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                            onClick={() => setEditOpen(true)}
                            className="entryList-fabBtn blue"
                        >
                            ✏️ 수정하기
                        </button>
                    </div>
                )}

                <EntryEditModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    entry={entry}
                    onSuccess={() => {
                        onClose(); // 상세 닫고
                        window.location.reload(); // 리스트 갱신
                    }}
                />
            </div>
        </div>
    )
}

export default EntryDetailModal

// 스타일 정의
const modalOverlayStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const modalContentStyle = {
    background: '#fff',
    borderRadius: '10px',
    padding: '30px 30px',
    width: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
}

const closeBtnStyle = {
    position: 'absolute',
    right: 20,
    top: 20,
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer'
}

const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center'
}
