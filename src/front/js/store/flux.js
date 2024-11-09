const initialState = {
	message: null,
	isLogin: false,
	user: {},
	isAdmin: false,
	errorMessage: null,
	isLoginLoading: false,
	trainingPlansStates: {
		trainingPlans: [],
		isTrainingPlansLoading: false,
		currentTrainingPlan: {},
		filter: "",
		action: ""
	},
	sessionsStates: {
		isSessionsLoading: false,
		sessions: [],
	},
	exercisesStates: {
		trainingPlanExercises: [],
		isExercisesLoading: false,
		exercises: []
	}
}

const fetchData = async ({ uri, method = "GET", authToken = null, body = null }) => {
	const headers = {
		"Content-Type": "application/json",
	};
	if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

	const options = {
		method,
		headers,
		body: body ? JSON.stringify(body) : null,
	};

	try {
		const response = await fetch(uri, options);
		const data = await response.json();
		if (!response.ok) {
			return { error: data.message || "An error occurred", data: null };
		}
		return { error: null, data };
	} catch (error) {
		return { error: "Network error", data: null };
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
			login: async (formData, navigate) => {
				setStore({ errorMessage: null, isLoginLoading: true });
				const { error, data } = await fetchData({
					uri: `${process.env.BACKEND_URL}/api/login`,
					method: "POST",
					body: formData,
				});
				if (error) setStore({ message: error, errorMessage: error, isLoginLoading: false, });
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results));
				setStore({
					isLogin: true,
					isAdmin: data?.results?.is_admin,
					user: data?.results,
					message: data.message,
					isLoginLoading: false,
				});
				navigate("/dashboard");
			},
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setStore({ isLogin: false, isAdmin: false, user: {}, message: null, errorMessage: null, });
			},
			isLogin: () => {
				const authToken = localStorage.getItem("token")
				const user = localStorage.getItem("user")

				if (authToken && user) {
					setStore({ ...getStore(), isLogin: true, user: JSON.parse(user) });
					getActions().getTrainingPlans();
					getActions().getSessions();
					getActions().getExercises();
					getActions().getTrainingPlanExercises();
				} else {
					setStore({ isLogin: false, user: {}, isAdmin: false });
				}

			},
			register: async (formData, navigate) => {
				setStore({ errorMessage: null, isLoginLoading: true });
				const { error, data } = await fetchData({
					uri: `${process.env.BACKEND_URL}/api/register`,
					method: "POST",
					body: formData,
				});
				if (error) setStore({ errorMessage: error, message: error, isLoginLoading: false });
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results));
				setStore({
					isLogin: true,
					isAdmin: data.results.is_admin,
					user: data.results,
					message: data.message,
					isLoginLoading: false,
				});
				navigate("/dashboard");
			},
			// trainingPlans
			getTrainingPlans: async () => {
				const uri = `${process.env.BACKEND_URL}/api/training-plans`
				const authToken = localStorage.getItem("token")
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					}
				}
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: true } })
				const response = await fetch(uri, options)
				const trainingPlans = await response.json()
				if (!response.ok) {
					setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: false } })
					return
				}
				setStore({
					...getStore(),
					trainingPlansStates: {
						...getStore().trainingPlansStates,
						trainingPlansCount: trainingPlans.results.length,
						trainingPlans: trainingPlans.results,
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
					setStore({ errorMessage: data.message, message: data.message, })
				}

				getActions().getTrainingPlanExercises()
				getActions().getTrainingPlans()
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, isTrainingPlansLoading: false } })
				navigate("/training-plan")
				return response
			},
			setTrainingPlansFilters: (filter) => {
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, filter: filter } })
			},
			//Sessions
			getSessions: async () => {
				const uri = `${process.env.BACKEND_URL}/api/sessions`
				const authToken = localStorage.getItem("token")
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					}
				}
				setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: true } })
				const response = await fetch(uri, options)
				const sessions = await response.json()
				console.log("🚀 ~ getSessions: ~ sessions:", sessions)
				if (!response.ok) {
					setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: false } })
				}
				setStore({
					...getStore(),
					sessionsStates: {
						...getStore().sessionsStates,
						sessions: [...sessions.results],
						isSessionsLoading: false
					}
				})

			},
			createSessions: async ({ formData, navigate, }) => {
				const uri = `${process.env.BACKEND_URL}/api/sessions`
				const authToken = localStorage.getItem("token")
				const options = {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					},
					body: JSON.stringify(formData),
				}
				setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionsLoading: true } })
				const response = await fetch(uri, options)
				const data = await response.json()
				if (!response.ok) {
					return setStore({
						...getStore(),
						errorMessage: data.message,
						message: data.message,
						sessionsStates: {
							isSessionsLoading: false
						}
					})
				}

				setStore({
					...getStore(),
					message: data.message,
				})
				getActions().getSessions()
				setStore({
					...getStore(),
					sessionsStates: {
						...getStore().sessionsStates,
						isSessionsLoading: true
					}
				})
				navigate("/sessions")
				return response
			},
			setTrainingPlanExercises: async (formData, navigate, update) => {
				const uri = `${process.env.BACKEND_URL}/api/training-exercises`
				const authToken = localStorage.getItem("token")

				const options = {
					method: update ? 'PUT' : 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					},
					body: JSON.stringify(formData),
				}
				const response = await fetch(uri, options)
				const data = await response.json()

				if (!response.ok) {
					return setStore({ errorMessage: data.message, message: data.message, })
				}
				getActions().getTrainingPlans()
				getActions().getTrainingPlanExercises()
				navigate("/training-plan")
				return response
			},
			//Exercises
			getTrainingPlanExercises: async () => {
				const uri = `${process.env.BACKEND_URL}/api/training-exercises`
				const authToken = localStorage.getItem("token")
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: ` Bearer ${authToken}`
					}
				}
				// setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: true } })
				const response = await fetch(uri, options)
				const exercises = await response.json()
				if (!response.ok) {
					// setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: false } })
					return
				}


				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						trainingPlanExercises: exercises.results,
						// isExercisesLoading: false
					}
				})

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
				const uri = `${process.env.BACKEND_URL}/api/exercises`
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
				const exercises = await response.json()
				if (!response.ok) {
					setStore({ ...getStore(), exercisesStates: { ...getStore().exercisesStates, isExercisesLoading: false } })
					return
				}
				setStore({
					...getStore(),
					exercisesStates: {
						...getStore().exercisesStates,
						exercises: exercises.results,
						isExercisesLoading: false
					}
				})

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
				console.log("test", test)
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
