package com.emualerts.geocoding

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Data classes for parsing the Google Geocoding API response.
 * We only model the fields we need: status and results -> geometry -> location -> lat/lng.
 */

@JsonClass(generateAdapter = true)
data class GeocodeResponse(
    @Json(name = "results") val results: List<GeocodeResult>,
    @Json(name = "status") val status: String,
)

@JsonClass(generateAdapter = true)
data class GeocodeResult(
    @Json(name = "geometry") val geometry: Geometry,
)

@JsonClass(generateAdapter = true)
data class Geometry(
    @Json(name = "location") val location: Location,
)

@JsonClass(generateAdapter = true)
data class Location(
    @Json(name = "lat") val lat: Double,
    @Json(name = "lng") val lng: Double,
)
