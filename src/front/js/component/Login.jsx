import React, { useContext, useState } from "react"
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";


export const Login = () => {
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const handleSubmit = (event) => {
    event.preventDefault()
    const data = { email, password }
    actions.login(data)

  };

  return (
    <div className='container d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <div className='card p-4' style={{ width: '400px' }}>
        <h2 className='text-center mb-4'>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor='email' className='form-label'>
              Email
            </label>
            <input
              type='email'
              className='form-control'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='password' className='form-label'>
              Contraseña
            </label>
            <input
              type='password'
              className='form-control'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' className='btn btn-primary w-100'>
            Ingresar
          </button>
        </form>

        <div className='text-center mt-3'>
          <p>
            ¿No tienes una cuenta? <Link to='/register'>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
