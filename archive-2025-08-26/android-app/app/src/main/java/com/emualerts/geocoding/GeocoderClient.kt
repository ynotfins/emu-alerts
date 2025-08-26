package com.emualerts.geocoding

import android.util.Log
import com.google.android.gms.maps.model.LatLng
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

class GeocoderClient {
    private val moshi =
        Moshi
            .Builder()
            .add(KotlinJsonAdapterFactory())
            .build()

    private val retrofit =
        Retrofit
            .Builder()
            .baseUrl("https://maps.googleapis.com/")
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    private val service: GeocodingApiService by lazy {
        retrofit.create(GeocodingApiService::class.java)
    }

    /**
     * Geocodes an address string to a LatLng coordinate using a provided API key.
     * @param address The address to geocode.
     * @param apiKey Your Google Maps API key.
     * @return A LatLng object on success, or null on failure.
     */
    suspend fun geocodeWithApiKey(
        address: String,
        apiKey: String,
    ): LatLng? {
        if (address.isBlank() || apiKey.isBlank()) {
            Log.w("GeocoderClient", "Address or API key is blank")
            return null
        }
        try {
            val response = service.geocode(address, apiKey)

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null && body.status == "OK" && body.results.isNotEmpty()) {
                    val location = body.results[0].geometry.location
                    return LatLng(location.lat, location.lng)
                } else {
                    Log.w("GeocoderClient", "Geocoding failed with status: ${body?.status}")
                    return null
                }
            } else {
                Log.e("GeocoderClient", "Geocoding request failed: ${response.errorBody()?.string()}")
                return null
            }
        } catch (e: Exception) {
            Log.e("GeocoderClient", "Exception during geocoding", e)
            return null
        }
    }

    /**
     * Geocodes an address string to a LatLng coordinate using the API key from BuildConfig.
     * @param context The application context, used to access BuildConfig.
     * @param address The address to geocode.
     * @return A LatLng object on success, or null on failure.
     */
    suspend fun geocode(address: String): LatLng? {
        val apiKey = com.emualerts.BuildConfig.MAPS_API_KEY
        if (apiKey.isEmpty()) {
            Log.e("GeocoderClient", "API key not found in BuildConfig. Did you add it to local.properties?")
            return null
        }
        return geocodeWithApiKey(address, apiKey)
    }
}
