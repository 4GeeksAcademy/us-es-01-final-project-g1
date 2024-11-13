import React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

export const NoRecords = () => {
    return (

        <tr>
            <td colSpan={12}>
                <div className={"noRecords-container"}>
                    <span className={'noRecords-container-icon'}>
                        <FaExclamationTriangle />
                    </span>
                    <span className={'noRecords-container-text'}>
                        No Records to show
                    </span>
                </div>
            </td>
        </tr>


    )
}
