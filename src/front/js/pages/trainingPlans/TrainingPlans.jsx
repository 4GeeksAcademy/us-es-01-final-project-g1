import React, { Children, useContext, useEffect } from "react"
import { Context } from '../../store/appContext.js'
import { Link } from 'react-router-dom'
import { MdEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2';


export const TrainingPlans = () => {
  const { store, actions } = useContext(Context)
  const { trainingPlans, isTrainingPlansLoading } = store
  const navigate = useNavigate()

  const crud = (plan, action) => {
    actions.getCurrentTrainingPlan(plan)
    actions.setAction(action)
    if (action === "edit") {
      return navigate("/update-plan")
    }
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5733",
      cancelButtonColor: "#d3c7bb",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        actions.crudTrainingPlans({ formData: plan, navigate, currentPlanId: store.currentTrainingPlan.id, action: "delete" })
        Swal.fire({
          title: "Deleted!",
          text: "Your Training Plan has been deleted.",
          icon: "success"
        });
      }
    });
  }

  useEffect(() => {
    const getTP = async () => {
      actions.getTrainingPlans()
    }
    getTP()
  }, []);

  if (isTrainingPlansLoading) {
    return (
      <div className={"container mt-2"}>
        <h1 style={{ color: "yellow" }}>Loader de Tabla</h1>
      </div>
    )
  }

  return (
    <div className={"container mt-2"}>
      <div className={"mx-0 my-3 float-end"}>
        <Link to={"/create-plan"} className={"btn btn-primary"} onClick={() => actions.setAction("create")}>
          Crear Plan de Entrenamiento
        </Link>
      </div>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Registration Date</th>
            <th scope="col">Finalization Date</th>
            <th scope="col"># Session</th>
            <th scope="col">Level</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {Children.toArray(trainingPlans?.results?.map((trainingPlan) => {
            return (
              <tr>
                <td>{trainingPlan?.name}</td>
                <td>{trainingPlan?.registration_date}</td>
                <td>{trainingPlan?.finalization_date}</td>
                <td>{trainingPlan?.quantity_session}</td>
                <td>{trainingPlan?.level}</td>
                <td>
                  <div className="d-flex gap-2">
                    <div className="btn btn-sm btn-primary rounded" onClick={() => crud(trainingPlan, "edit")}>
                      <MdEdit size={"1.5rem"} />
                    </div>
                    <div className="btn btn-sm btn-danger rounded">
                      <FaRegTrashCan size={"1.5rem"} onClick={() => crud(trainingPlan, "delete",)} />
                    </div>
                  </div>
                </td>
              </tr>
            )
          }))}
          
        </tbody>
      </table>
    </div>
  )
}
