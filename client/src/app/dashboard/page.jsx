import ChartDisplay from "../components/ChartDisplay/ChartDisplay";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Weather Dashboard</h1>
      </header>
      <ChartDisplay />
    </main>
  );
}