import { FilterProvider } from './context/FilterContext';
import { DataSourceProvider } from './context/DataSourceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <DataSourceProvider>
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      </DataSourceProvider>
    </ThemeProvider>
  );
}

export default App;
