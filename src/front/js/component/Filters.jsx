import React from 'react'
import { MdCleaningServices } from "react-icons/md";
export const Filters = ({ options, onFilterChange }) => {
    return (

        <div className="d-flex flex-column">
            <div className='fs-4' style={{ color: "var(--bs-gray-100)" }}>
                Filters
            </div>
            <div className='d-flex gap-2 mt-2 mb-3'>
                {options.map(option => (
                    <button
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={'btn btn-secondary btn-sm'}
                    >
                        {option.label}
                    </button>
                ))}
                <button onClick={() => onFilterChange(null)} className="btn btn-danger btn-sm">
                    <MdCleaningServices />
                </button>
            </div>
        </div>
    )
}
