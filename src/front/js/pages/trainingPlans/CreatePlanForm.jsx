import React, { useContext, useState, useEffect } from 'react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { FormLayout } from '../../component/FormLayout.jsx'
import { Input } from '../../component/Input.jsx'
import { Context } from '../../store/appContext.js'
import { useLevelOptions } from '../../hooks/useLevelOptions.js'


export const CreatePlanForm = () => {
    const { levelOptions } = useLevelOptions()
    const { actions, store } = useContext(Context)
    const user = JSON.parse(localStorage.getItem("user"))
    const [name, setName] = useState("")
    const [registrationDate, setRegistrationDate] = useState("") // definir formato de fechas
    const [finalizationDate, setFinalizationDate] = useState("") // definir formato de fechas
    const [quantitySession, setQuantitySession] = useState("")
    const [exercises, setExercises] = useState([])
    const [level, setLevel] = useState("begginer") // 'begginer', 'intermediate', 'advanced',
    const navigate = useNavigate("")

    const _exercises = store?.exercisesStates?.exercises?.map((exercises) => ({
        label: exercises.name,
        value: exercises.id
    }))

    console.log("estados de los ejercicios", store?.exercisesStates)
    console.log("ejercicios selecionados", exercises)

    //--> vamos a encontrar la coincidencia de los ejercicios selecionados con respecto a los tpe
    const valero = store?.exercisesStates?.trainingPlanExercises?.map(tpe =>
        exercises.some(exercisesSelected => exercisesSelected?.value === tpe?.exercise_id)
      );
      

    console.log("aqui tengo que traer", valero)


    const createPlan = (e) => {
        e.preventDefault()
        const formData = {
            name: name,
            registration_date: registrationDate,
            finalization_date: finalizationDate,
            quantity_session: quantitySession,
            level: level
        }
        actions.crudTrainingPlans({ formData, navigate, action: "create" })
    }

    useEffect(() => {
        actions.getTrainingPlanExercises()
    }, [])

    return (
        <FormLayout title={"Create your Exercise Plan"} onSubmit={createPlan} actionText={"Create Plan"}>
            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} type={"text"} />
            <Input label="Registration Date" id="registrationDate" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} type={"date"} />
            <Input label="Finalization Date" id="finalizationDate" value={finalizationDate} onChange={(e) => setFinalizationDate(e.target.value)} type={"date"} />
            <Input label="Quantity Sessions" id="quantitySesions" value={quantitySession} onChange={(e) => setQuantitySession(e.target.value)} type={"number"} />
            <div className='mb-3'>
                <label htmlFor={"level"} className='form-label'>
                    Level
                </label>
                <Select options={levelOptions} onChange={(data) => setLevel(data.value)} />
            </div>
        </FormLayout >
    )
}

