import { DateProvider } from './contexts/DateContext.jsx';
import { PingTest } from './components/PingTest.jsx';
import './App.css';

function App() {
  return (
    <>
      <DateProvider></DateProvider>
      <PingTest />
    </>
  );
}

export default App;
