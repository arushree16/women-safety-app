class LocationMonitor(
    private val context: Context,
    private val onSafetyDataUpdate: (List<Incident>) -> Unit
) {
    private val apiService = RetrofitClient.apiService
    private val locationClient = LocationServices.getFusedLocationProviderClient(context)
    private val locationRequest = LocationRequest.create().apply {
        interval = 10000 // Update every 10 seconds
        fastestInterval = 5000
        priority = LocationRequest.PRIORITY_HIGH_ACCURACY
    }
    
    fun startMonitoring() {
        if (checkPermissions()) {
            locationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        }
    }
    
    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(locationResult: LocationResult) {
            locationResult.lastLocation?.let { location ->
                checkSafety(location.latitude, location.longitude)
            }
        }
    }
    
    private fun checkSafety(latitude: Double, longitude: Double) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Check current safety
                val currentResponse = apiService.checkSafety(latitude, longitude)
                
                // Get current hour
                val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
                
                // Check safety for current hour
                val timeResponse = apiService.checkSafetyTime(
                    latitude, 
                    longitude,
                    currentHour
                )
                
                val allIncidents = (currentResponse.incidents + timeResponse.incidents).distinct()
                
                // Update map with incidents
                onSafetyDataUpdate(allIncidents)
                
                // Show alert if unsafe
                if (!currentResponse.isSafe || !timeResponse.isSafe) {
                    showSafetyAlert(allIncidents)
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    private fun showSafetyAlert(incidents: List<Incident>) {
        // Show notification to user
        NotificationHelper.showAlert(
            context,
            "Safety Alert",
            "There have been recent safety incidents reported in this area. Incidents: ${incidents.joinToString { it.description }}",
            incidents
        )
    }
    
    fun getCurrentLocation(onLocationReceived: (Location) -> Unit) {
        if (checkPermissions()) {
            locationClient.lastLocation
                .addOnSuccessListener { location ->
                    location?.let(onLocationReceived)
                }
        }
    }
} 