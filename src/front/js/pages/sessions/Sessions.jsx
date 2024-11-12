import React, { Children, useContext, useEffect, useState } from "react"
import Swal from 'sweetalert2';
import { FaRegTrashCan } from "react-icons/fa6";
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { MdEdit } from "react-icons/md";
import { Context } from '../../store/appContext.js'
import "../../../styles/trainingPlans.css"
import { BannerMessage } from "../../component/BannerMessage.jsx";
import { formatDate } from "../../helper/formatDate.js";
import { SkeletonTable } from "../../component/Loader.jsx";
import "../../../styles/sessions.css"

export const Sessions = () => {
  const { store, } = useContext(Context)
  const { sessionsStates, } = store
  const navigate = useNavigate()




  if (sessionsStates.isSessionsLoading) {
    return (
      <div className={"container mt-5"}>
        <SkeletonTable />
      </div>
    )
  }
  return (
    <div className={"container mt-2"}>
      {/* <BannerMessage variant={"info"} message={"Crea tu Session eligiendo un plan de entrenamiento"} evaluation={true}/> */}
      <div className="sessions-header-container">
        <Link to={"/create-sessions"} className={"btn btn-warning"}>
          Create a Session
        </Link>
      </div>
      {/* <SkeletonTable /> */}
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">Session Name</th>
            <th scope="col">Date</th>
            <th scope="col">Training Plan</th>
          </tr>
        </thead>
        <tbody>
          {sessionsStates.sessions.map((session, index) => {
            return (
              <tr key={index}>
                <td>{session.name}</td>
                <td>{formatDate(session.date)}</td>
                <td>{session.training_plan_name}</td>
              </tr>
            )
          })}


        </tbody>
      </table>
    </div>
  )
}
