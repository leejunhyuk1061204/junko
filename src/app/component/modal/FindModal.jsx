'use client'
import React, {useState} from 'react';

const FindModal = ({open,onClose}) => {

    const [type, setType] = useState('id');

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
                    background: '#f4f6fa',
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
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>아이디 / 비밀번호 찾기</h3>
                <>
                    <div className='' style={{background:'#fff',borderRadius: '10px',boxShadow:'4px 4px 5px rgba(0,0,0,0.15)',padding:'15px'}}>
                    {/* 탭 버튼 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        margin: '24px 0'
                    }}>
                        <button
                            className={`btn label white_color ${type === 'id' ? 'bg_primary_color_2' : 'bg_primary_color_2'}`}
                            style={{
                                padding: '8px 20px',
                                cursor: 'pointer',
                                fontWeight: type === 'id' ? 'bold' : 'normal'
                            }}
                            onClick={() => setType('id')}
                        >
                            아이디 찾기
                        </button>
                        <button
                            className={`btn label white_color ${type === 'pw' ? 'bg_primary_color_1' : 'bg_primary_color_2'}`}
                            style={{
                                padding: '8px 20px',
                                cursor: 'pointer',
                                fontWeight: type === 'pw' ? 'bold' : 'normal'
                            }}
                            onClick={() => setType('pw')}
                        >
                            비밀번호 찾기
                        </button>
                    </div>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {type==='id' && (
                                <>

                                </>
                            )}
                    </div>
                    </div>
                </>
            </div>
        </div>
    );
};

export default FindModal;