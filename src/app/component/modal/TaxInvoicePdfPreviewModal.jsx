import React from 'react';
import '../../globals.css';

const TaxInvoicePdfPreviewModal = ({ open, onClose, pdfUrl }) => {
    if (!open || !pdfUrl) return null;

    return (
        <div className="modal">
            <div className="modal-content w-[900px] h-[90vh] p-4 bg-white rounded shadow-md">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold">PDF 미리보기</h2>
                    <button className="text-sm text-red-500" onClick={onClose}>닫기</button>
                </div>

                <iframe
                    src={pdfUrl}
                    title="PDF Preview"
                    className="w-full h-full border"
                />
            </div>
        </div>
    );
};

export default TaxInvoicePdfPreviewModal;