# Test Data for EMU Alerts

## Sample Payloads

### 1. Working Fire
```json
{
    "appName": "BNN",
    "message": "NY | Dutchess | Poughkeepsie | Working Fire | 123 Main St | Initial report of smoke from second floor window | #fire123",
    "source": "BNN",
    "address": "123 Main Street, Poughkeepsie, NY",
    "lat": 41.70371,
    "lng": -73.93639
}
```

### 2. Update to Working Fire
```json
{
    "appName": "BNN",
    "message": "NY | Dutchess | Poughkeepsie | Working Fire | 123 Main St | U/D Fire showing from second floor, all hands working | #fire123",
    "source": "BNN",
    "address": "123 Main Street, Poughkeepsie, NY",
    "lat": 41.70371,
    "lng": -73.93639
}
```

### 3. Weather Alert
```json
{
    "appName": "BNN",
    "message": "NY | Dutchess | All | Weather Alert | County-wide | Severe Thunderstorm Warning in effect until 9:00 PM EDT | #wx789",
    "source": "BNN"
}
```

## Testing Process

1. Set environment variable:
   ```bash
   export X_INGEST_TOKEN=your_token_here
   ```

2. Post incidents in order:
   ```bash
   curl -i -X POST \
     https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \
     -H "Content-Type: application/json" \
     -H "X-Ingest-Token: $X_INGEST_TOKEN" \
     -d @payload1.json
   ```

3. Wait 30-60 seconds between posts to simulate real timing

4. Verify in app:
   - Check alerts list
   - Open each incident
   - Verify update counts
   - Check location display

## Screenshots

Reference screenshots showing correct display:
- List view: `docs/design/home.jpg`
- Details view: `docs/design/details.jpg`
