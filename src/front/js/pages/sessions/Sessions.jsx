import React, { useContext, useState } from "react"
import Tooltip from "react-bootstrap/Tooltip"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Button from "react-bootstrap/Button"
import ProgressBar from "react-bootstrap/ProgressBar"
import { Link } from 'react-router-dom'
import { CgGym } from "react-icons/cg";
import { Context } from '../../store/appContext.js'
import { formatDate } from "../../helper/formatDate.js";
import { SkeletonTable } from "../../component/Loader.jsx";
import { Title } from "../../component/Title.jsx";
import { Filters } from "../../component/Filters.jsx";
import { CustomModal } from "../../component/CustomModal.jsx";
import { NoRecords } from "../../component/NoRecords.jsx";
import "./sessions.css"

export const Sessions = () => {
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [exerciseUpdates, setExerciseUpdates] = useState({});

  const { store, actions } = useContext(Context)
  const { sessionsStates, exercisesStates } = store
  const { sessions } = sessionsStates
  const { trainingPlanExercises, exercises, sessionExercises } = exercisesStates

  //--> Obtener los planes unicos asociados a las sesiones
  const uniqueTrainingPlans = Array.from(
    new Set(sessions.map(s => s.training_plan_id))
  ).map(id => {
    const session = sessions.find(s => s.training_plan_id === id);
    return {
      label: session.training_plan_name,
      value: session.training_plan_id
    };
  });

  // Filtrar sesiones segunn el plan de entrenamiento seleccionado
  const filteredSessions = sessionsStates.sessions.filter(s =>
    filter ? s.training_plan_id === filter : true
  );

  //--> Calcular el progreso de una sesión
  const calculateProgress = (sessionId) => {
    const sessionExercises = exercisesStates.sessionExercises.filter(
      exe => exe.session_id === sessionId
    );
    if (sessionExercises.length === 0) return { progress: 0, variant: "danger" };

    const completedExercises = sessionExercises.filter(exe => exe.is_done).length;
    const progress = Math.round((completedExercises / sessionExercises.length) * 100);

    let variant = "danger";
    if (progress > 75) variant = "success";
    else if (progress > 33) variant = "warning";

    return { progress, variant };
  };

  const calculateExerciseProgress = (completedSeries, completedRepetitions, totalSeries, totalRepetitions) => {
    const seriesProgress = (completedSeries / totalSeries) * 100;
    const repetitionsProgress = (completedRepetitions / totalRepetitions) * 100;
    const overallProgress = Math.min((seriesProgress + repetitionsProgress) / 2, 100); // promedio para el progreso

    let variant = "danger";
    if (overallProgress > 75) variant = "success";
    else if (overallProgress > 33) variant = "warning";

    return { progress: overallProgress, variant };
  };


  const openModal = (session) => {
    setSelectedSession(session);
    const prefillUpdates = {};
    sessionExercises.forEach(exercise => {
      if (exercise.session_id === session.id) {
        prefillUpdates[exercise.id] = {
          series: exercise.series || 0,
          repetitions: exercise.repetitions || 0,
          is_done: exercise.is_done || false
        };
      }
    });

    setExerciseUpdates(prefillUpdates);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setExerciseUpdates({});
  };

  const handleExerciseUpdate = (sessionExerciseId, field, value) => {
    setExerciseUpdates((prev) => ({
      ...prev,
      [sessionExerciseId]: {
        ...prev[sessionExerciseId],
        [field]: Number(value),
      },
    }));
  };

  const handleSaveChanges = async () => {
    const exercisesToUpdate = Object.entries(exerciseUpdates).map(([sessionExerciseId, updates]) => {
      const sessionExercise = exercisesStates.sessionExercises.find(ex => ex.id === Number(sessionExerciseId));
      const trainingExercise = trainingPlanExercises.find(
        ex => ex.exercise_id === sessionExercise.exercise_id &&
          ex.training_plan_id === selectedSession.training_plan_id
      );

      if (!sessionExercise || !trainingExercise) return null;

      const totalSeries = trainingExercise.series || 1;
      const totalRepetitions = trainingExercise.repetitions || 1;
      const is_done = updates.series >= totalSeries && updates.repetitions >= totalRepetitions;

      return {
        id: sessionExercise.id,
        completedSeries: updates.series,
        completedRepetitions: updates.repetitions,
        is_done
      };
    }).filter(Boolean);
    await actions.updateSessionExercises(exercisesToUpdate);

    setExerciseUpdates({});
    closeModal();
  };


  if (sessionsStates.isSessionsLoading) {
    return (
      <div className={"container mt-5"}>
        <SkeletonTable />
      </div>
    )
  }
  return (
    <div className={"container mt-2"}>
      <Title title={"Sessions"}>
        <div className="sessions-header-container">
          <Button as={Link} to={"/create-sessions"} variant={"info"}>
            Create a Session
          </Button>
        </div>
      </Title>

      <Filters options={uniqueTrainingPlans} onFilterChange={setFilter} title={"Filter by Training Plan"} />
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">Session Name</th>
            <th scope="col">Date</th>
            <th scope="col">Training Plan</th>
            <th style={{ minWidth: "185px", maxWidth: "200px" }}>Progress</th>
            <th scope="col">View Progress</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.length ? filteredSessions.map((session, index) => {
            const { progress, variant } = calculateProgress(session.id);
            return (
              <tr key={index}>
                <td>{session.name}</td>
                <td>{formatDate(session.date)}</td>
                <td>{session.training_plan_name}</td>
                <td style={{ position: "relative" }}>
                  <ProgressBar
                    animated
                    now={progress}
                    variant={variant}
                    style={{ height: "25px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      color: `${variant === "success" ? "#d3c7bb" : "#2c2b33"}`,
                      fontWeight: "600",
                    }}
                  >
                    {`${progress}%`}
                  </span>
                </td>
                <td className="text-center">
                  <OverlayTrigger overlay={<Tooltip id="update-exercises">Update Exercises</Tooltip>}>
                    <Button variant="info" size={"sm"} onClick={() => openModal(session)} >
                      <CgGym />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            )
          }) : <NoRecords />}
        </tbody>
      </table>


      {selectedSession && (
        <CustomModal
          size={"lg"}
          show={showModal}
          onHide={closeModal}
          title={`Update Progress for ${selectedSession.name}`}
          footerButtons={[
            { label: "Close", onClick: closeModal },
            { label: "Save Changes", variant: "primary", onClick: handleSaveChanges }
          ]}
        >
          <div>
            <div className="d-flex align-items-center justify-content-between">

              <h5>Training Plan: {selectedSession.training_plan_name}</h5>
              <h5>Date: {formatDate(selectedSession.date)}</h5>
            </div>
            {trainingPlanExercises
              .filter(exe => exe.training_plan_id === selectedSession.training_plan_id)
              .map((exercise) => {

                const exerciseName = exercises.find(
                  (ex) => ex.id === exercise.exercise_id
                )?.name || `Exercise #${exercise.exercise_id}`;

                // Datos actuales del ejercicio en la sesión
                const sessionExerciseData = sessionExercises.find(
                  (sessionExe) =>
                    sessionExe.exercise_id === exercise.exercise_id &&
                    sessionExe.session_id === selectedSession.id
                );

                const sessionExerciseId = sessionExerciseData?.id ?? `temp-${exercise.exercise_id}`;

                const completedSeries = exerciseUpdates[sessionExerciseId]?.series || sessionExerciseData?.series || 0;
                const completedRepetitions = exerciseUpdates[sessionExerciseId]?.repetitions || sessionExerciseData?.repetitions || 0;
                const totalSeries = exercise.series || 1;
                const totalRepetitions = exercise.repetitions || 1;

                // Calcula el progreso y la variante usando la nueva función
                const { progress, variant } = calculateExerciseProgress(completedSeries, completedRepetitions, totalSeries, totalRepetitions);


                return (
                  <div key={exercise.id} className="my-2" style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--primary)" }}>
                    <span className="d-block mb-1"><strong>{exerciseName}</strong></span>
                    <ProgressBar animated now={progress} label={`${Math.round(progress)}%`} className="mb-2" style={{ height: "25px" }} variant={variant} />
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2">Series:</span>
                      <span className="me-3">Total: {totalSeries}</span>
                      <input
                        type="number"
                        placeholder="Completed Series"
                        value={exerciseUpdates[sessionExerciseId]?.series ?? ""}
                        className="form-control me-2"
                        onChange={(e) => handleExerciseUpdate(sessionExerciseId, "series", e.target.value)}
                      />
                      <span className="me-2">Repeticiones:</span>
                      <span className="me-3">Total: {totalRepetitions}</span>
                      <input
                        type="number"
                        placeholder="Completed Repeticiones"
                        value={exerciseUpdates[sessionExerciseId]?.repetitions ?? ""}
                        className="form-control me-2"
                        onChange={(e) => handleExerciseUpdate(sessionExerciseId, "repetitions", e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CustomModal>
      )}
    </div>
  )
}
