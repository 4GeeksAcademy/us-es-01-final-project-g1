import React, { Children, useContext, useEffect, useState } from 'react';
import { Context } from '../../store/appContext';

export const TrainingExercises = () => {
  const { store, actions } = useContext(Context);


    return (
        <h1 style={{ color: "yellow" }}>Formulario para Actualizar los Ejercicios en la tabla de TP</h1>
    )

}