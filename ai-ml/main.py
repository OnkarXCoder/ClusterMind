from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ClusterMind AI/ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "ai-ml",
        "name": "ClusterMind AI/ML Service",
        "status": "ok",
        "endpoints": ["/", "/api/health"],
        "note": "The clustering/segmentation ML used by the app runs inside the Node backend at /api/ml/*.",
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ai-ml"}
