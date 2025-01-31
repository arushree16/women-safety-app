data class Incident(
    val id: String,
    val location: Location,
    val description: String,
    val timestamp: Date
) {
    data class Location(
        val type: String,
        val coordinates: List<Double>
    )
} 