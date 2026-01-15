"""
Pydantic Models for Brazil Agricultural Data API
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


# =============================================================================
# BALANCE SHEET MODELS
# =============================================================================

class BalanceSheetRow(BaseModel):
    """Single row of supply/demand balance sheet"""
    year: str = Field(..., description="Crop year e.g. 2024/25")
    opening_stock: float = Field(..., alias="openingStock", description="Estoque Inicial (MMT)")
    production: float = Field(..., description="Produção (MMT)")
    imports: float = Field(..., description="Importação (MMT)")
    total_supply: Optional[float] = Field(None, alias="totalSupply", description="Suprimento (MMT)")
    consumption: float = Field(..., description="Consumo (MMT)")
    exports: float = Field(..., description="Exportação (MMT)")
    ending_stock: float = Field(..., alias="endingStock", description="Estoque Final (MMT)")
    is_projection: bool = Field(False, alias="isProjection")
    
    class Config:
        populate_by_name = True


class BalanceSheetResponse(BaseModel):
    """Balance sheet API response"""
    success: bool = True
    commodity: str
    unit: str = "MMT"
    source: str = "CONAB"
    last_updated: datetime
    data: List[BalanceSheetRow]


# =============================================================================
# SOY COMPLEX MODELS (Table 14)
# =============================================================================

class SoyComplexRow(BaseModel):
    """Row for soy complex balance (in 1000 MT)"""
    safra: str = Field(..., description="Crop year")
    estoque_inicial: float = Field(..., description="Opening stock (1000 MT)")
    producao: float = Field(..., description="Production (1000 MT)")
    importacao: float = Field(..., description="Imports (1000 MT)")
    suprimento: float = Field(..., description="Total supply (1000 MT)")
    consumo: float = Field(..., description="Consumption (1000 MT)")
    exportacao: float = Field(..., description="Exports (1000 MT)")
    estoque_final: float = Field(..., description="Ending stock (1000 MT)")


class SoyComplexResponse(BaseModel):
    """Complete soy complex balance sheet matching CONAB Table 14"""
    success: bool = True
    source: str = "CONAB e Secex"
    note: str = "Estimativa em janeiro/2026. Estoque de passagem 31 de dezembro."
    unit: str = "mil t (thousand metric tons)"
    last_updated: datetime
    soja_graos: List[SoyComplexRow] = Field(..., description="Soybeans")
    farelo: List[SoyComplexRow] = Field(..., description="Soy meal")
    oleo: List[SoyComplexRow] = Field(..., description="Soy oil")


# =============================================================================
# EXPORT MODELS
# =============================================================================

class MonthlyExportRow(BaseModel):
    """Monthly export data row"""
    year: int
    month: int
    month_name: str = Field(..., alias="monthName")
    volume_mt: float = Field(..., alias="volumeMt", description="Volume in metric tons")
    volume_mmt: float = Field(..., alias="volumeMmt", description="Volume in MMT")
    value_usd: float = Field(..., alias="valueUsd")
    to_china_mt: Optional[float] = Field(None, alias="toChinaMt")
    to_china_pct: Optional[float] = Field(None, alias="toChinaPct")
    is_partial: bool = Field(False, alias="isPartial")
    
    class Config:
        populate_by_name = True


class MonthlyExportsResponse(BaseModel):
    """Monthly exports API response"""
    success: bool = True
    commodity: str
    ncm_code: str = Field(..., alias="ncmCode")
    year: int
    source: str = "SECEX/MDIC ComexStat"
    last_updated: datetime
    data: List[MonthlyExportRow]
    ytd_total_mmt: float = Field(..., alias="ytdTotalMmt")
    ytd_to_china_mmt: Optional[float] = Field(None, alias="ytdToChinaMmt")
    
    class Config:
        populate_by_name = True


class ExportDestination(BaseModel):
    """Export by destination country"""
    country_code: str = Field(..., alias="countryCode")
    country_name: str = Field(..., alias="countryName")
    volume_mt: float = Field(..., alias="volumeMt")
    volume_mmt: float = Field(..., alias="volumeMmt")
    value_usd: float = Field(..., alias="valueUsd")
    share_pct: float = Field(..., alias="sharePct")
    
    class Config:
        populate_by_name = True


class ExportsByDestinationResponse(BaseModel):
    """Exports by destination API response"""
    success: bool = True
    commodity: str
    year: int
    source: str = "SECEX/MDIC ComexStat"
    last_updated: datetime
    total_mmt: float = Field(..., alias="totalMmt")
    data: List[ExportDestination]
    
    class Config:
        populate_by_name = True


class ExportPort(BaseModel):
    """Export by port"""
    port_name: str = Field(..., alias="portName")
    state: str
    volume_mmt: float = Field(..., alias="volumeMmt")
    share_pct: float = Field(..., alias="sharePct")
    
    class Config:
        populate_by_name = True


class ExportsByPortResponse(BaseModel):
    """Exports by port API response"""
    success: bool = True
    commodity: str
    year: int
    source: str = "SECEX/MDIC ComexStat"
    last_updated: datetime
    data: List[ExportPort]
    
    class Config:
        populate_by_name = True


# =============================================================================
# PRODUCTION MODELS
# =============================================================================

class ProductionRow(BaseModel):
    """Historical production data row"""
    crop_year: str = Field(..., alias="cropYear")
    state: Optional[str] = None
    area_mha: float = Field(..., alias="areaMha", description="Planted area (million ha)")
    production_mmt: float = Field(..., alias="productionMmt", description="Production (MMT)")
    yield_mt_ha: float = Field(..., alias="yieldMtHa", description="Yield (MT/ha)")
    is_projection: bool = Field(False, alias="isProjection")
    
    class Config:
        populate_by_name = True


class ProductionResponse(BaseModel):
    """Production API response"""
    success: bool = True
    commodity: str
    source: str = "CONAB SerieHistoricaGraos"
    last_updated: datetime
    data: List[ProductionRow]


# =============================================================================
# PRICE MODELS
# =============================================================================

class MonthlyPriceRow(BaseModel):
    """Monthly price data row"""
    year: int
    month: int
    month_name: str = Field(..., alias="monthName")
    location: str
    price_brl: float = Field(..., alias="priceBrl", description="Price in BRL/60kg bag")
    price_usd: Optional[float] = Field(None, alias="priceUsd")
    mom_change_pct: Optional[float] = Field(None, alias="momChangePct")
    
    class Config:
        populate_by_name = True


class MonthlyPricesResponse(BaseModel):
    """Monthly prices API response"""
    success: bool = True
    commodity: str
    unit: str = "BRL/60kg bag"
    source: str = "CONAB PrecosMensalUF"
    last_updated: datetime
    data: List[MonthlyPriceRow]


# =============================================================================
# DASHBOARD SUMMARY MODEL
# =============================================================================

class CommoditySummary(BaseModel):
    """Summary for a single commodity"""
    current_year: str
    production_mmt: float
    exports_mmt: float
    ending_stock_mmt: float
    yoy_production_pct: float
    yoy_exports_pct: float


class DashboardSummaryResponse(BaseModel):
    """Complete dashboard summary for initial load"""
    success: bool = True
    last_updated: datetime
    data_sources: List[str]
    
    # Production data (historical series)
    production: Dict[str, List[Dict[str, Any]]]
    
    # Balance sheets
    balance_sheets: Dict[str, List[Dict[str, Any]]]
    
    # Monthly exports (current and prior year)
    monthly_exports: Dict[str, Dict[str, List[Dict[str, Any]]]]
    
    # Monthly prices
    monthly_prices: Dict[str, Dict[str, List[Dict[str, Any]]]]
    
    # Export destinations
    export_destinations: Dict[str, List[Dict[str, Any]]]
    
    # Export ports
    export_ports: List[Dict[str, Any]]
    
    # Soy complex balance (Table 14)
    soy_complex: Dict[str, List[Dict[str, Any]]]
    
    # Survey data
    survey_data: Dict[str, List[Dict[str, Any]]]
