import React, { createContext, useState, useContext } from 'react';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
const [menuActive, setMenuActive] = useState(false);

  return (
    <MenuContext.Provider value={{ menuActive, setMenuActive }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  return context;
};
