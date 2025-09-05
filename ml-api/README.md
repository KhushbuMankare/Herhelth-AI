# PCOS Prediction FastAPI Service

This FastAPI service provides machine learning predictions for PCOS risk assessment using trained pickle models.

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
cd ml-api
pip install -r requirements.txt
\`\`\`

### 2. Add Your Pickle Files
Place your trained model files in the `models/` directory:
- `models/pcos_model.pkl` - Your trained PCOS prediction model
- `models/scaler.pkl` - Feature scaler (optional)

### 3. Model Requirements
Your pickle model should:
- Accept 41 numerical features (see input schema in main.py)
- Support either `predict()` or `predict_proba()` methods
- Be compatible with scikit-learn format

### 4. Run the Service

#### Development
\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

#### Production with Docker
\`\`\`bash
docker build -t pcos-api .
docker run -p 8000:8000 -v /path/to/your/models:/app/models pcos-api
\`\`\`

### 5. Update Next.js Configuration
Set the FastAPI URL in your environment variables:
\`\`\`bash
# .env.local
FASTAPI_URL=http://localhost:8000
\`\`\`

For production, update this to your deployed FastAPI service URL.

## API Documentation
Once running, visit:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Model Input Features
The API expects these 41 features:
- Basic info: age, weight, height, bmi, blood_group
- Vitals: pulse_rate, rr, hb, bp_systolic, bp_diastolic
- Reproductive: cycle, cycle_length, marriage_status, pregnant, no_of_abortions
- Hormones: i_beta_hcg_1, i_beta_hcg_2, fsh, lh, fsh_lh, tsh, amh, prl
- Body measurements: hip, waist, waist_hip_ratio
- Lab values: vit_d3, prg, rbs
- Symptoms: weight_gain, hair_growth, skin_darkening, hair_loss, pimples
- Lifestyle: fast_food, reg_exercise
- Ultrasound: follicle_no_l, follicle_no_r, avg_f_size_l, avg_f_size_r, endometrium

## Deployment Options
1. **Local Development**: Run with uvicorn
2. **Docker**: Use provided Dockerfile
3. **Cloud Platforms**: Deploy to Heroku, AWS, GCP, or Azure
4. **Vercel**: Not recommended for ML models due to serverless limitations
