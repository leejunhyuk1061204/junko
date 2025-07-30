'use client'
import React, {useState, useEffect} from 'react';
import { Page, Document, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PdfViewer({ file }) {
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);
    const [blobUrl, setBlobUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setBlobUrl(null);
            return;
        }
        if (typeof file === 'string') {
            setBlobUrl(file);
        } else if (file instanceof Blob || file instanceof File) {
            const url = URL.createObjectURL(file);
            setBlobUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    // 이 함수가 반드시 있어야 함!
    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onLoadError = (error) => {
        console.error('PDF 로드 실패:', error);
        setError(error);
    };

    if (error) return <div style={{ color: 'red' }}>PDF 로드 실패: {error.message}</div>;
    if (!file) return <div>파일 없음</div>;

    return (
        <div>
            {!numPages && <div>PDF 불러오는 중...</div>}

            {blobUrl && (
                <Document
                    file={blobUrl}
                    onLoadSuccess={onLoadSuccess}  // 이 부분이 함수가 선언돼야 정상
                    onLoadError={onLoadError}
                    loading={<div>PDF 불러오는 중...</div>}
                >
                    {Array.from({ length: numPages || 0 }).map((_, index) => (
                        <Page key={index} pageNumber={index + 1} />
                    ))}
                </Document>
            )}
        </div>
    );
}
