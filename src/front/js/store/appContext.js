import React, { useState, useEffect } from "react";
import getState from "./flux.js";
import { useNavigate } from "react-router-dom";


// Don't change, here is where we initialize our context, by default it's just going to be null.
export const Context = React.createContext(null);


// This function injects the global store to any view/component where you want to use it, we will inject the context to layout.js, you can see it here:
// https://github.com/4GeeksAcademy/react-hello-webapp/blob/master/src/js/layout.js#L35
const injectContext = PassedComponent => {
	const StoreWrapper = props => {
		// This will be passed as the contenxt value
		const [state, setState] = useState(
			getState({
				getStore: () => state.store,
				getActions: () => state.actions,
				setStore: updatedStore =>
					setState({
						store: Object.assign(state.store, updatedStore),
						actions: { ...state.actions }
					})
			})
		);

		/*
		  EDIT THIS!
		  This function is the equivalent to "window.onLoad", it only runs once on the entire application lifetime
		  you should do your ajax requests or fetch api requests here. Do not use setState() to save data in the
		  store, instead use actions, like this:
		*/
		useEffect(() => {
			console.log("mount context")
			state.actions.isLogin();
			return () => console.log("unmount context")
		}, []);

		useEffect(() => {
			// esto controla si en nuestra app perdemos el estado estando logeados
			if (state.store.isLogin && !state.store.hasFetchedData) {
				state.actions.getTrainingPlans();
				state.actions.getSessions();
				state.actions.getExercises();
				state.actions.getMuscles();
				state.actions.getTrainingPlanExercises();
				setState({
					...state,
					store: {
						...state.store,
						hasFetchedData: true
					}
				});
			}
		}, [state.store.isLogin]);

		// The initial value for the context is not null anymore, but the current state of this component,
		// the context will now have a getStore, getActions and setStore functions available, because they were declared
		// on the state of this component
		return (
			<Context.Provider value={state}>
				<PassedComponent {...props} />
			</Context.Provider>
		);
	};
	return StoreWrapper;
};

export default injectContext;
