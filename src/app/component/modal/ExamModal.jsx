import React from 'react';

const ExamModal = ({onClose}) => {

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
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
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '700px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>트레이너 찾기</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <label style={{ fontSize: '12.5px', marginTop: 12,fontWeight: 'bold'}}>아이디</label>
                            <input
                                type="text"
                                placeholder="아이디 입력"
                                value={userId}
                                style={{ width: '100%', marginTop: 4 }}
                            />
                            <button
                                className="btn label white_color"
                                style={{ marginTop: 8 }}
                            >
                                트레이너 검색
                            </button>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default ExamModal;