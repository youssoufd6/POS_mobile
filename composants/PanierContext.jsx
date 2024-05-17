import React, { createContext, useState, useContext } from 'react';

const PanierContext = createContext();

export const PanierProvider = ({ children }) => {
  const [panier, setPanier] = useState({});
  const [categorySelected, setCategorySelected] = useState(null);


  return (
    <PanierContext.Provider value={{ panier, setPanier, categorySelected, setCategorySelected}}>
      {children}
    </PanierContext.Provider>
  );
};

export const usePanier = () => {
  const context = useContext(PanierContext);
  return context;
};
