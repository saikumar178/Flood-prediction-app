# Flood-prediction-app

/flood-prediction-app/
├── 📂 ml-service/           # The Python & Flask ML Model
│   ├── model.pkl           # Your saved, trained model file
│   ├── app.py              # The Flask server that loads the model
│   └── requirements.txt    # Python dependencies (Flask, Scikit-learn)
│
├── 📂 api-server/           # The main Express.js API
│   ├── src/                # Source code folder
│   │   ├── index.js        # Main server file
│   │   └── routes/         # API routes (e.g., for predictions, charts)
│   ├── package.json        # Node.js dependencies (Express, Axios)
│   └── .env                # Environment variables
│
├── 📂 client/               # The Next.js Frontend
│   ├── pages/              # Your app pages (e.g., index.js dashboard)
│   ├── components/         # Reusable components (Chart, Gauge, Form)
│   └── package.json        # Frontend dependencies (Next, React, Chart.js)
│
├── 📂 data/                 # Your dataset files
│   ├── raw/                # Original, unprocessed data
│   └── processed/          # The final, cleaned CSV for training
│
├── 📂 notebooks/            # Jupyter Notebooks for experiments
│   ├── 1-Data_Exploration.ipynb
│   └── 2-Model_Training.ipynb
│
├── .gitignore              # Tells Git which files to ignore
└── README.md               # The most important file for your team


![alt text](<sys_design.jpg>)
