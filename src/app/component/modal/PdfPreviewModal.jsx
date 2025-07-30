'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../globals.css';

export default function PdfPreviewModal({ settlementIdx, templateIdx, onClose }) {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const generatePdf = async () => {
            try {
                const res = await axios.post('http://192.168.0.122/settlementPdf', null, {
                    params: {
                        settlement_idx: settlementIdx,
                        template_idx: templateIdx,
                    },
                });

                if (res.data.success) {
                    // 경로 변환: 백엔드가 C:/upload/pdf로 저장 → 프론트용 URL 가정
                    const filename = res.data.file_path.split('/').pop();
                    setPdfUrl(`http://192.168.0.122/pdf/preview/${filename}`);
                } else {
                    alert('PDF 생성 실패: ' + res.data.message);
                }
            } catch (err) {
                console.error('PDF 생성 오류:', err);
            }
        };

        generatePdf();
    }, [settlementIdx, templateIdx]);

    return (
        <div className="modal">
            <div className="modal-content" style={{ width: '80vw', height: '80vh' }}>
                <h3>PDF 미리보기</h3>
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="90%"
                        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                ) : (
                    <p>PDF를 불러오는 중입니다...</p>
                )}
                <div className="modal-actions">
                    <button className="btn-gray" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}
