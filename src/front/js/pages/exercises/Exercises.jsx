import React, { Children, useContext, useEffect, useState } from "react"
import { Context } from '../../store/appContext.js'
import { Filters } from "../../component/Filters.jsx"
import { SkeletonTable } from "../../component/Loader.jsx"
import { MdZoomIn } from "react-icons/md";
import { MdZoomOut } from "react-icons/md";
import { CustomModal } from "../../component/CustomModal.jsx"
import { FaRegEye } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";


export const Exercises = () => {
  const [filter, setFilter] = useState("");
  const [viewMuscles, setViewMuscles] = useState({
    show: false,
    selectedMuscle: ""
  })
  const [zoom, setZoom] = useState(300)
  const { store } = useContext(Context)
  const { exercisesStates, } = store
  const { exercises, isExercisesLoading } = exercisesStates

  const filteredExercises = exercises.filter(exe => filter ? exe.category_name === filter : true);

  const filterOptions = [
    { label: "Abs", value: "Abs" },
    { label: "Arms", value: "Arms" },
    { label: "Back", value: "Back" },
    { label: "Calves", value: "Calves" },
    { label: "Cardio", value: "Cardio" },
    { label: "Chest", value: "Chest" },
    { label: "Legs", value: "Legs" },
    { label: "Shoulders", value: "Shoulders" },
  ];

  const handleViewClick = (muscle) => {
    setViewMuscles({ selectedMuscle: muscle, show: true })
    setZoom(300);
  }

  const handleClose = () => setViewMuscles({ selectedMuscle: "", show: false })

  const handleZoomIn = () => {
    if (zoom < 900) setZoom(prevZoom => prevZoom + 100);
  };

  const handleZoomOut = () => {
    if (zoom > 200) setZoom(prevZoom => prevZoom - 100);
  };

  if (isExercisesLoading) {
    return (
      <div className={'container mt-5'}>
        <SkeletonTable />
      </div>
    );
  }


  return (
    <div className={"container mt-2"}>
      <Filters options={filterOptions} onFilterChange={setFilter} />
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Muscle</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {exercises && (Boolean(filter) ? filteredExercises : exercises).map((exercise) => {
            return (
              <tr key={exercise.id}>
                <td>{exercise.name}</td>
                <td dangerouslySetInnerHTML={{ __html: exercise.description }}></td>
                <td>{exercise.category_name}</td>
                <td>
                  <div className="d-flex gap-2 align-items-center justify-content-end">
                    <span>{exercise.muscle_name_en}</span>
                    <button
                      className="btn btn-sm btn-warning rounded"
                      onClick={() => handleViewClick(exercise)}
                    >
                      <FaRegEye size={"1rem"} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}

        </tbody>
      </table>
      <CustomModal
        show={viewMuscles.show}
        onHide={handleClose}
        title={viewMuscles.selectedMuscle.muscle_name_en}
      >
        <div className="d-flex justify-content-end gap-2" >
          <OverlayTrigger overlay={<Tooltip id="tt-zoom-out">Zoom Out</Tooltip>}>
            <div onClick={handleZoomOut} style={{ cursor: "pointer", userSelect: "none" }}>
              <MdZoomOut size={"2rem"} fill={"var(--primary)"} />
            </div>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip id="tt-zoom-in">Zoom In</Tooltip>}>
            <div onClick={handleZoomIn} style={{ cursor: "pointer", userSelect: "none" }}>
              <MdZoomIn size={"2rem"} fill={"var(--primary)"} />
            </div>
          </OverlayTrigger>
        </div>
        <div className="d-flex justify-content-center">
          <img
            src={`${process.env.BACKEND_URL}${viewMuscles.selectedMuscle.image_url_main}`}
            alt={viewMuscles.selectedMuscle.muscle_name_en}
            className="img-fluid"
            style={{ height: `${zoom}px`, transition: "height 0.3s ease" }}
          />
        </div>
        <p className="mt-3">Scientific name: {viewMuscles.selectedMuscle.muscle_name}</p>
      </CustomModal>
    </div>
  )
}

