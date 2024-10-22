import React, { useContext, useState } from "react"
import { Context } from "../store/appContext";


export const Login = () => {
    const { store, actions } = useContext(Context);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("")
    console.log(actions);
    const handleName = (element) => setName(element.target.value)
    const handlePassword = (element) => setPassword(element.target.value)
    

    const handleSubmit = async (element) => {
      actions.login()
    };
  
    return (
      <form>
        <input onChange={handleName}  placeholder='name' />
        <input onChange={handlePassword} placeholder='password' />
        <button onClick={handleSubmit} type="submit">submit</button>
      </form>
    );
  };
