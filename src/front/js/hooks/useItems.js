import React from 'react'

export const useItems = () => {

  const detailsPlanLevelDetails = {
    item_1: {onClick: (a)=>{console.log("1b", a)}},
    item_2: {onClick: (a)=>{console.log("2b", a)}},
    item_3: {onClick: (a)=>{console.log("3b", a)}},
  }

  return {detailsPlanLevelDetails}
}
