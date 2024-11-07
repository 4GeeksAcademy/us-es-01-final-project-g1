import React, { Children, useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { Context } from '../../store/appContext';
import { Input } from '../../component/Input.jsx';
import { useNavigate } from 'react-router-dom';

export const TrainingExercises = ({ linInitialExercise, tpId, showForm, setShowForm }) => {
  const { store, actions } = useContext(Context);
  const [exercises, setExercises] = useState('');
  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');

  const navigate = useNavigate();

  const exercisesCollection = store?.exercisesStates?.exercises?.map((exercises) => ({
    label: exercises.name,
    value: exercises.id
  }));

  const addExercises = async (e) => {
    e.preventDefault()
    const formData = {
      training_plan_id: tpId,
      exercise_id: exercises,
      repetitions: repetitions,
      series: series
    }

    await actions.setTrainingPlanExercises(formData, navigate)
    setShowForm(false)
  }

  if (linInitialExercise === tpId && showForm) {
    return (
      <form className={'innerTableForm-container'} onSubmit={addExercises}>
        <div className='mb-3 table-light'>
          <label htmlFor={'Exercises'} className='form-label innerTableForm-label'>
            Ejercicios
          </label>
          <Select options={exercisesCollection} onChange={(data) => setExercises(data.value)} />
        </div>
        {Boolean(exercises) && linInitialExercise === tpId ? (
          <>
            <Input label="Series" id="series" value={series} onChange={(e) => setSeries(e.target.value)} type={"text"} />
            <Input label="Repetition" id="Repetition" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} type={"text"} />
          </>
        ) : null}
        <button className='btn btn-warning w-100'>Actualizar</button>
      </form>
    )
  }
  return null


}

export const AddTrainingExercises = ({ linkedExercises, onClick }) => {
  const { store, actions } = useContext(Context);

  console.log("linkedExercises", linkedExercises) //--> array
  console.log("store adetnro de add", store) //-> array

  const algo = store?.exercisesStates?.exercises.find((ex) => ex.id === linkedExercises[0].exercise_id)
  console.log("algo", algo)



  return (
    <>
      {linkedExercises?.length > 0 ? (
        <>
          <ul>
            {linkedExercises?.map((exercise, index) => (
              <li key={index}>
                {exercise?.name} - Series: {exercise?.series}, Repeticiones: {exercise?.repetitions}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <span className={"innerTableForm-initialMessage"} onClick={onClick}>Add Exercise</span>
      )}
    </>
  )

}
