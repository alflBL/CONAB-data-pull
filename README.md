# Brazil Agricultural Data API

FastAPI backend serving CONAB and SECEX data for FarmhandPro dashboards.

## Data Sources

| Source | URL | Data Types |
|--------|-----|------------|
| **CONAB** | portaldeinformacoes.conab.gov.br | Production, Balance Sheets, Prices |
| **SECEX/MDIC** | comexstat.mdic.gov.br | Monthly Export Volumes, Destinations |

## Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

### Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

## API Endpoints

### Dashboard (All-in-One)

```
GET /api/v1/dashboard/summary
```
Returns all data needed for the CONAB dashboard in a single request.

### Balance Sheets

```
GET /api/v1/balance-sheet/{commodity}?years=6
GET /api/v1/soy-complex/balance
```

Commodities: `soybeans`, `corn`, `soy_meal`, `soy_oil`, `wheat`

### Exports

```
GET /api/v1/exports/monthly/{commodity}?year=2025&include_china=true
GET /api/v1/exports/by-destination/{commodity}?year=2025&top_n=10
GET /api/v1/exports/by-port/{commodity}?year=2025
```

### Production

```
GET /api/v1/production/{commodity}?years=10&state=MT
```

### Prices

```
GET /api/v1/prices/{commodity}?year=2025&location=MT
```

## Example Response

```json
// GET /api/v1/soy-complex/balance
{
  "success": true,
  "source": "CONAB e Secex",
  "note": "Estimativa em janeiro/2026. Estoque de passagem 31 de dezembro.",
  "unit": "mil t (thousand metric tons)",
  "soja_graos": [
    {
      "safra": "2024/25",
      "estoque_inicial": 7231.3,
      "producao": 171480.5,
      "importacao": 968.6,
      "suprimento": 179680.4,
      "consumo": 60768.8,
      "exportacao": 108181.1,
      "estoque_final": 10730.6
    },
    {
      "safra": "2025/26",
      "estoque_inicial": 10730.6,
      "producao": 176124.4,
      "importacao": 500.0,
      "suprimento": 187355.0,
      "consumo": 64265.9,
      "exportacao": 111790.8,
      "estoque_final": 11298.2
    }
  ],
  "farelo": [...],
  "oleo": [...]
}
```

## Data Refresh

### Manual Refresh

```bash
curl -X POST "http://localhost:8000/api/v1/admin/refresh?api_key=YOUR_KEY"
```

### Scheduled Refresh (Cron)

```bash
# Add to crontab - refresh every 6 hours
0 */6 * * * curl -s -X POST "http://localhost:8000/api/v1/admin/refresh?api_key=YOUR_KEY"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_API_KEY` | API key for admin endpoints | `farmhandpro-refresh-2025` |
| `PORT` | Server port | `8000` |

## Frontend Integration

```javascript
// React example
const API_BASE = 'http://localhost:8000';

// Fetch all dashboard data at once
const response = await fetch(`${API_BASE}/api/v1/dashboard/summary`);
const { data } = await response.json();

// Use the data
const soyBalance = data.balance_sheets.soybeans;
const monthlyExports = data.monthly_exports.soybeans['2025'];
```

## NCM Codes Reference

| Commodity | NCM Code |
|-----------|----------|
| Soybeans | 1201 |
| Corn | 1005 |
| Soy Meal | 2304 |
| Soy Oil | 1507 |
| Wheat | 1001 |

## License

MIT - FarmhandPro
