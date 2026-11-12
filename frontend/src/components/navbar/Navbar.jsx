import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Menu, X, ArrowUpRight } from "lucide-react";
import Button from "../common/Button";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="SkillArena home">
          <span className="brand-mark"><BrainCircuit /></span>
          <span>skill<em>arena</em></span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
          <a href="#platform" onClick={closeMenu}>Platform</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
        </nav>

        <div className="nav-actions">
          <Link className="nav-login" to="/backend-test">API status</Link>
          <Button href="#get-started">Get started <ArrowUpRight size={15} /></Button>
        </div>

        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
