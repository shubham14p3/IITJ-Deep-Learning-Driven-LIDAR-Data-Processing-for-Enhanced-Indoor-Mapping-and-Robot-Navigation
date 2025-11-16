# EV Charging Station Demand Forecasting
EV Charging Station Demand Forecasting

[![Contributors][contributors-shield]][contributors-url]  
[![Forks][forks-shield]][forks-url]  
[![Stargazers][stars-shield]][stars-url]  
![Issues][issues-shield]

---

## Overview

This project focuses on Forecast electricity consumption and session demand for Electric Vehicle (EV) charging stations using advanced time series modeling. This assists operators in optimizing load distribution and future planning.

---

## Requirements
- **Python 3.10+**
- **Node.js 18+**
- **Flask** for backend
- **React.js** for frontend
- **Redux Toolkit** for state management
- **Material-UI** for UI components

---

## Live Project Links
- **UI:** [http://51.20.36.32:5173/login/](http://51.20.36.32:5173/)
- **Backend:** [http://51.20.36.32:8000/raw](http://51.20.36.32:8000/)

User Name : **admin** || Password: **admin**  (Default)
---
## Reports
- [Download the report (PDF)](assets/ProjectReport.pdf)
- [Download the report (Word)](assets/ProjectReport.docx)
- [Download the AI report](assets/AIReport.pdf)
- [Download the Similarity report](assets/SimilarityReport.pdf)

## Setup Instructions

### Backend Setup

#### Step 1: Create and Activate Python Virtual Environment

1. **Create a Virtual Environment**:
    ```bash
    python3.10 -m venv veenv
    ```

2. **Activate Virtual Environment**:
   - **Command Prompt**:
     ```bash
     venv\Scripts\activate
     ```
   - **PowerShell**:
     ```bash
     .\venv\Scripts\Activate
     ```
   - **Git Bash**:
     ```bash
     source venv/Scripts/activate
     ```

# Install requirements
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

#### Step 2: Install Python Dependencies
Install the required Python packages using the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

#### Step 3: Run the uvicorn Backend
Start the Uvicorn app:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

---

### Frontend Setup

#### Step 1: Install Node.js Dependencies
Navigate to the project root directory and install the required packages:
```bash
npm install
```

#### Step 2: Run the Frontend Application
Start the development server:
```bash
npm run dev
```

---

## Folder Structure
```
project-root/
├── backend/                # Backend code
│   ├── app.py              # App
│   ├── data/               # Dataset folder
│   ├── requirements.txt    # Python dependencies
├── src/                    # Frontend React code
│   ├── libs/               # React components
│   ├── pages/              # Layout components
│   ├── App.jsx             # Main application file
│   ├── main.jsx            # Entry point for React
├── assets/                 # Static assets
├── README.md               # Project documentation
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
```
---

## Features

### Backend
- **uvicorn API** for data processing and machine learning predictions.
- **Endpoints** for:
  • /ingest-json: Flatten and save ACN JSON.
  • /clean: Aggregate and clean data.
  • /diagnostics: Generate ACF/PACF for parameter tuning.
  • /forecast: Run SARIMAX forecast with auto grid.
  • /download/forecast.csv: Download forecast results


### Frontend
- **React.js** for building the user interface.
- **Material-UI** for responsive and modern design.
- **Redux Toolkit** for state management.
- **Features**:
  - Login and authentication.
  - Data analysis, cleaning, and visualization.
  - Machine learning model selection and prediction.

---

## Screenshots

### Login Screen
![Login Screen](assets/1.jpg)

### Intro Screen 
![Intro Screen](assets/2.jpg)
![Intro Screen](assets/22.jpg)

### Raw Data
![Raw Data](assets/3.jpg)

### Raw Data Filling
![Raw Data Filling](assets/4.jpg)

### Cleaning
![Cleaning](assets/5.jpg)
![Cleaning](assets/55.jpg)

### Prediction / Forcasting
![Prediction / Forcasting](assets/7.jpg)

### Explaination of Project
![Explaination](assets/8.jpg)

### AWS Hosting
![AWS](assets/10.jpg)
![AWS](assets/11.jpg)

---

# Model Evaluation Summary


## Conclusion

 Model Evaluation – Understanding the Metrics

- MAE (Mean Absolute Error): Measures the average magnitude of errors between predicted and actual values, without considering direction. Lower MAE means predictions are closer to true values.

- RMSE (Root Mean Squared Error): Penalizes larger errors more heavily. It’s useful when you care more about large deviations. Smaller RMSE implies more stable forecasts.

- MAPE (Mean Absolute Percentage Error): Expresses errors as a percentage of actual values, making it easier to interpret accuracy in real-world terms (e.g., “Our forecast is 92% accurate”).

- These metrics are shown next to forecast plots to help users visually and statistically evaluate model performance.

---



### Frontend
- **React.js**
- **Redux Toolkit**
- **Material-UI**
- **Chart.js** for visualizations
- **JSPDF** for PDF Download

---

## Authors

👤 **Shubham Raj**  
- GitHub: [@ShubhamRaj](https://github.com/shubham14p3)  
- LinkedIn: [Shubham Raj](https://www.linkedin.com/in/shubham14p3/)

---

## Contributions

Feel free to contribute by creating pull requests or submitting issues. Suggestions for improving data processing methods, adding more visualizations, or optimizing the application are welcome.

---

## Show Your Support

Give a ⭐ if you like this project!

---

## Acknowledgments

- Supported by [IIT Jodhpur](https://www.iitj.ac.in/).

---

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting.svg?style=flat-square
[contributors-url]: https://github.com/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting.svg?style=flat-square
[forks-url]: https://github.com/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting/network/members
[stars-shield]: https://img.shields.io/github/stars/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting.svg?style=flat-square
[stars-url]: https://github.com/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting/stargazers
[issues-shield]: https://img.shields.io/github/issues/shubham14p3/IITJ-EV-Charging-Station-Demand-Forecasting.svg?style=flat-square
