"""
Brazil Agricultural Data API
============================
FastAPI backend serving CONAB and SECEX data for FarmhandPro dashboards.

Run with: uvicorn main:app --reload --port 8000
Docs at: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
from enum import Enum
import os

from data_service import BrazilAgDataService
from models import (
    BalanceSheetResponse, MonthlyExportsResponse, ProductionResponse,
    MonthlyPricesResponse, ExportsByDestinationResponse, ExportsByPortResponse,
    SoyComplexResponse, DashboardSummaryResponse
)

# =============================================================================
# APP SETUP
# =============================================================================

app = FastAPI(
    title="Brazil Agricultural Data API",
    description="Live data from CONAB and SECEX for agricultural commodities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://farmhandpro.com",
        "https://*.farmhandpro.com",
        "https://*.base44.com",
        "*"  # For development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data service
data_service = BrazilAgDataService()


class Commodity(str, Enum):
    SOYBEANS = "soybeans"
    CORN = "corn"
    SOY_MEAL = "soy_meal"
    SOY_OIL = "soy_oil"
    WHEAT = "wheat"


# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """API info and health check"""
    return {
        "name": "Brazil Agricultural Data API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "dashboard": "/api/v1/dashboard/summary",
            "balance_sheet": "/api/v1/balance-sheet/{commodity}",
            "soy_complex": "/api/v1/soy-complex/balance",
            "exports_monthly": "/api/v1/exports/monthly/{commodity}",
            "exports_destinations": "/api/v1/exports/by-destination/{commodity}",
            "exports_ports": "/api/v1/exports/by-port/{commodity}",
            "production": "/api/v1/production/{commodity}",
            "prices": "/api/v1/prices/{commodity}",
        },
        "data_sources": [
            "CONAB - portaldeinformacoes.conab.gov.br",
            "SECEX/MDIC - comexstat.mdic.gov.br"
        ]
    }


@app.get("/api/v1/dashboard/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary():
    """
    Get ALL data for dashboard in a single request.
    Optimized for initial page load.
    """
    try:
        return await data_service.get_dashboard_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/balance-sheet/{commodity}", response_model=BalanceSheetResponse)
async def get_balance_sheet(
    commodity: Commodity,
    years: int = Query(default=6, ge=1, le=20)
):
    """
    Get supply/demand balance sheet (CONAB Table 14 format).
    Values in Million Metric Tons (MMT).
    """
    try:
        return await data_service.get_balance_sheet(commodity.value, years)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/soy-complex/balance", response_model=SoyComplexResponse)
async def get_soy_complex_balance():
    """
    Get complete soy complex balance (beans + meal + oil).
    Matches CONAB Table 14 exactly - values in 1000 MT.
    """
    try:
        return await data_service.get_soy_complex_balance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/exports/monthly/{commodity}", response_model=MonthlyExportsResponse)
async def get_monthly_exports(
    commodity: Commodity,
    year: int = Query(default=2025, ge=2000, le=2030),
    include_china: bool = Query(default=True)
):
    """
    Get monthly export volumes from SECEX/ComexStat.
    """
    try:
        return await data_service.get_monthly_exports(commodity.value, year, include_china)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/exports/by-destination/{commodity}", response_model=ExportsByDestinationResponse)
async def get_exports_by_destination(
    commodity: Commodity,
    year: int = Query(default=2025),
    top_n: int = Query(default=10, ge=1, le=50)
):
    """Get exports breakdown by destination country."""
    try:
        return await data_service.get_exports_by_destination(commodity.value, year, top_n)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/exports/by-port/{commodity}", response_model=ExportsByPortResponse)
async def get_exports_by_port(
    commodity: Commodity,
    year: int = Query(default=2025)
):
    """Get exports breakdown by Brazilian port."""
    try:
        return await data_service.get_exports_by_port(commodity.value, year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/production/{commodity}", response_model=ProductionResponse)
async def get_production(
    commodity: Commodity,
    years: int = Query(default=10, ge=1, le=50),
    state: Optional[str] = Query(default=None)
):
    """
    Get historical production data from CONAB.
    Includes area, production, and yield.
    """
    try:
        return await data_service.get_production(commodity.value, years, state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/prices/{commodity}", response_model=MonthlyPricesResponse)
async def get_prices(
    commodity: Commodity,
    year: int = Query(default=2025),
    location: Optional[str] = Query(default=None)
):
    """
    Get monthly price data from CONAB.
    Prices in BRL per 60kg bag.
    """
    try:
        return await data_service.get_monthly_prices(commodity.value, year, location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@app.post("/api/v1/admin/refresh")
async def refresh_data(
    background_tasks: BackgroundTasks,
    api_key: str = Query(...)
):
    """Trigger background data refresh (protected)."""
    expected_key = os.environ.get("ADMIN_API_KEY", "farmhandpro-refresh-2025")
    if api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    background_tasks.add_task(data_service.refresh_all)
    return {"status": "refresh_started"}


@app.get("/api/v1/admin/status")
async def get_status():
    """Get cache and data freshness status."""
    return await data_service.get_status()


# =============================================================================
# LIFECYCLE
# =============================================================================

@app.on_event("startup")
async def startup():
    print("🌱 Starting Brazil Ag Data API...")
    await data_service.initialize()
    print("✅ API ready at http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown():
    await data_service.cleanup()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
