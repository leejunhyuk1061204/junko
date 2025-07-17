'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import EntryEditModal from "@/app/component/modal/EntryEditModal"
import DeptRegistModal from "@/app/component/modal/DeptRegistModal"
import DeptEditModal from "@/app/component/modal/DeptEditModal"

const EntryDetailModal = ({ open, onClose, entry }) => {
    const [files, setFiles] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [loginUserId, setLoginUserId] = useState(null)
    const [editOpen, setEditOpen] = useState(false)
    const [deptList, setDeptList] = useState([])
    const [selectedDept, setSelectedDept] = useState(null)
    const [editDeptOpen, setEditDeptOpen] = useState(false)
    const [deptPreviewUrl, setDeptPreviewUrl] = useState(null)
    const [showDeptRegist, setShowDeptRegist] = useState(false)

    // ✅ 로그인 유저 ID 가져오기 (loginId 또는 user_id)
    useEffect(() => {
        const userId = sessionStorage.getItem('user_id') || sessionStorage.getItem('loginId')
        setLoginUserId(userId)
    }, [open])

    // 파일/분개 목록 불러오기
    useEffect(() => {
        if (!open || !entry) return
        axios.get(`http://localhost:8080/entryFileList/${entry.entry_idx}/upload`)
            .then(res => setFiles(res.data.files || []))
        axios.get(`http://localhost:8080/accountDeptList/${entry.entry_idx}/detail`)
            .then(res => setDeptList(res.data.data || []))
    }, [entry, open])

    // 상태 업데이트
    const updateStatus = async (newStatus) => {
        try {
            const res = await axios.patch(`http://localhost:8080/accountStatusUpdate/${entry.entry_idx}/status`, {
                status: newStatus,
                logMsg: `${newStatus} 처리됨`
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            })
            if (res.data.success) {
                alert(`${newStatus} 처리 완료!`)
                onClose()
                window.location.reload()
            }
        } catch {
            alert("처리 중 오류 발생")
        }
    }

    // 분개 삭제
    const handleDeleteDept = async (dept_idx) => {
        if (!window.confirm("삭제할까요?")) return
        await axios.delete(`http://localhost:8080/accountDeptDelete/${entry.entry_idx}/details/${dept_idx}`)
        setDeptList(prev => prev.filter(d => d.dept_idx !== dept_idx))
    }

    if (!open || !entry) return null

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentWrapperStyle}>
                <button className="entryList-fabBtn gray" onClick={onClose} style={{ position: 'absolute', top: 20, right: 20 }}>
                    닫기
                </button>

                <div style={modalLeftPanelStyle}>
                    <h3 style={titleStyle}>전표 상세</h3>

                    <table className="entryDetail-table">
                        <tbody>
                        <tr><th>전표번호</th><td>{`JV${entry.entry_date?.slice(0, 10).replaceAll('-', '')}${String(entry.entry_idx).padStart(3, '0')}`}</td></tr>
                        <tr><th>유형</th><td>{entry.entry_type}</td></tr>
                        <tr><th>거래처</th><td>{entry.custom_name || '-'}</td></tr>
                        <tr><th>고객</th><td>{entry.customer_name || '-'}</td></tr>
                        <tr><th>금액</th><td>{entry.amount?.toLocaleString()}원</td></tr>
                        <tr><th>일자</th><td>{entry.entry_date?.slice(0, 10)}</td></tr>
                        <tr><th>상태</th><td>{entry.status}</td></tr>
                        <tr><th>작성자</th><td>{entry.user_name}</td></tr>
                        <tr><th>승인자</th><td>{entry.approver_name || '-'}</td></tr>
                        </tbody>
                    </table>

                    <div style={{ marginBottom: '10px' }}>
                        {files.length ? (
                            files.map(file => (
                                <div key={file.file_idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <strong>첨부파일:</strong>
                                    <span>📎 {file.ori_filename}</span>
                                    <button className="entryList-fabBtn blue" onClick={() => setSelectedFile(file)}>미리보기</button>
                                    <button className="entryList-fabBtn gray" onClick={() => window.open(`http://localhost:8080/entryFileDown/${file.file_idx}`, '_blank')}>다운로드</button>
                                </div>
                            ))
                        ) : (
                            <div><strong>첨부파일:</strong> 없음</div>
                        )}
                    </div>

                    {/* 분개 테이블 */}
                    <div style={{ marginTop: '30px' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h4>분개 목록</h4>
                            <button className="entryList-fabBtn blue" onClick={() => setShowDeptRegist(true)}>분개 등록</button>
                        </div>

                        <table className="entryDetail-table">
                            <thead>
                            <tr><th>번호</th><th>계정과목</th><th>차/대변</th><th>금액</th><th>파일</th><th>PDF</th><th>수정/삭제</th></tr>
                            </thead>
                            <tbody>
                            {deptList.map(dept => (
                                <tr key={dept.dept_idx}>
                                    <td>{dept.dept_idx}</td>
                                    <td>{dept.as_name}</td>
                                    <td>{dept.type}</td>
                                    <td>{dept.amount.toLocaleString()}원</td>
                                    <td>{dept.file_idx ? <a href={`http://localhost:8080/deptfileDown/${dept.file_idx}`} target="_blank">다운</a> : '-'}</td>
                                    <td>
                                        <button className="entryList-fabBtn gray" onClick={async () => {
                                            const res = await axios.post("http://localhost:8080/accountDeptPdf", {
                                                dept_idx: dept.dept_idx,
                                                template_idx: 14
                                            })
                                            if (res.data.success) {
                                                setDeptPreviewUrl(`http://localhost:8080/entryFileDown/${res.data.file_idx}?preview=true`)
                                            } else {
                                                alert("PDF 실패")
                                            }
                                        }}>미리보기</button>
                                    </td>
                                    <td>
                                        <button className="entryList-fabBtn gray" onClick={() => { setSelectedDept(dept); setEditDeptOpen(true) }}>✏️</button>
                                        <button className="entryList-fabBtn red-del" onClick={() => handleDeleteDept(dept.dept_idx)}>🗑</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 수정 버튼 */}
                    {loginUserId && String(entry.user_id) === loginUserId && (
                        <button className="entryList-fabBtn blue" onClick={() => setEditOpen(true)}>✏️ 수정하기</button>
                    )}

                    {/* 상태 버튼 */}
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        {entry.status === "작성중" && loginUserId === entry.user_id && (
                            <button className="entryList-fabBtn blue" onClick={() => updateStatus("제출")}>제출</button>
                        )}
                        {entry.status === "제출" && sessionStorage.getItem("user_type") === "admin" && (
                            <>
                                <button className="entryList-fabBtn blue" onClick={() => updateStatus("확정")}>확정</button>
                                <button className="entryList-fabBtn red-del" onClick={() => updateStatus("반려")}>반려</button>
                            </>
                        )}
                        {entry.status === "반려" && loginUserId === entry.user_id && (
                            <button className="entryList-fabBtn blue" onClick={() => updateStatus("제출")}>재제출</button>
                        )}
                    </div>

                    {/* 모달 연결 */}
                    <EntryEditModal
                        open={editOpen}
                        onClose={() => setEditOpen(false)}
                        entry={entry}
                        onSuccess={() => { onClose(); window.location.reload(); }} />

                    {showDeptRegist && (
                        <DeptRegistModal
                            entry_idx={entry.entry_idx}
                            onClose={() => setShowDeptRegist(false)}
                            onSuccess={() => {
                                axios.get(`http://localhost:8080/accountDeptList/${entry.entry_idx}/detail`)
                                    .then(res => setDeptList(res.data.data || []))
                            }}
                        />
                    )}

                    {editDeptOpen && selectedDept && (
                        <DeptEditModal
                            entry_idx={entry.entry_idx}
                            dept={selectedDept}
                            onClose={() => setEditDeptOpen(false)}
                            onSuccess={() => {
                                axios.get(`http://localhost:8080/accountDeptList/${entry.entry_idx}/detail`)
                                    .then(res => setDeptList(res.data.data || []))
                            }}
                        />
                    )}
                </div>

                {/* 오른쪽 미리보기 */}
                <div style={modalRightPreviewStyle}>
                    {selectedFile && (
                        <>
                            <h3 style={titleStyle}>미리보기</h3>
                            {selectedFile.type === 'pdf' ? (
                                <iframe src={`http://localhost:8080/entryFileDown/${selectedFile.file_idx}?preview=true`} width="100%" height="500px" style={previewStyle} />
                            ) : (
                                <img src={`http://localhost:8080/entryFileDown/${selectedFile.file_idx}?preview=true`} alt="첨부" style={previewStyle} />
                            )}
                        </>
                    )}
                    {deptPreviewUrl && (
                        <>
                            <h3 style={titleStyle}>📄 분개 PDF 미리보기</h3>
                            <iframe src={deptPreviewUrl} width="100%" height="500px" style={previewStyle} />
                            <div style={{ marginTop: 10, textAlign: 'right' }}>
                                <button className="entryList-fabBtn gray" onClick={() => setDeptPreviewUrl(null)}>닫기</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EntryDetailModal

// 💄 스타일 정의
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

const modalContentWrapperStyle = {
    display: 'flex',
    background: '#fff',
    borderRadius: '10px',
    width: '75vw',
    height: '85vh',
    overflow: 'hidden',
    position: 'relative'
}

const modalLeftPanelStyle = {
    flex: 1.2,
    padding: '30px',
    overflowY: 'auto',
    borderRight: '1px solid #eee'
}

const modalRightPreviewStyle = {
    flex: 0.8,
    padding: '20px',
    backgroundColor: '#f9f9f9',
    overflowY: 'auto'
}

const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center'
}

const previewStyle = {
    width: '100%',
    maxHeight: '500px',
    border: '1px solid #ccc',
    borderRadius: '8px'
}
