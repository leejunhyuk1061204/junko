import axios from 'axios';

//  하드코딩된 백엔드 API 주소
const API = 'http://localhost:8080';

//  수금/지급 등록
export const capRegist = async (data, token) => {
    return await axios.post(`${API}/capRegist`, data, {
        headers: { Authorization: token }
    });
};

//  수금/지급 상세 조회
export const getCapDetail = async (cap_idx) => {
    return await axios.get(`${API}/capList/${cap_idx}`);
};

// 수금/지급 검색
export const searchCap = (dto) => {
    return axios.post(`${API}/searchCap`, dto);
};

export const searchCapPaged = (dto) => {
    return axios.post(`${API}/searchCapPaged`, dto);
};

//  수금/지급 수정
export const updateCap = async (cap_idx, data, token) => {
    return await axios.put(`${API}/capUpdate/${cap_idx}`, data, {
        headers: { Authorization: token }
    });
};

// 수금/지급 삭제
export const deleteCap = (cap_idx, token) => {
    return axios.delete(`${API}/capDel/${cap_idx}`, {
        headers: {
            Authorization: token
        }
    });
};

//  거래처 리스트 (계좌 포함)
export const getCustomList = async () => {
    return await axios.get(`${API}/capCustomList`);
};

//  전표/정산/세금계산서 연동 리스트
export const getLinkedItems = async () => {
    return await axios.get(`${API}/linked/all`);
};

//  파일 업로드
export const uploadCapFile = async (cap_idx, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`${API}/capFile/${cap_idx}/upload`, formData);
};

//  파일 다운로드
export const downloadCapFile = async (file_idx) => {
    return await axios.get(`${API}/capDown/${file_idx}`, {
        responseType: 'blob',
    });
};

//  파일 삭제
export const deleteCapFile = async (file_idx) => {
    return await axios.delete(`${API}/capFileDel/${file_idx}`);
};

//  PDF 자동 생성
export const generatePdf = async (cap_idx, template_idx) => {
    const params = new URLSearchParams();
    params.append('cap_idx', cap_idx);
    params.append('template_idx', template_idx);
    return await axios.post(`${API}/capPdf`, params);
};

//  이력 조회
export const getCapLog = async (cap_idx) => {
    return await axios.get(`${API}/capLog/${cap_idx}`);
};

export const getCapFileList = async (cap_idx) => {
    return await axios.get(`${API}/capFileList/${cap_idx}`);
};