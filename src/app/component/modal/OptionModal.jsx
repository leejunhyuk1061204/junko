'use client'
import React, {useState} from 'react';
import {FaP, FaPlus} from "react-icons/fa6";
import {CiCircleMinus} from "react-icons/ci";

const sampleOption_key = [
    {idx:1,key:'색상'},
    {idx:2,key:'사이즈'},
    {idx:3,key:'옵션3'},
]

const sampleOption_value = [
    {idx:1,key:1,value:'R'},
    {idx:2,key:1,value:'G'},
    {idx:3,key:1,value:'B'},
    {idx:4,key:2,value:'S'},
    {idx:5,key:2,value:'M'},
    {idx:6,key:2,value:'L'},
    {idx:7,key:3,value:'밸류1'},
    {idx:8,key:3,value:'밸류2'},
    {idx:9,key:3,value:'밸류3'},
]

const ExamModal = ({open,onClose,val,optionList}) => {

    const [optionKey, setOptionKey] = useState(sampleOption_key);
    const [optionValue, setOptionValue] = useState(sampleOption_value);
    const [selectedValue, setSelectedValue] = useState({});
    const [combined, setCombined] = useState([]);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onClose();
    };

    const changeValue = (e,keyName) => {
        const {value} = e.target;
        setSelectedValue(prev=>(
            {...prev,
                [keyName]:value}
        ));
    }

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
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>옵션 등록</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div className='flex'>
                                {optionKey?.map(key=>
                                    <div key={key.idx} className='flex flex-direction-col gap_10 align-center'>
                                        <div>{key.key}<button className='cursor-pointer font-color-red margin-left-5'>[삭제]</button></div>
                                        <select key={key.idx} onChange={(e)=>changeValue(e, key.key)}>
                                            <option>선택</option>
                                            {optionValue.filter(v=>v.key===key.idx).map(item=>
                                                <option key={item.idx} value={item.value}>{item.value}</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className='flex'>
                                <div className='flex align-center justify-content-center'><button className='cursor-pointer'>옵션<FaPlus className='margin-left-5'/></button></div>
                                <div>
                                    <button className='cursor-pointer' onClick={()=>setCombined(prev=>[...prev,selectedValue])}>등록</button>
                                </div>
                            </div>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>옵션명</th>
                                            <th>현재 재고 수량</th>
                                            <th>최소 재고 수량</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {combined.map((item,idx)=>(
                                            <tr key={idx}>
                                                <td>{Object.values(item).join('-')}</td>
                                                <td><input type='number'/></td>
                                                <td><input type='number'/></td>
                                            </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default ExamModal;