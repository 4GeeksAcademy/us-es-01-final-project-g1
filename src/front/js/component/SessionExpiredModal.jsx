import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

export const SessionExpiredModal = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (store.isSessionExpired && location.pathname !== "/") {
            Swal.fire({
                title: "Sesión expirada",
                text: "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.",
                icon: "warning",
                confirmButtonText: "Volver a iniciar sesión",
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                debugger
                actions.logout(); // Limpia el estado y localStorages
                navigate("/"); // Redirige al login
            });
        }
    }, [store.isSessionExpired, actions, navigate]);

    return null;
};
