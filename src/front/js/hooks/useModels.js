export const useModels = () => {

  const mapViewModels = {
    training_plans: "View Plans",
    sessions: "View Session",
    default: "View"
    // training_exercises: "MuscleExercises",
    // session_exercises,
    // muscle_exercises
  }
  
  const mapModels = {
    training_plans: "Training Plans",
    sessions: "Sessions",
    default: ""
    // training_exercises: "MuscleExercises",
    // session_exercises,
    // muscle_exercises
  }
  
  const mapRoutesModels = {
    training_plans: "/training-plan",
    sessions: "/sessions",
    default: ""
    // training_exercises: "MuscleExercises",
    // session_exercises,
    // muscle_exercises
  }

  //--> 
  const mapPagesCreateModelsRoutes = {
    training_plans: "/create-plan",
    sessions: "/create-sessions"
  }
  const mapPagesCreateModelsText = {
    training_plans: "Crea tu Primer Plan de Ejercicio",
    sessions: "Crea tu Primera Session" 
  }

  return {mapViewModels, mapModels, mapRoutesModels, mapPagesCreateModelsRoutes, mapPagesCreateModelsText}
}
