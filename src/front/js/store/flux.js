const initialState = {
	message: null,
	isLogin: false,
	user: {},
	errorMessage: null,
	isLoginLoading: false,
	hasFetchedData: false,
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

	const url = `${process.env.BACKEND_URL}/api/${endpoint}`

	const options = {
		method,
		headers,
		body: body ? JSON.stringify(body) : null,
	};

	try {
		const response = await fetch(url, options);
		const data = await response.json();
		if (!response.ok) {
			return { error: data.message || "An error occurred", data: null, errorMesage: data.msg };
		}
		return { error: null, data };
	} catch (error) {
		return { error: "Network error", data: null };
	}
};

const validateToken = async () => {
	const { error } = await fetchData({ endpoint: "validate-token" });
	console.log("🚀 ~ validateToken ~ error:", error)
	return !error;
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
			login: async (formData, navigate) => {
				setStore({ errorMessage: null, isLoginLoading: true });
				const { error, data } = await fetchData({ endpoint: "login", method: "POST", authToken: false, body: formData, });
				if (error) {
					setStore({ message: error, errorMessage: error, isLoginLoading: false });
					return;
				}
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results));
				setStore({
					isLogin: true,
					user: data?.results,
					message: data.message,
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
					hasFetchedData: false
				});
			},
			isLogin: async () => {
				const authToken = localStorage.getItem("token")
				const user = localStorage.getItem("user")
				if (authToken && user) {
					const isValidToken = await validateToken();
					if (isValidToken) {
						setStore({
							...getStore(),
							isLogin: true,
							user: JSON.parse(user),
							hasFetchedData: true
						});

						getActions().getTrainingPlanExercises();
						getActions().getTrainingPlans();
						getActions().getMuscles();
						getActions().getSessions();
						getActions().getExercises();
						getActions().getSessionExercises();

					} else {
						console.warn("Token no válido. Por favor, vuelve a iniciar sesión.");
						setStore({ isLogin: false, user: {}, message: "Tu sesión ha caducado." });
					}

				} else {
					setStore({ isLogin: false, user: {} });
				}

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
