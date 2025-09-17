import styles from './about.module.css';

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>About Aqua Alert</h1>
        <p className={styles.slogan}>From Prediction to Protection</p>
      </header>

      <section className={styles.section}>
        <h2>Our Mission</h2>
        <p>
          Floods are one of the most destructive natural disasters, and their frequency is increasing. Our mission at Aqua Alert is to leverage the power of machine learning and real-time data to provide timely and accurate flood risk predictions. We aim to empower communities, local authorities, and individuals with the actionable insights they need to prepare effectively, mitigate damage, and save lives.
        </p>
      </section>

      <section className={styles.section}>
        <h2>How It Works</h2>
        <p>
          Aqua Alert uses a sophisticated Random Forest model, a proven machine learning algorithm, trained on years of historical weather and flood data. Our system fetches current, location-specific weather conditions—like temperature, humidity, and rainfall—and combines them with user-provided data, such as current river levels. This information is processed by our model to generate a clear, probabilistic assessment of the immediate flood risk.
        </p>
      </section>

      <section className={styles.section}>
        <h2>The Technology</h2>
        <p>
          This application is built with a modern, hybrid tech stack to ensure performance and reliability:
        </p>
        <ul className={styles.techList}>
          <li>**Frontend:** Next.js (React)</li>
          <li>**Backend API:** Node.js with Express.js</li>
          <li>**ML Microservice:** Python with Flask & Scikit-learn</li>
          <li>**Data Source:** Open-Meteo Weather API</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>The Team</h2>
        <p>
          Aqua Alert was developed by Nishant and S. S. Saikumar, dedicated student developers passionate about using technology to solve real-world problems. This project was created under the guidance of Assistant Professor Nithya M R.
        </p>
      </section>

      <section className={`${styles.section} ${styles.disclaimer}`}>
        <h2>Disclaimer</h2>
        <p>
          Aqua Alert is a student project and proof of concept. The predictions generated are for informational purposes only and should not be used for making critical safety decisions. Please refer to official government and meteorological agency warnings during any potential flood event.
        </p>
      </section>
    </main>
  );
}