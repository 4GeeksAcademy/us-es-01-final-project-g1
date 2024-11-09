import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { MdEdit } from 'react-icons/md';
import { Context } from '../../store/appContext.js';
import '../../../styles/trainingPlans.css';
import { BannerMessage } from '../../component/BannerMessage.jsx';
import { formatDate } from '../../helper/formatDate.js';
import { AddTrainingExercises, TrainingExercises } from './TrainingExercises.jsx';
import { FaInfo } from 'react-icons/fa';

export const TrainingPlans = () => {
  const [linInitialExercise, setLinInitialExercise] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { store, actions } = useContext(Context);
  const { trainingPlansStates } = store;
  const { trainingPlans, isTrainingPlansLoading, filter, currentTrainingPlan } = trainingPlansStates;
  const [filteredPlans, setFilteredPlans] = useState(() => trainingPlans);
  const navigate = useNavigate();


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

  const handleFilter = () => {
    if (filter === 'begginer') {
      return setFilteredPlans(trainingPlans.filter((tp) => tp.level === 'begginer'));
    }

    if (filter === 'intermediate') {
      return setFilteredPlans(trainingPlans.filter((tp) => tp.level === 'intermediate'));
    }

    if (filter === 'advanced') {
      return setFilteredPlans(trainingPlans.filter((tp) => tp.level === 'advanced'));
    }
    return setFilteredPlans(trainingPlans);
  };

  const linkInitialExercise = (id) => {
    setLinInitialExercise(id);
    setShowForm(true)
  };

  const Message = () => <div className='infoMessage'><FaInfo /> You can add your exercises directly from the table or when creating a new training plan.</div>


  useEffect(() => handleFilter(), [filter]);

  if (isTrainingPlansLoading) {
    return (
      <div className={'container mt-2'}>
        <h1 style={{ color: 'yellow' }}>Loader de Tabla</h1>
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
      <div className='trainingPlans-header-container'>
        <div className='trainingPlans-header-filters'>
          <button className={'btn btn-secondary'} onClick={() => actions.setTrainingPlansFilters('begginer')}>
            Begginer
          </button>
          <button className={'btn btn-secondary'} onClick={() => actions.setTrainingPlansFilters('intermediate')}>
            Intermedio
          </button>
          <button className={'btn btn-secondary'} onClick={() => actions.setTrainingPlansFilters('advanced')}>
            Advanced
          </button>
          <button className={'btn btn-danger'} onClick={() => actions.setTrainingPlansFilters('')}>
            Clear Filters
          </button>
        </div>
        <div className={''}>
          <Link to={'/create-plan'} className={'btn btn-warning'}>
            Create Training Plan
          </Link>
        </div>
      </div>
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
                  <td>
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
                      <div className='btn btn-sm btn-warning rounded' onClick={() => crud(trainingPlan, 'edit')}>
                        <MdEdit size={'1.25rem'} />
                      </div>
                      <div className='btn btn-sm btn-secondary rounded'>
                        <FaRegTrashCan size={'1.25rem'} onClick={() => crud(trainingPlan, 'delete')} />
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
