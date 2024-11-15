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
import { StatusBadge } from "../../component/StatusBadge.jsx"

export const Sessions = () => {
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [exerciseUpdates, setExerciseUpdates] = useState({});

  const { store, actions } = useContext(Context)
  const { sessionsStates, exercisesStates } = store
  const { sessions } = sessionsStates
  const { trainingPlanExercises, exercises, sessionExercises } = exercisesStates

  const uniqueTrainingPlans = Array.from(
    new Set(sessions.map(s => s.training_plan_id))
  ).map(id => {
    const session = sessions.find(s => s.training_plan_id === id);
    return {
      label: session.training_plan_name,
      value: session.training_plan_id
    };
  });

  const filteredSessions = sessionsStates.sessions.filter(s =>
    filter ? s.training_plan_id === filter : true
  );

  const calculateProgress = (sessionId) => {
    const sessionExercises = exercisesStates.sessionExercises.filter(
      (exe) => exe.session_id === sessionId
    );

    // Calcular el total de repeticiones completadas
    const totalCompletedReps = sessionExercises.reduce((acc, exercise) => {
      const completedReps = exercise.series_list.reduce(
        (seriesAcc, series) => seriesAcc + series.repetitions_completed,
        0
      );
      return acc + completedReps;
    }, 0);

    // Calcular el total de repeticiones requeridas
    const totalRequiredReps = sessionExercises.reduce((acc, exercise) => {
      const planExercise = trainingPlanExercises.find(
        (planEx) => planEx.exercise_id === exercise.exercise_id
      );

      if (planExercise) {
        const requiredReps = planExercise.repetitions * planExercise.series;
        return acc + requiredReps;
      }

      return acc;
    }, 0);

    // Calcular el porcentaje de progreso
    const progress = totalRequiredReps > 0
      ? Math.round((totalCompletedReps / totalRequiredReps) * 100)
      : 0;

    // Determinar la variante del color del progreso
    let variant = "danger";
    if (progress > 67) variant = "success";
    else if (progress > 33) variant = "warning";

    return { progress, variant };
  };

  const calculateExerciseSeriesProgress = (seriesRepetitions = [], totalRepetitionsPerSeries = 1, totalRepetitionsRequired = 1) => {
    const normalizedRepetitions = Array.from({ length: seriesRepetitions.length }, (_, index) =>
      seriesRepetitions[index] || 0
    );

    const totalRepetitionsCompleted = normalizedRepetitions.reduce(
      (acc, reps) => acc + Math.min(reps, totalRepetitionsPerSeries), // Limitar cada repetición al máximo permitido por serie
      0
    );

    const progress = totalRepetitionsRequired > 0
      ? Math.min(Math.round((totalRepetitionsCompleted / totalRepetitionsRequired) * 100), 100) // Limitar progreso al 100%
      : 0;

    let variant = "danger";
    if (progress > 67) variant = "success";
    else if (progress > 33) variant = "warning";

    return { progress, variant };
  };

  const openModal = (session) => {
    setSelectedSession(session);

    const prefillUpdates = {};
    sessionExercises.forEach(exercise => {
      if (exercise.session_id === session.id) {
        const totalSeries = exercise.series || 1;
        const totalRepetitionsPerSeries = exercise.repetitions || 1;

        const totalRepetitionsRequired = totalSeries * totalRepetitionsPerSeries;

        const seriesRepetitions = exercise.series_list?.map(series => series.repetitions_completed) || Array(totalSeries).fill(0);

        prefillUpdates[exercise.id] = {
          seriesRepetitions,
          totalRepetitionsRequired,
          totalRepetitionsPerSeries
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

  const handleSaveChanges = async () => {
    const exercisesToUpdate = Object.entries(exerciseUpdates).map(([sessionExerciseId, updates]) => {
      const sessionExercise = exercisesStates.sessionExercises.find(ex => ex.id === Number(sessionExerciseId));
      const trainingExercise = trainingPlanExercises.find(
        ex => ex.exercise_id === sessionExercise.exercise_id &&
          ex.training_plan_id === selectedSession.training_plan_id
      );

      if (!sessionExercise || !trainingExercise) return null;

      const totalSeries = trainingExercise.series || 1;
      // const totalRepetitions = trainingExercise.repetitions || 1;

      const seriesRepetitions = updates.seriesRepetitions || Array(totalSeries).fill(0);

      return {
        id: sessionExercise.id,
        seriesRepetitions,
      };
    }).filter(Boolean);

    await actions.updateSessionExercises(exercisesToUpdate);

    setExerciseUpdates({});
    closeModal();
  };

  const handleSeriesRepetitionsUpdate = (sessionExerciseId, seriesIndex, value, totalSeries) => {
    setExerciseUpdates((prev) => {
      const previousRepetitions = prev[sessionExerciseId]?.seriesRepetitions || Array(totalSeries).fill(0);
      const updatedRepetitions = [...previousRepetitions];
      updatedRepetitions[seriesIndex] = Number(value);

      return {
        ...prev,
        [sessionExerciseId]: {
          ...prev[sessionExerciseId],
          seriesRepetitions: updatedRepetitions,
        },
      };
    });
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
            <th scope="col">Start Date</th>
            <th scope="col">Training Plan</th>
            <th scope="col">Plan Status</th>
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
                <td>
                  {session.training_plan_name}
                </td>
                <td>
                  <StatusBadge status={session.training_plan_status} />
                </td>
                <td style={{ position: "relative" }}>
                  <ProgressBar
                    animated
                    now={progress}
                    variant={variant}
                    style={{ height: "20px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      color: `${variant === "success" ? "#d3c7bb" : "#2c2b33"}`,
                      fontWeight: "600",
                      fontSize: "13px"
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

                // Obtenemos las repeticiones por serie o inicializamos si es la primera vez
                const totalSeries = exercise.series || 1;
                // const totalRepetitionsPerSeries = exercise.repetitions || 1;
                const seriesRepetitions = exerciseUpdates[sessionExerciseId]?.seriesRepetitions || Array(totalSeries).fill(0);

                const { totalRepetitionsRequired, totalRepetitionsPerSeries } = exerciseUpdates[sessionExerciseId] || {};

                // Calcula el progreso y la variante usando la nueva función
                const { progress, variant } = calculateExerciseSeriesProgress(
                  seriesRepetitions,
                  totalRepetitionsPerSeries,
                  totalRepetitionsRequired
                );


                return (
                  <div key={exercise.id} className="my-2" style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--primary)" }}>
                    <span className="d-block mb-1"><strong>{exerciseName}</strong></span>

                    {/* Progreso general del ejercicio */}
                    <ProgressBar animated now={progress} label={`${Math.round(progress)}%`} className="mb-2" style={{ height: "25px" }} variant={variant} />

                    <div className="d-flex flex-column mb-2">
                      {Array.from({ length: totalSeries }, (_, index) => (
                        <div key={index} className="d-flex align-items-center mb-1">
                          <span className="me-2">Serie {index + 1}:</span>
                          <input
                            type="number"
                            placeholder={`Reps completadas para Serie ${index + 1}`}
                            value={seriesRepetitions[index] ?? ""}
                            className="form-control me-2"
                            onChange={(e) => handleSeriesRepetitionsUpdate(sessionExerciseId, index, e.target.value, totalSeries)}
                          />
                          <span className="me-2">Total: {totalRepetitionsPerSeries}</span>
                        </div>
                      ))}
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
