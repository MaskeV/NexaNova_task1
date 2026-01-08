import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TrainersPage from "./pages/TrainersPage";
import SubjectsPage from "./pages/SubjectPage";

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/trainers" style={{ marginRight: "15px" }}>Trainers</Link>
        <Link to="/subjects">Subjects</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/trainers" element={<TrainersPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
      </Routes>
    </Router>
  );
}

export default App;



