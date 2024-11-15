const initialState = {
	message: null,
	isLogin: false,
	user: {},
	errorMessage: null,
	isLoginLoading: false,
	hasFetchedData: false,
	isSessionExpired: false,
	hasCheckedSession: false,
	trainingPlansStates: {
		trainingPlans: [],
		isTrainingPlansLoading: false,
		currentTrainingPlan: {},
		action: ""
	},
	sessionsStates: {
		isSessionsLoading: false,
		sessions: [],
	},
	exercisesStates: {
		exercises: [],
		isExercisesLoading: false,
		isSessionExercisesLoading: false,
		sessionExercises: [],
		trainingPlanExercises: [],
	},
	musclesStates: {
		isMusclesLoading: false,
		muscles: []
	}
}

const fetchData = async ({ endpoint, method = "GET", authToken = true, body = null }) => {
	const headers = {
		"Content-Type": "application/json",
	};

	if (authToken) {
		const token = localStorage.getItem("token");
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}

	const url = `${process.env.BACKEND_URL}/api/${endpoint}`;

	try {
		const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });

		if (response.status === 401) {
			getActions().logout(); // Limpiar estado y localStorage
			getActions().setSessionExpired(); // Actualizar el estado para el modal
			return { error: "Sesión expirada. Por favor, vuelve a iniciar sesión.", data: null };
		}

		const data = await response.json();

		if (!response.ok) {
			return { error: data.message || "Ocurrió un error.", data: null };
		}

		return { error: null, data };
	} catch (error) {
		return { error: "Error de red.", data: null };
	}
};


const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: { ...initialState },
		actions: {
			checkMount: () => {
				console.log("monte mi contexto, esto quiere decir que solo se montara una vez y no volvera a tener lectura en el dashboard")
			},
			resetState: () => {
				return setStore({ ...initialState })
			},
			setSessionExpired: () => {
				setStore({ isSessionExpired: true });
			},
			loadInitialData: async () => {
				getActions().getTrainingPlanExercises();
				getActions().getTrainingPlans();
				getActions().getMuscles();
				getActions().getSessions();
				getActions().getExercises();
				getActions().getSessionExercises();
				setStore({
					...getStore(),
					hasFetchedData: true,
				});
			},
			login: async (formData, navigate) => {
				setStore({ errorMessage: null, isLoginLoading: true });
				const { error, data } = await fetchData({ endpoint: "login", method: "POST", authToken: false, body: formData, });
				console.log("🚀 ~ login: ~ data:", data)
				if (error) {
					setStore({ message: error, errorMessage: error, isLoginLoading: false });
					return;
				}
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results));
				setStore({
					isLogin: true,
					user: data?.results,
					message: data?.message,
					isLoginLoading: false,
				});
				navigate("/dashboard");
			},
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setStore({
					isLogin: false,
					user: {},
					message: null,
					errorMessage: null,
					hasFetchedData: false,
					isSessionExpired: false,
				});
			},
			isLogin: async () => {
				const token = localStorage.getItem("token");
				if (!token) {
					setStore({ isLogin: false, hasCheckedSession: true });
					return;
				}

				const { error } = await fetchData({ endpoint: "validate-token", authToken: true });
				if (error) {
					setStore({ isLogin: false, isSessionExpired: true, hasCheckedSession: true });
					return;
				}

				setStore({ isLogin: true, hasCheckedSession: true });
				getActions().loadInitialData();
			},
			register: async (formData, navigate) => {
				setStore({ errorMessage: null, isLoginLoading: true });
				const { error, data } = await fetchData({ endpoint: "register", method: "POST", authToken: false, body: formData, });
				if (error) {
					setStore({ errorMessage: error, message: error, isLoginLoading: false });
					return;
				}
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results));
				setStore({
					isLogin: true,
					user: data.results,
					message: data.message,
					isLoginLoading: false,
				});
				navigate("/dashboard");
			},
			getTrainingPlans: async () => {
				const { isSessionExpired } = getStore();
				if (isSessionExpired) return;
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: true } })
				const { error, data } = await fetchData({ endpoint: "training-plans", method: "GET" });
				if (error) {
					setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: false } });
					return;
				}
				setStore({
					...getStore(),
					trainingPlansStates: {
						...getStore().trainingPlansStates,
						trainingPlansCount: data.results.length,
						trainingPlans: data.results,
						isTrainingPlansLoading: false
					}
				})
			},
			getCurrentTrainingPlan: (plan) => {
				setStore({
					...getStore(),
					trainingPlansStates: {
						...getStore().trainingPlansStates,
						currentTrainingPlan: plan
					}
				})
			},
			setAction: (action) => {
				setStore({
					...getStore(),
					trainingPlansStates: {
						...getStore().trainingPlansStates,
						action
					}
				})
			},
			crudTrainingPlans: async ({ formData, navigate, currentPlanId, action }) => {
				const method = {
					create: "POST",
					edit: "PUT",
					delete: "DELETE"
				}
				const uri = `${process.env.BACKEND_URL}/api/training-plans${action !== "create" ? `/${currentPlanId}` : ""}`
				const authToken = localStorage.getItem("token")
				const options = {
					method: method[action],
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					},
					body: JSON.stringify(formData),
				}
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: true } })
				const response = await fetch(uri, options)
				const data = await response.json()
				if (!response.ok) {
					setStore({ errorMessage: data.message, message: data.message, trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: false } })
				}

				getActions().getTrainingPlanExercises()
				getActions().getSessionExercises()
				getActions().getTrainingPlans()
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: false } })
				navigate("/training-plan")
				return response
			},
			getSessions: async () => {
				setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: true } });
				const { error, data } = await fetchData({ endpoint: "sessions", method: "GET" });

				if (error) {
					setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: false } });
					return;
				}
				setStore({
					...getStore(),
					sessionsStates: {
						...getStore().sessionsStates,
						sessions: data.results,
						isSessionsLoading: false
					}
				});
			},
			createSessions: async ({ formData, navigate, }) => {
				setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: true } });
				const { error, data } = await fetchData({ endpoint: "sessions", method: "POST", body: formData });
				if (error) {
					setStore({
						...getStore(),
						errorMessage: error,
						message: error,
						sessionsStates: {
							isSessionsLoading: false
						}
					});
					return;
				}
				setStore({ ...getStore(), message: data.message, });

				await getActions().getTrainingPlans();
				await getActions().getSessionExercises();
				await getActions().getSessions();
				await navigate("/sessions");

			},
			setTrainingPlanExercises: async (formData, navigate,) => {
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: true } });
				const { error, data } = await fetchData({ endpoint: "training-exercises", method: "POST", body: formData });
				if (error) {
					setStore({
						...getStore(),
						errorMessage: error,
						message: error,
						exercisesStates: {
							...getStore().exercisesStates,
							isExercisesLoading: false
						}
					});
					return;
				}

				setStore({ ...getStore(), message: data.message });

				await getActions().getTrainingPlanExercises();
				await getActions().getTrainingPlans();
				navigate("/training-plan");
			},
			getTrainingPlanExercises: async () => {
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: true } });
				const { error, data } = await fetchData({ endpoint: "training-exercises", method: "GET" });

				if (error) {
					setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: false } });
					return;
				}
				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						trainingPlanExercises: data.results,
						isExercisesLoading: false
					}
				});
			},
			setLinkedTPE: (tpe) => {
				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						linkedTPE: tpe
					}
				})

			},
			getExercises: async () => {
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: true } });
				const { error, data } = await fetchData({ endpoint: "exercises", method: "GET" });

				if (error) {
					setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: false } });
					return;
				}
				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						exercises: data.results,
						isExercisesLoading: false
					}
				});

			},
			getMuscles: async () => {
				setStore({ ...getStore(), musclesStates: { ...getStore().musclesStates, isMusclesLoading: true } });
				const { error, data } = await fetchData({ endpoint: "muscles", method: "GET" });

				if (error) {
					setStore({ ...getStore(), musclesStates: { ...getStore().musclesStates, isMusclesLoading: false } });
					return;
				}
				setStore({
					...getStore(),
					musclesStates: {
						// ...getStore().musclesStates,
						muscles: data.results,
						isMusclesLoading: false
					}
				});

			},
			getSessionExercises: async () => {
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isSessionExercisesLoading: true } });
				const { error, data } = await fetchData({ endpoint: "session-exercises", });

				if (error) {
					setStore({
						...getStore(),
						errorMessage: error,
						exercisesStates: {
							...getStore().exercisesStates,
							isSessionExercisesLoading: false
						}
					});
					return;
				}

				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						sessionExercises: data.results,
						isSessionExercisesLoading: false
					}
				});

			},
			updateSessionExercises: async (exercisesToUpdate) => {
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isSessionExercisesLoading: true } });

				const { error, data } = await fetchData({
					endpoint: "session-exercises",
					method: "PUT",
					body: { exercises: exercisesToUpdate }  // Pasar todos los ejercicios en un solo request
				});

				if (error) {
					setStore({
						...getStore(),
						errorMessage: error,
						message: error,
						exercisesStates: { ...getStore().exercisesStates, isSessionExercisesLoading: false }
					});
					return;
				}

				// Actualizar el estado con los ejercicios actualizados
				const updatedExercises = data.results.updated || [];
				setStore({
					...getStore(),
					message: data.message,
					exercisesStates: {
						...getStore().exercisesStates,
						sessionExercises: getStore().exercisesStates.sessionExercises.map(exercise => {
							const updatedExercise = updatedExercises.find(e => e.id === exercise.id);
							return updatedExercise ? { ...exercise, ...updatedExercise } : exercise;
						}),
						isSessionExercisesLoading: false
					}
				});


				getActions().getSessionExercises();
				getActions().getSessions();
				getActions().getTrainingPlans();
			},
			getInitial: async () => {
				const uri = `${process.env.BACKEND_URL}/api/initial-setup`
				const authToken = localStorage.getItem("token")
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					}
				}
				setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: true } })
				const response = await fetch(uri, options)
				const test = await response.json()
				// if (!response.ok) {
				// 	setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: false } })
				// 	return
				// }
				// setStore({
				// 	...getStore(),
				// 	exercisesStates: {
				// 		...getStore().exercisesStates,
				// 		exercises: exercises.results,
				// 		isExercisesLoading: false
				// 	}
				// })

			},
		}
	};
};

export default getState;
