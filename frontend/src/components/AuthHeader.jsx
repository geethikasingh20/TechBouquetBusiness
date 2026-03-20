import { Link } from "react-router-dom";
import logoImage from "../assets/logoImage.png";

export default function AuthHeader() {
  return (
    <header className="auth-header">
      <Link to="/" className="auth-logo-link">
        <img src={logoImage} alt="TechBouquet" className="auth-logo" />
      </Link>
    </header>
  );
}
