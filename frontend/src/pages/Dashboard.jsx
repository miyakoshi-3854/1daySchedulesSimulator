import { AuthContextProvider } from '../contexts/AuthContext';
import { DateContextProvider } from '../contexts/DateContext';
import { ScheduleContextProvider } from '../contexts/ScheduleContext';
import { Header } from '../components/Header';
// import Calendar from '../components/Calendar';
// import TimeGraph from '../components/TimeGraph';
// import ScheduleList from '../components/ScheduleList';
// import ScheduleForm from '../components/ScheduleForm';

export default function DashBoard() {
  return (
    <AuthContextProvider>
      <DateContextProvider>
        <ScheduleContextProvider>
          <Header />
          {/* <Calendar />
          <TimeGraph />
          <ScheduleList />
          <ScheduleForm /> */}
        </ScheduleContextProvider>
      </DateContextProvider>
    </AuthContextProvider>
  );
}
