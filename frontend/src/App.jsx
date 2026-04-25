import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VRViewer from './components/VRViewer';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/destination/:id" element={<VRViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
