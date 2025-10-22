/*
 * 1dayScheduleSimulator
 * 各コンポーネントのインポートを行い、画面構成を担当する。
 */
import { AuthContextProvider } from '../contexts/AuthContext';
import { DateContextProvider } from '../contexts/DateContext';
import { ScheduleContextProvider } from '../contexts/ScheduleContext';
import { Header } from '../components/Header';
import { Calendar } from '../components/Calendar';
import { TimeGraph } from '../components/TimeGraph';
import { ScheduleList } from '../components/ScheduleList';
import { ScheduleForm } from '../components/ScheduleForm';
import styles from '../styles/Dashboard.module.css';

export default function DashBoard() {
  return (
    <AuthContextProvider>
      <DateContextProvider>
        <ScheduleContextProvider>
          <Header />
          <div className={styles.mainContent}>
            <div className={styles.leftColumn}>
              <Calendar />
            </div>
            <div className={styles.centerColumn}>
              <TimeGraph />
            </div>
            <div className={styles.rightColumn}>
              <ScheduleList />
              <ScheduleForm />
            </div>
          </div>
        </ScheduleContextProvider>
      </DateContextProvider>
    </AuthContextProvider>
  );
}
