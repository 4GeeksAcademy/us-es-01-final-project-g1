import React, { useContext } from 'react'
import { Context } from '../store/appContext.js'
import { CardInfo } from '../component/CardInfo.jsx'
import { CardIndicator } from '../component/CardIndicator.jsx'
import "../../styles/dashboard.css"
import { Link } from 'react-router-dom'


export const Dashboard = () => {
  const { store, } = useContext(Context)


  return (
    <main>
      <div className='main-overview'>
        <div className='overview-cardIndicator'>
          <CardIndicator value={store?.trainingPlans?.results?.length ?? "0"} description={"Planes de Ejercicio"} section={"planCount"} />
        </div>
        {/* <div className='overview-cardIndicator'>
          <CardIndicator value={"mariana"} description={"Cantidad de Miembros"} section={"membersCount"} />
        </div>
        <div className='overview-cardIndicator'>
          <CardIndicator value={"mariana"} description={"Tiempo aproximado por ejercicio"} section={"timeCount"} />
        </div>
        <div className='overview-cardIndicator'>
          <CardIndicator value={"mariana"} description={"Metas Alcanzadas"} section={"percentageGoal"} />
        </div> */}
      </div>
      <div className='main-cards'>

        {store?.trainingPlans?.results?.length ? (

          <div className='cardx'><CardInfo title={"Planes de Ejercicio"} subtitle={"Los Mejores planes de Ejercicios"} description={"Aqui puedes encontrar un plan que se adapte a tus necesidades"} /></div>
        ) : (<div style={{ color: "white" }}>Crea tu Primer Plan de Ejercicio <Link to={"/create-plan"}>aqui</Link></div>)}
        {/* <div className='cardx'><CardInfo title={"titulo modelo2"} subtitle={"algun mensaje motivador2"} description={"algun mensaje"} /></div> */}
        {/* <div className='cardx'><CardInfo title={"titulo modelo3"} subtitle={"algun mensaje motivador3"} description={"algun mensaje"} /></div> */}
        {/* <div className='cardx'><CardInfo title={"titulo modelo3"} subtitle={"algun mensaje motivador4"} description={"algun mensaje"} /></div> */}
      </div>
    </main>
  )
}
