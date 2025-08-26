package com.emualerts

import org.junit.Test
import java.net.URL
import kotlin.test.assertTrue

class URLValidationTest {
    private val urlsToValidate =
        listOf(
            "https://maps.googleapis.com/",
            "https://www.google.com/maps/search/",
            "https://www.google.com/maps?q=",
        )

    @Test
    fun `all external URLs are valid HTTPS`() {
        urlsToValidate.forEach { urlString ->
            assertTrue(
                isValidHttpsUrl(urlString),
                "URL $urlString is not a valid HTTPS URL",
            )
        }
    }

    private fun isValidHttpsUrl(urlString: String): Boolean =
        try {
            val url = URL(urlString)
            url.protocol == "https"
        } catch (e: Exception) {
            false
        }
}
