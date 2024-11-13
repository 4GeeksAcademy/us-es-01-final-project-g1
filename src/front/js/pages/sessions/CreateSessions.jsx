import React, { useContext, useState, } from 'react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { FormLayout } from '../../component/FormLayout.jsx'
import { Input } from '../../component/Input.jsx'
import { Context } from '../../store/appContext.js'


export const CreateSessions = () => {
  const { actions, store } = useContext(Context)
  const userFromLocalStorage = JSON.parse(localStorage.getItem("user"))
  const _trainingPlans = store?.trainingPlansStates?.trainingPlans?.map((plan) => ({
    label: plan.name,
    value: plan.id
  }))

  const [date, setDate] = useState("")
  const [name, setName] = useState("")
  const [trainingPlan, setTrainingPlan] = useState("")
  const navigate = useNavigate()
  const createSession = (e) => {
    e.preventDefault()
    const formData = {
      date,
      name,
      training_plan_id: trainingPlan,
      user_id: store.user.id ?? userFromLocalStorage.id
    }
    actions.createSessions({ formData, navigate })
  }

  return (
    <FormLayout isLoading={store.sessionsStates.isSessionsLoading} title={"Create your Session"} onSubmit={createSession} actionText={"Create Session"} goBackOnClick={() => navigate("/sessions")} >
      <Input label="Session Name" id="name" value={name} onChange={(e) => setName(e.target.value)} type={"text"} />
      <Input label="Date" id="date" value={date} onChange={(e) => setDate(e.target.value)} type={"date"} />
      <div className='mb-3'>
        <label htmlFor={"level"} className='form-label'>
          Training Plans
        </label>
        <Select options={_trainingPlans} onChange={(data) => setTrainingPlan(data.value)} />
      </div>
    </FormLayout >
  )
}
