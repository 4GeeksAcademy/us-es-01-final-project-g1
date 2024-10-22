import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext.js";
import rigoImageUrl from "../../img/rigo-baby.jpg";
import "../../styles/home.css";
import { Login } from "../component/Login.jsx";



export const Home = () => {
	const { store, actions } = useContext(Context);
	const options = {
		method: 'GET'
	  }
	useEffect(()=>{
		const algo = async () => {
		   const response = await fetch("/hello", options)
		};
		algo()
		
	  },[])
    return <Login/>
	return (
		<div className="text-center mt-5">
			<h1>Hello Rigo!!</h1>
			<p>
				<img src={rigoImageUrl} />
			</p>
			<div className="alert alert-info">
				{store.message || "Loading message from the backend (make sure your python backend is running)..."}
			</div>
			<p>
				This boilerplate comes with lots of documentation:{" "}
				<a href="https://start.4geeksacademy.com/starters/react-flask">
					Read documentation
				</a>
			</p>
		</div>
	);
};
