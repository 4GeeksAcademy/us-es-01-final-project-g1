import React, { useContext, useState, useEffect } from 'react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { FormLayout } from '../../component/FormLayout.jsx'
import { Input } from '../../component/Input.jsx'
import { Context } from '../../store/appContext.js'
import { formatDate } from '../../helper/formatDate.js'
import { useLevelOptions } from '../../hooks/useLevelOptions.js'


export const UpdatePlanForm = () => {
    const { levelOptions } = useLevelOptions()
    const { actions, store } = useContext(Context)
    const user = JSON.parse(localStorage.getItem("user"))
    const [name, setName] = useState(store.currentTrainingPlan.name)
    const [registrationDate, setRegistrationDate] = useState(store.currentTrainingPlan.registration_date) // definir formato de fechas
    const [finalizationDate, setFinalizationDate] = useState(store.currentTrainingPlan.finalization_date) // definir formato de fechas
    const [quantitySession, setQuantitySession] = useState(store.currentTrainingPlan.quantity_session)
    const [level, setLevel] = useState(levelOptions.find(option => option.value === store.currentTrainingPlan.level)) // 'begginer', 'intermediate', 'advanced',
    const navigate = useNavigate()

    const onEdit = (e) => {
        e.preventDefault()
        const formData = {
            name,
            registration_date: registrationDate,
            finalization_date: finalizationDate,
            quantity_session: quantitySession,
            level: level.value,
            is_active: store.currentTrainingPlan.is_active
        }
        return actions.crudTrainingPlans({ formData, navigate, currentPlanId: store.currentTrainingPlan.id, action: store.action })
    }

    return (
        <FormLayout title={`${store.action === "edit" && "Edita"} tu Plan de Entrenamiento`} onSubmit={onEdit} actionText={"Edit Plan"}>
            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} type={"text"} />
            <Input label="Registration Date" id="registrationDate" value={formatDate(registrationDate)} onChange={(e) => setRegistrationDate(e.target.value)} type={"date"} />
            <Input label="Finalization Date" id="finalizationDate" value={formatDate(finalizationDate)} onChange={(e) => setFinalizationDate(e.target.value)} type={"date"} />
            <Input label="Quantity Sessions" id="quantitySesions" value={quantitySession} onChange={(e) => setQuantitySession(e.target.value)} type={"number"} />
            <div className='mb-3'>
                <label htmlFor={"level"} className='form-label'>
                    Level
                </label>
                <Select value={level} options={levelOptions} onChange={(data) => setLevel(data)} />
            </div>
        </FormLayout >
    )
}
