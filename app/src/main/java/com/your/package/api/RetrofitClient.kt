object RetrofitClient {
    // Comment out emulator URL
    // private const val BASE_URL = "http://10.0.2.2:3000/api/"
    
    // Use your actual IP address
    private const val BASE_URL = "http://YOUR_IP_ADDRESS:3000/api/"

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
} 