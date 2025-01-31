interface ApiService {
    @GET("check-safety")
    suspend fun checkSafety(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double
    ): SafetyResponse

    @GET("check-safety-time")
    suspend fun checkSafetyTime(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("hour") hour: Int
    ): SafetyResponse
}

data class SafetyResponse(
    val isSafe: Boolean,
    val incidents: List<Incident>
) 