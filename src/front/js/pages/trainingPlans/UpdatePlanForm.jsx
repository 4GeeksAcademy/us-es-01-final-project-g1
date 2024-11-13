import React, { useContext, useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { FormLayout } from '../../component/FormLayout.jsx';
import { Input } from '../../component/Input.jsx';
import { Context } from '../../store/appContext.js';
import { formatDate } from '../../helper/formatDate.js';
import { useLevelOptions } from '../../hooks/useLevelOptions.js';
import { Badge, Col, Row } from 'react-bootstrap';

export const UpdatePlanForm = () => {
    const { levelOptions } = useLevelOptions();
    const { actions, store } = useContext(Context);
    const { trainingPlansStates, exercisesStates } = store;
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        name: trainingPlansStates.currentTrainingPlan.name || "",
        registration_date: formatDate(trainingPlansStates.currentTrainingPlan.registration_date) || "",
        finalization_date: formatDate(trainingPlansStates.currentTrainingPlan.finalization_date) || "",
        quantity_session: trainingPlansStates.currentTrainingPlan.quantity_session || "",
        level: levelOptions.find(option => option.value === trainingPlansStates.currentTrainingPlan.level) || null,
        exercises: []
    });

    useEffect(() => {
        const associatedExercises = exercisesStates.trainingPlanExercises
            .filter(exercise => exercise.training_plan_id === trainingPlansStates.currentTrainingPlan.id)
            .map(exercise => ({
                label: store.exercisesStates.exercises.find(ex => ex.id === exercise.exercise_id)?.name || "Exercise",
                value: exercise.exercise_id,
                repetitions: exercise.repetitions,
                series: exercise.series
            }));

        setFormState(prevState => ({ ...prevState, exercises: associatedExercises }));
    }, [trainingPlansStates.currentTrainingPlan, exercisesStates.trainingPlanExercises, store.exercisesStates.exercises]);

    const exerciseCollection = exercisesStates.exercises.map(exe => ({
        label: exe.name,
        value: exe.id
    }));

    const onEdit = (e) => {
        e.preventDefault();
        const formData = {
            name: formState.name,
            registration_date: formState.registration_date,
            finalization_date: formState.finalization_date,
            quantity_session: formState.quantity_session,
            level: formState.level.value,
            is_active: trainingPlansStates.currentTrainingPlan.is_active,
            exercises: formState.exercises.map(exe => ({
                exercise_id: exe.value,
                repetitions: exe.repetitions,
                series: exe.series
            }))
        };
        actions.crudTrainingPlans({
            formData,
            navigate,
            currentPlanId: trainingPlansStates.currentTrainingPlan.id,
            action: 'edit'
        });
    };

    const onChange = (key, value) => {
        if (key === "exercises") {
            const updatedExercises = value.map(exe => {
                const existingExercise = formState.exercises.find(e => e.value === exe.value);
                return {
                    ...exe,
                    repetitions: existingExercise ? existingExercise.repetitions : "",
                    series: existingExercise ? existingExercise.series : ""
                };
            });
            setFormState(prevState => ({ ...prevState, exercises: updatedExercises }));
        } else {
            setFormState(prevState => ({ ...prevState, [key]: value }));
        }
    };

    const handleExerciseChange = (exerciseId, key, value) => {
        setFormState(prevState => ({
            ...prevState,
            exercises: prevState.exercises.map(exe =>
                exe.value === exerciseId ? { ...exe, [key]: value } : exe
            )
        }));
    };

    return (
        <FormLayout
            isLoading={trainingPlansStates.isTrainingPlansLoading}
            title={"Edita tu Plan de Entrenamiento"}
            onSubmit={onEdit}
            actionText={"Edit Plan"}
            goBackOnClick={() => navigate("/training-plan")}
            customWidth={"700px"}
        >
            <Row>
                <Col sm={6}>
                    <Input label="Name" id="name" value={formState.name} onChange={(e) => onChange("name", e.target.value)} type={"text"} />
                </Col>
                <Col sm={6}>
                    <div className='mb-3'>
                        <label htmlFor={"level"} className='form-label'>Level</label>
                        <Select value={formState.level} options={levelOptions} onChange={(data) => onChange("level", data)} />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col sm={6}>
                    <Input label="Registration Date" id="registrationDate" value={formState.registration_date} onChange={(e) => onChange("registration_date", e.target.value)} type={"date"} />
                </Col>
                <Col sm={6}>
                    <Input label="Finalization Date" id="finalizationDate" value={formState.finalization_date} onChange={(e) => onChange("finalization_date", e.target.value)} type={"date"} />
                </Col>
            </Row>

            <Row>
                <Col sm={6}>
                    <Input label="Quantity Sessions" id="quantitySession" value={formState.quantity_session} onChange={(e) => onChange("quantity_session", e.target.value)} type={"number"} />
                </Col>
                <Col sm={6}>
                    <div className="mb-3">
                        <label htmlFor={"exercises"} className='form-label'>Exercises</label>
                        <Select isMulti options={exerciseCollection} onChange={(data) => onChange("exercises", data)} value={formState.exercises} />
                    </div>
                </Col>
            </Row>

            {formState.exercises.length ? (
                <>
                    {formState.exercises.map(exe => (
                        <Row className='align-items-center h-100' key={exe.value}>
                            <Col sm={4}>
                                <Badge className='exercise-labelName'>{exe.label}</Badge>
                            </Col>
                            <Col sm={8} className='d-flex gap-1'>
                                <Input label="Series" id={`series-${exe.value}`} value={exe.series} onChange={(e) => handleExerciseChange(exe.value, "series", e.target.value)} type={"number"} />
                                <Input label="Repetitions" id={`repetitions-${exe.value}`} value={exe.repetitions} onChange={(e) => handleExerciseChange(exe.value, "repetitions", e.target.value)} type={"number"} />
                            </Col>
                        </Row>
                    ))}
                </>
            ) : null}
        </FormLayout>
    );
};
