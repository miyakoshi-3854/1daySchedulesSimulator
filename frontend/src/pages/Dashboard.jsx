// src/pages/DashBoard.jsx (または App.jsx)

import { AuthContextProvider } from '../contexts/AuthContext';
import { DateContextProvider } from '../contexts/DateContext';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import TimeGraph from '../components/TimeGraph';
import ScheduleList from '../components/ScheduleList';
import ScheduleForm from '../components/ScheduleForm';

export default function DashBoard() {
  return (
    // 1. AuthContext が最も外側にあると、全ての子コンポーネントで認証状態が利用可能
    <AuthContextProvider>
      {/* 2. DateContext は認証後にスケジュール機能で利用 */}
      <DateContextProvider>
        <Header /> {/* Header (AuthFormを含む) */}
        <div className="main-content-grid">
          <Calendar />
          <TimeGraph />
          <ScheduleList />
          <ScheduleForm />
        </div>
      </DateContextProvider>
    </AuthContextProvider>
  );
}
