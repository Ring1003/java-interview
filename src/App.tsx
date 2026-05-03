import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/:category" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
