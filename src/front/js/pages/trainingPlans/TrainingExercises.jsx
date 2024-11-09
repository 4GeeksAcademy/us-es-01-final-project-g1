import React, { Children, useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { Context } from '../../store/appContext';
import { Input } from '../../component/Input.jsx';
import { useNavigate } from 'react-router-dom';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
export const TrainingExercises = ({ linInitialExercise, tpId, showForm, setShowForm, }) => {
  const { store, actions } = useContext(Context);

  const [formState, setFormState] = useState({
    exercises: []
  })
  const navigate = useNavigate();

  const exercisesCollection = store?.exercisesStates?.exercises?.map((exercises) => ({
    label: exercises.name,
    value: exercises.id
  }));

  const onExerciseSelect = (selectedExercises) => {
    const updateExercises = selectedExercises.map((exe) => {
      const existingExercise = formState.exercises.find(e => e.exercise_id === exe.value)
      return {
        ...exe,
        exercise_id: exe.value,
        name: exe.label,
        series: existingExercise?.series || "",
        repetitions: existingExercise?.repetitions || "",
      }
    })

    setFormState((prevState) => ({
      ...prevState,
      exercises: updateExercises
    }))
  }

  const onExerciseChange = (exerciseId, key, value) => {
    setFormState((prevState) => ({
      ...prevState,
      exercises: prevState.exercises.map((exe) => exe.value === exerciseId ? { ...exe, [key]: value } : exe)
    }))
  }

  // onSubmit
  const addExercises = async (e) => {
    e.preventDefault();
    const exercisesData = formState.exercises.map((exe) => ({
      training_plan_id: tpId,
      exercise_id: exe.exercise_id,
      repetitions: exe.repetitions,
      series: exe.series
    }))


    await actions.setTrainingPlanExercises(exercisesData, navigate);
    setShowForm(false);
  };

  if (linInitialExercise === tpId && showForm) {
    return (
      <form className={'innerTableForm-container'} onSubmit={addExercises}>
        <div className="innerTableForm-close">
          <IoIosCloseCircleOutline onClick={() => setShowForm(false)} />
        </div>
        <div className='mb-3 table-light'>
          <label htmlFor={'Exercises'} className='form-label innerTableForm-label'>
            Ejercicios
          </label>
          <Select isMulti options={exercisesCollection} onChange={onExerciseSelect} />
        </div>
        {formState.exercises.map((exe) => (
          <div key={exe.exercise_id} className='createFormSeriesRepetitionsContainer'>
            <div className='p-2 fs-6 mt-2 badge rounded bg-secondary'>{exe.name}</div>
            <div className='d-flex gap-1'>
              <Input
                label="Series"
                id={`series-${exe.exercise_id}`}
                value={exe.series}
                onChange={(e) => onExerciseChange(exe.exercise_id, "series", e.target.value)}
                type={"number"}
              />
              <Input
                label="Repetitions"
                id={`repetitions-${exe.exercise_id}`}
                value={exe.repetitions}
                onChange={(e) => onExerciseChange(exe.exercise_id, "repetitions", e.target.value)}
                type={"number"}
              />
            </div>
          </div>
        ))}
        <button className='btn btn-warning w-100'>Actualizar</button>
      </form>
    );
  }
  return null;
};

export const AddTrainingExercises = ({ trainingPlan, onClick,/*  updateExercise, showUpdateButton, */ showForm }) => {
  const [showExercisesDetails, setShowExercisesDetails] = useState(false)

  const { store } = useContext(Context);
  const { exercisesStates } = store
  const { exercises, trainingPlanExercises } = exercisesStates

  const linkedExercises = trainingPlanExercises?.filter(
    (exercise) => exercise.training_plan_id === trainingPlan?.id
  );

  return (
    <>
      {/* {linkedExercises?.length > 0 && (
        <div>
          <FaEye onClick={() => setShowExercisesDetails((prev) => !prev)} />
        </div>

      )} */}
      {linkedExercises?.length > 0 ? (
        <>
          {!showExercisesDetails ? (
            <div className='innerTableForm-container-exercisesDetails'>
              <div>{linkedExercises.length} Exercises</div>
              <div className='innerTableForm-container-exercisesDetails-iconWrapper' onClick={() => setShowExercisesDetails((prev) => !prev)}>
                <FaRegEye />
              </div>
            </div>
          ) : linkedExercises?.map((exercise, index) => {
            const exerciseDetails = exercises.find(exe => exe.id === exercise.exercise_id)
            const exerciseName = exerciseDetails ? exerciseDetails.name : "unk"
            return (
              <div key={index} className={"innerTableForm-container-exercises"}>
                <div className='innerTableForm-container-exercisesDetails-iconWrapper2' onClick={() => setShowExercisesDetails(false)}>
                  <div className='innerTableForm-container-exercisesDetails-iconWrapper-icon'>
                    <FaRegEyeSlash className='algo' />

                  </div>
                </div>
                <div><b>Exercise Name: </b>{exerciseName}</div>
                <div><b>Series:</b> {exercise?.series}</div>
                <div><b>Repetitions:</b> {exercise?.repetitions}</div>
              </div>
            )
          })}
        </>
      ) : linkedExercises?.length < 1 ? (
        <span className={`innerTableForm-initialMessage-${showForm ? "open" : "close"}`} onClick={onClick}>
          {!!showForm ? "Pick an exercise" : "Add Exercise"}
        </span>
      ) : null}
    </>
  );
};

export const UpdateExercise = ({ updateExerciseState, tpId, linkedExercises }) => {
  const { store, actions } = useContext(Context);
  const { exercisesStates } = store
  const { exercises } = exercisesStates

  const [series, setSeries] = useState('');
  const [repetitions, setRepetitions] = useState('');

  const foundExercise =
    linkedExercises?.length > 0
      ? exercises.find((exe) => exe.id === linkedExercises[0].exercise_id)
      : null;

  const navigate = useNavigate();


  const update = async (e) => {
    e.preventDefault();
    const formData = {
      training_plan_id: tpId,
      exercise_id: foundExercise?.id,
      repetitions: repetitions,
      series: series
    };

    await actions.setTrainingPlanExercises(formData, navigate, true);
    setShowForm(false);
  };

  const evaluation = updateExerciseState && updateExerciseState?.id === tpId && updateExerciseState?.show

  return (
    <>
      {evaluation ? (
        <form className={'innerTableForm-container'} onSubmit={update}>
          <div className='mb-3 table-light'>
            <label htmlFor={'Exercises'} className='form-label innerTableForm-label'>
              Ejercicios
            </label>
            <Select isDisabled={true} options={[]} value={[{ label: foundExercise?.name, }]} />
          </div>
          <Input
            label='Series'
            id='series'
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            type={'text'}
          />
          <Input
            label='Repetition'
            id='Repetition'
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value)}
            type={'text'}
          />
          <button className='btn btn-warning w-100'>Actualizar</button>
        </form>
      ) : null}
    </>
  );
};
