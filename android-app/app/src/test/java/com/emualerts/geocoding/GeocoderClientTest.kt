package com.emualerts.geocoding

import org.junit.Test
import kotlin.test.assertEquals

class GeocoderClientTest {
    @Test
    fun `GeocodeResponse data class creation`() {
        val location = Location(lat = 40.7128, lng = -74.0060)
        val geometry = Geometry(location = location)
        val result = GeocodeResult(geometry = geometry)
        val response = GeocodeResponse(results = listOf(result), status = "OK")

        assertEquals("OK", response.status)
        assertEquals(1, response.results.size)
        assertEquals(
            40.7128,
            response.results[0]
                .geometry.location.lat,
        )
        assertEquals(
            -74.0060,
            response.results[0]
                .geometry.location.lng,
        )
    }

    @Test
    fun `Location data class equality`() {
        val loc1 = Location(lat = 40.7128, lng = -74.0060)
        val loc2 = Location(lat = 40.7128, lng = -74.0060)
        val loc3 = Location(lat = 41.0000, lng = -74.0060)

        assertEquals(loc1, loc2)
        assert(loc1 != loc3)
    }
}
