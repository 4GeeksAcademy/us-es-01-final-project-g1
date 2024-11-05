import React, { Children, useContext, useEffect, useState } from "react"
import Swal from 'sweetalert2';
import { FaRegTrashCan } from "react-icons/fa6";
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { MdEdit } from "react-icons/md";
import { Context } from '../../store/appContext.js'
import "../../../styles/trainingPlans.css"
import { BannerMessage } from "../../component/BannerMessage.jsx";

export const Sessions = () => {
  const { store, actions } = useContext(Context)
  
  const { sessionsStates } = store

  // const [filteredPlans, setFilteredPlans] = useState(() => trainingPlans)
  const navigate = useNavigate()

  // const crud = (plan, action) => {
  //   actions.getCurrentTrainingPlan(plan)
  //   actions.setAction(action)
  //   if (action === "edit") {
  //     return navigate("/update-plan")
  //   }
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#ff5733",
  //     cancelButtonColor: "#d3c7bb",
  //     confirmButtonText: "Yes, delete it!"
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       actions.crudTrainingPlans({
  //         formData: plan,
  //         navigate,
  //         currentPlanId: plan.id,
  //         action: "delete"
  //       })
  //       Swal.fire({
  //         title: "Deleted!",
  //         text: "Your Training Plan has been deleted.",
  //         icon: "success"
  //       });
  //     }
  //   });
  // }

  // const handleFilter = () => {
  //   if (filter === "begginer") {
  //     return setFilteredPlans(trainingPlans.filter((tp) => tp.level === "begginer"))
  //   }

  //   if (filter === "intermediate") {
  //     return setFilteredPlans(trainingPlans.filter((tp) => tp.level === "intermediate"
  //     ))
  //   }

  //   if (filter === "advanced") {
  //     return setFilteredPlans(trainingPlans.filter((tp) => tp.level === "advanced"
  //     ))
  //   }
  //   return setFilteredPlans(trainingPlans)
  // }


  useEffect(() => {
    // handleFilter()
    const getSessions = async () => {
      actions.getSessions()
    }
    getSessions()
  }, []);

  if (false) {
    return (
      <div className={"container mt-2"}>
        <h1 style={{ color: "yellow" }}>Loader de Tabla</h1>
      </div>
    )
  }
  return (
    <div className={"container mt-2"}>
      {/* <BannerMessage variant={"info"} message={"Crea tu Session eligiendo un plan de entrenamiento"} evaluation={true}/> */}
      <div className="trainingPlans-header-container">

        <div className={""}>
          <Link to={"/create-sessions"} className={"btn btn-primary"}>
            Crear Session
          </Link>
        </div>
      </div>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">date</th>
            <th scope="col">training plan</th>
          </tr>
        </thead>
        <tbody>
          {/* {Children.toArray(sessionsStates.sessions.map((session)=>{
            return (
                    <tr>
                <td>{session.date}</td>
                <td>{session.training_plan_id}</td>
              </tr> 
            )
          }))} */}
        <tr>
          <td>{"date"}</td>
          <td>{"tp"}</td>
        </tr>

        </tbody>
      </table>
    </div>
  )
}
