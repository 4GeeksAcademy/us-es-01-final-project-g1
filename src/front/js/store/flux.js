const initialState = {
	message: null,
	isLogin: false,
	user: {},
	isAdmin: false,
	errorMessage: null,
	trainingPlansStates: {
		trainingPlans: [],
		isTrainingPlansLoading: false,
		currentTrainingPlan: {},
		filter: "",
		action: ""
	},
	sessionsStates: {
		isSessionStatesIsLoading: false,
		sessions: [],
		filter: "",
		action: ""
	}
}

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: { ...initialState },
		actions: {
			checkMount: ()=>{
				console.log("monte mi contexto, esto quiere decir que solo se montara una vez y no volvera a tener lectura en el dashboard")
			},
			resetState: () => {
				return setStore({ ...initialState })
			},
			login: async (formdata, navigate) => {
				setStore({ errorMessage: null, })
				const uri = `${process.env.BACKEND_URL}/api/login`
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formdata),
				};
				const response = await fetch(uri, options);
				const data = await response.json()
				if (!response.ok) {
					setStore({ message: data.message, errorMessage: data.message })
					return alert(data.message)
				}

				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results))
				setStore({
					isLogin: true,
					isAdmin: data?.results?.is_admin,
					user: data?.results,
					message: data.message
				})
				navigate('/dashboard')
			},
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setStore({ isLogin: false, isAdmin: false, user: {}, message: null, errorMessage: null, });
			},
			isLogin: () => {
				const authToken = localStorage.getItem("token")
				const user = localStorage.getItem("user")

				if (Boolean(authToken) && Boolean(user)) {
					setStore({ ...getStore(), isLogin: true, })
					getActions().getTrainingPlans();
					getActions().getSessions();
				}

			},
			register: async (formdata, navigate) => {
				setStore({ errorMessage: null, })
				const uri = `${process.env.BACKEND_URL}/api/register`
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formdata),
				};
				const response = await fetch(uri, options);
				const data = await response.json()
				if (!response.ok) {
					setStore({ errorMessage: data.message, message: data.message, })
					return alert(data.message)
				}
				localStorage.setItem("token", data.access_token);
				localStorage.setItem("user", JSON.stringify(data.results))
				setStore({ isLogin: true, isAdmin: data.results.is_admin, user: data.results, message: data.message })
				navigate('/dashboard')
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
				const response = await fetch(uri, options)
				const data = await response.json()
				if (!response.ok) {
					setStore({ errorMessage: data.message, message: data.message, })
				}
				if (action === "delete") {
					getActions().getTrainingPlans()
				}

				setStore({
					...getStore(),
					message: data.message,
					trainingPlansStates: {
						...getStore().trainingPlansStates,
						filter: ""
					}
				})
				navigate("/training-plan")
				return response
			},
			setTrainingPlansFilters: (filter) => {
				setStore({ ...getStore(), trainingPlansStates: { ...getStore().trainingPlansStates, filter: filter } })
			},
			//sessionAlgo
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
				setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionStatesIsLoading: true } })
				const response = await fetch(uri, options)
				const sessions = await response.json()
				if (!response.ok) {
					setStore({ ...getStore(), sessionsStates: { ...getStore().sessionsStates, isSessionStatesIsLoading: false } })
					return
				}
				setStore({
					...getStore(),
					sessionsStates: {
						...getStore().sessionsStates,
						sessions: sessions.results,
						isSessionStatesIsLoading: false
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
				const response = await fetch(uri, options)
				const data = await response.json()
				if (!response.ok) {
					setStore({ errorMessage: data.message, message: data.message, })
				}


				setStore({
					...getStore(),
					message: data.message,
					sessionsStates: {
						...getStore().sessionsStates,
					}
				})
				navigate("/sessions")
				return response
			},
		}
	};
};

export default getState;
