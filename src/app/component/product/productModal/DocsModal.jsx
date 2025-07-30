import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DocsModal({ productIdx, onClose }) {
    const [docs, setDocs] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState({});

    const toggleDropdown = (id) => {
        setDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchDocs = async () => {
        const token = sessionStorage.getItem('token');
        const res = await axios.get(`http://192.168.0.122:8080/product/${productIdx}/docs`, {
            headers: { Authorization: token }
        });
        setDocs(res.data.docs || []);
    };

    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;

        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        uploadFiles.forEach(file => formData.append('docs', file));

        await axios.post(`http://192.168.0.122:8080/product/${productIdx}/docs`, formData, {
            headers: { Authorization: token }
        });
        setUploadFiles([]);
        await fetchDocs();
    };

    const handleDelete = async (docId) => {
        const token = sessionStorage.getItem('token');
        await axios.put(`http://192.168.0.122:8080/product/docs/${docId}/del`, null, {
            headers: { Authorization: token }
        });
        await fetchDocs();
    };

    useEffect(() => {
        fetchDocs();
    }, [productIdx]);

    const handleDownload = async (filename, oriFilename) => {
        const token = sessionStorage.getItem('token');
        const res = await axios.get(`http://192.168.0.122:8080/product/docs/${filename}`, {
            headers: { Authorization: token },
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', oriFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-content" style={{ maxWidth: '500px' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        background: 'none',
                        border: 'none',
                        fontSize: '1.8rem',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                <h3 className="margin-bottom-10">📎 등록된 문서</h3>
                <ul className="flex flex-direction-col gap_10 margin-bottom-20">
                    {docs.length === 0 && <li>문서가 없습니다.</li>}
                    {docs.map(doc => (
                        <li key={doc.file_idx} className="flex justify-content-between align-center">
                            <span className="text-align-left flex-1">{doc.ori_filename}</span>

                            <div className="flex gap_10 justify-right">
                                {/* 드롭다운 */}
                                <div className="product-dropdown-wrap" style={{ position: 'relative' }}>
                                    <button
                                        className="product-btn"
                                        onClick={() => toggleDropdown(doc.file_idx)}
                                    >
                                        문서 ▼
                                    </button>

                                    {dropdownOpen[doc.file_idx] && (
                                        <div className="product-dropdown-content">
                                            <button
                                                onClick={() => {
                                                    window.open(`http://192.168.0.122:8080/product/docs/${doc.new_filename}`, '_blank');
                                                    toggleDropdown(doc.file_idx);
                                                }}
                                            >
                                                미리보기
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDownload(doc.new_filename, doc.ori_filename);
                                                    toggleDropdown(doc.file_idx);
                                                }}
                                            >
                                                다운로드
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button className="product-btn-del" onClick={() => handleDelete(doc.file_idx)}>
                                    삭제
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>


                <input type="file" multiple onChange={(e) => setUploadFiles([...e.target.files])} />
                <button className="product-btn margin-top-10" onClick={handleUpload}>
                    문서 업로드
                </button>
            </div>
        </div>
    );
}
