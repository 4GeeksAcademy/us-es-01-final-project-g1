import React, { useContext, useEffect, useState } from "react"
import { Context } from "../../store/appContext"
import { FaRegEye } from "react-icons/fa"

export const Muscles = () => {

    const { store, } = useContext(Context)
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleViewClick = (muscle) => {
        setSelectedMuscle(muscle);
        setIsVisible(true);
        setIsAnimating(true);        //--> Activa la animación al abrir el modal
    };

    const handleCloseModal = () => {
        setIsAnimating(false);       //--> Desactiva la animación de entrada
        setTimeout(() => {
            setIsVisible(false);     //--> Desmonta el modal despues de la animacien de cierre
            setSelectedMuscle(null); //--> Limpia el musculo seleccionado
        }, 300);
    };




    if (store?.musclesStates?.isMusclesLoading) {
        return (
            <div className="row">
                <h1 style={{ color: "yellow" }}>Loader</h1>
            </div>
        );
    }


    if (store?.musclesStates?.isMusclesLoading) {
        return (
            <div className="row">
                <h1 style={{ color: "yellow" }}>Loader</h1>

            </div>

        )
    }

    return (
        <div className="container mt-2">
            <table className='table table-dark table-striped table-responsive'>
                <thead>
                    <tr>
                        <th scope='col'>Scients Name</th>
                        <th scope='col'>English Name Date</th>
                        <th scope='col'>is Front</th>
                        <th scope='col'></th>
                    </tr>
                </thead>
                <tbody>
                    {store?.musclesStates?.muscles &&
                        store?.musclesStates?.muscles.map((muscle, index) => {
                            return (
                                <tr key={index}>
                                    <td>{muscle?.name}</td>
                                    <td>{muscle?.name_en}</td>
                                    <td>{muscle?.is_front ? "Is front muscle" : "is back muscle"}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning rounded"
                                            onClick={() => handleViewClick(muscle)}
                                        >
                                            <FaRegEye size={"1rem"} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
            {/* Modal */}
            {isVisible && (
                <div className={`modal show d-block`} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className={`modal-content ${isAnimating ? 'slide-in' : 'slide-out'}`}>
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedMuscle.name_en}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}>
                                </button>
                            </div>
                            <div className="modal-body text-center">
                                <img src={`${process.env.BACKEND_URL}${selectedMuscle.image_url_main}`} alt={selectedMuscle.name_en} className="img-fluid" />

                                <p className="mt-3">Scientific name: {selectedMuscle.name}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-sm btn-light" onClick={handleCloseModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}