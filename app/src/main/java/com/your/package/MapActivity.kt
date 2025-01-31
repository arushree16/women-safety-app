class MapActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var map: GoogleMap
    private lateinit var locationMonitor: LocationMonitor
    private val markers = mutableMapOf<String, Marker>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)
        
        // Initialize map
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
        
        // Initialize location monitor
        locationMonitor = LocationMonitor(this, ::updateMapWithSafetyData)
        
        // Setup current location button
        findViewById<FloatingActionButton>(R.id.fabCurrentLocation).setOnClickListener {
            moveToCurrentLocation()
        }
    }
    
    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        setupMap()
        locationMonitor.startMonitoring()
    }
    
    private fun setupMap() {
        map.apply {
            isMyLocationEnabled = true // Requires location permission
            uiSettings.isMyLocationButtonEnabled = false
            uiSettings.isZoomControlsEnabled = true
        }
    }
    
    private fun moveToCurrentLocation() {
        locationMonitor.getCurrentLocation { location ->
            val latLng = LatLng(location.latitude, location.longitude)
            map.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f))
        }
    }
    
    private fun updateMapWithSafetyData(incidents: List<Incident>) {
        runOnUiThread {
            // Clear old markers
            markers.values.forEach { it.remove() }
            markers.clear()
            
            // Add new markers for incidents
            incidents.forEach { incident ->
                val position = LatLng(
                    incident.location.coordinates[1], // latitude
                    incident.location.coordinates[0]  // longitude
                )
                
                val marker = map.addMarker(
                    MarkerOptions()
                        .position(position)
                        .title("Safety Alert")
                        .snippet(incident.description)
                        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED))
                )
                
                marker?.let {
                    markers[incident.id] = it
                }
            }
        }
    }
} 