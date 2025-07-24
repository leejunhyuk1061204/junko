'use client'

import {useState} from "react";

const DocumentDetailModal = ({html, onClose}) => {

    const [detailHtml, setDetailHtml] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleView = async (doc) => {
        try {
            const {data} = await axios.post('http://localhost:8080/document/preview')
        }
    }






    return (
        <div>

        </div>

    );


};

export default DocumentDetailModal;