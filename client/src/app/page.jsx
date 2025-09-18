import styles from './page.module.css';
import InputForm from './components/InputForm/InputForm';
// We have removed the ChartDisplay import

export default function HomePage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Flood Prediction Dashboard</h1>
        <p>Enter real-time data to predict flood risk</p>
      </header>
      
      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <InputForm />
        </div>
        {/* The chart section has been removed from this page */}
      </div>
    </main>
  );
}