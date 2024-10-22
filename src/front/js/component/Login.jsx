import React, { useContext, useState } from "react"
import { Context } from "../store/appContext";


export const Login = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    console.log(actions);
    const handleEmail = (element) => setEmail(element.target.value)
    const handlePassword = (element) => setPassword(element.target.value)
    

    const handleSubmit = (event) => {
      event.preventDefault()
      const data = {email, password}
      actions.login(data)

    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input onChange={handleEmail}  placeholder='email' />
        <input onChange={handlePassword} placeholder='password' />
        <button  type="submit">submit</button>
      </form>
    );
  };
