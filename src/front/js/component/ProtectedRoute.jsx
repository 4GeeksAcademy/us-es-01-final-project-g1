import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const ProtectedRoute = ({ children }) => {
    const { store } = useContext(Context);

    // Verifica si la sesión ha sido revisada antes de cargar la ruta
    if (!store.hasCheckedSession && store.isSessionExpired) return null;

    // Redirige si la sesión está expirada o si no está autenticado
    // if (!store.isLogin || store.isSessionExpired) {
    //     return <Navigate to="/" />;
    // }

    return children;
}