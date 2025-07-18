'use client'

import Select from "react-select";
import {useState} from "react";

const generateTimeOptions = () => {

    const options = [];

    for (let h = 1; h <= 23; h++) {
        for (let m = 0; m < 60; m += 10) {
            const hour = h.toString().padStart(2, '0');
            const min = m.toString().padStart(2, '0');
            const lab = `${hour}:${min}`;
            options.push({value: lab, label: lab});
        }
    }
    return options;
};

const customStyles = {
    control: (provided) => ({
        ...provided,
        fontSize: '14px',
        padding: '2px',
        minHeight: '36px',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
};

export default function TimeSelect({value, onChange, placeholder}) {
    const options = generateTimeOptions();
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Select
                options={options}
                styles={customStyles}
                value={options.find(opt => opt.value === value) || null}
                onChange={(selected) => onChange(selected.value)}
                placeholder={placeholder}
                isClearable
                menuIsOpen={hovered}
            />
        </div>
    );
}