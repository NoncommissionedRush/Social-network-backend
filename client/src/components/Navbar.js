import React from "react";

function Navbar() {
  return (
    <nav className="navbar bg-dark">
      <h1>
        <a href="dashboard.html">Nadpis</a>
      </h1>
      <ul>
        <li>
          <a href="profiles.html">One</a>
        </li>
        <li>
          <a href="register.html">Two</a>
        </li>
        <li>
          <a href="login.html">Three</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
