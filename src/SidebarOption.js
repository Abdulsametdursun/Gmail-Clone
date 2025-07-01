import React from 'react';
import './SidebarOption.css';
import { useHistory, useLocation } from 'react-router-dom';

function SidebarOption({ Icon, title, number, path, onClick, nested, collapsed }) {
  const history = useHistory();
  const location = useLocation();

  const selected =
    path && (location.pathname === path || (path === '/' && location.pathname === '/'));

  return (
    <div
      className={`sidebarOption ${selected ? 'sidebarOption--active' : ''} ${
        nested ? 'sidebarOption--nested' : ''
      } ${collapsed ? 'collapsed' : ''}`}
      onClick={() => {
        if (onClick) onClick();
        if (path) history.push(path);
      }}
    >
      <Icon />
      <h3>{title}</h3>
      {number > 0 && <p>{number}</p>}
    </div>
  );
}

export default SidebarOption;
