const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			isLogin: false,
			user: {},
			isAdmin: false,
			errorMessage: null,
			trainingPlans: {},
			isTrainingPlansLoading: false,
			currentTrainingPlan: {},
			action: ""
		},
		actions: {
			resetState: () => {
				return setStore({
					message: null,
					isLogin: false,
					user: {},
					isAdmin: false,
					errorMessage: null,
					trainingPlans: {},
					isTrainingPlansLoading: false
				})
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
				setStore({ isLogin: true, isAdmin: data?.results?.is_admin, user: data?.results, message: data.message })
				navigate('/dashboard')
			},
			logout: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setStore({ isLogin: false, isAdmin: false, user: {}, message: "null", errorMessage: null, });
			},
			isLogin: () => {
				const authToken = localStorage.getItem("token")
				const user = localStorage.getItem("user")

				if (Boolean(authToken) && Boolean(user)) {
					setStore({ isLogin: true, })
					return getActions().getTrainingPlans();
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
			setAction: (action) => {
				setStore({ ...getStore(), action })
			},
			getCurrentTrainingPlan: (plan) => {
				setStore({ ...getStore(), currentTrainingPlan: plan })
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
					return alert(data.message)
				}
				console.log("data adentro de crudTr", data)
				setStore({ ...getStore(), message: data.message })
				navigate("/training-plan")

				return response
			},
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
				setStore({ ...getStore(), isTrainingPlansLoading: true })
				const response = await fetch(uri, options)
				const trainingPlans = await response.json()
				if (!response.ok) {
					setStore({ ...getStore(), isTrainingPlansLoading: false })
					return
				}

				setStore({
					...getStore(),
					trainingPlans,
					isTrainingPlansLoading: false
				})
			}
		}
	};
};

export default getState;
