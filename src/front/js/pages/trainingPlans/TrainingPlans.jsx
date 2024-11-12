import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { FaInfo } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { MdEdit } from 'react-icons/md';
import { Context } from '../../store/appContext.js';
import { BannerMessage } from '../../component/BannerMessage.jsx';
import { Filters } from '../../component/Filters.jsx';
import { formatDate } from '../../helper/formatDate.js';
import { AddTrainingExercises, TrainingExercises } from './TrainingExercises.jsx';
import '../../../styles/trainingPlans.css';
import { SkeletonTable } from '../../component/Loader.jsx';

export const TrainingPlans = () => {
  const [linInitialExercise, setLinInitialExercise] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");

  const { store, actions } = useContext(Context);
  const { trainingPlansStates, exercisesStates } = store;
  const { trainingPlans, isTrainingPlansLoading, } = trainingPlansStates;
  const { isExercisesLoading } = exercisesStates

  const navigate = useNavigate();

  const filteredPlans = trainingPlans.filter(plan => filter ? plan.level === filter : true);

  const filterOptions = [
    { label: "Begginers", value: "begginer" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" }
  ];


  const crud = (plan, action) => {
    actions.getCurrentTrainingPlan(plan);
    actions.setAction(action);
    if (action === 'edit') {
      return navigate('/update-plan');
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff5733',
      cancelButtonColor: '#d3c7bb',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        actions.crudTrainingPlans({
          formData: plan,
          navigate,
          currentPlanId: plan.id,
          action: 'delete'
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Training Plan has been deleted.',
          icon: 'success',
          confirmButtonText: "Close",
          confirmButtonColor: '#ff5733',
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Your Training Plan is safe :)",
          icon: "error",
          confirmButtonText: "Close",
          confirmButtonColor: '#ff5733',
        });
      }
    });
  };

  const linkInitialExercise = (id) => {
    setLinInitialExercise(id);
    setShowForm(true)
  };

  const Message = () => <div className='infoMessage'><FaInfo /> You can add your exercises directly from the table or when creating a new training plan.</div>

  if (isTrainingPlansLoading && isExercisesLoading) {
    return (
      <div className={'container mt-5'}>
        <SkeletonTable />
      </div>
    );
  }
  return (
    <div className={'container mt-2'}>
      <BannerMessage
        variant={'info'}
        message={<Message />}
        evaluation={true}
      />
      <Filters options={filterOptions} onFilterChange={setFilter} />
      <table className='table table-dark table-striped table-responsive'>
        <thead>
          <tr>
            <th scope='col'>Name</th>
            <th scope='col'>Registration Date</th>
            <th scope='col'>Finalization Date</th>
            <th scope='col'># Session</th>
            <th scope='col'>Level</th>
            <th scope='col'>Exercises</th>
            <th scope='col'></th>
          </tr>
        </thead>
        <tbody>
          {trainingPlans &&
            (Boolean(filter) ? filteredPlans : trainingPlans)?.map((trainingPlan, index) => {
              return (
                <tr key={index}>
                  <td>{trainingPlan?.name}</td>
                  <td>{formatDate(trainingPlan?.registration_date)}</td>
                  <td>{formatDate(trainingPlan?.finalization_date)}</td>
                  <td>{trainingPlan?.quantity_session}</td>
                  <td>{trainingPlan?.level}</td>
                  <td style={{ position: "relative" }}>
                    <AddTrainingExercises
                      trainingPlan={trainingPlan}
                      onClick={() => linkInitialExercise(trainingPlan.id)}
                      showForm={showForm}
                    />
                    <TrainingExercises
                      showForm={showForm}
                      setShowForm={setShowForm}
                      linInitialExercise={linInitialExercise}
                      tpId={trainingPlan?.id}
                    />

                  </td>
                  <td>
                    <div className='d-flex gap-2'>
                      <div className='btn btn-sm btn-warning rounded' onClick={() => crud(trainingPlan, 'edit')} style={{
                        padding: "0.25rem 0.5rem", fontSize: ".75rem"
                      }}>
                        <MdEdit size={'1.125rem'} />
                      </div>
                      <div className='btn btn-sm btn-secondary rounded'>
                        <FaRegTrashCan size={'1.125rem'} onClick={() => crud(trainingPlan, 'delete')} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};
