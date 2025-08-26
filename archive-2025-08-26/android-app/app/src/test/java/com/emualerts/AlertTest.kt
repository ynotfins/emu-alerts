package com.emualerts

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class AlertTest {
    @Test
    fun `Alert data class creation`() {
        val alert =
            Alert(
                id = "12345",
                title = "Test Alert",
                message = "This is a test alert",
                timestamp = 1234567890L,
            )

        assertEquals("12345", alert.id)
        assertEquals("Test Alert", alert.title)
        assertEquals("This is a test alert", alert.message)
        assertEquals(1234567890L, alert.timestamp)
    }

    @Test
    fun `Alert data class equality`() {
        val alert1 = Alert("123", "Title", "Message", 1000L)
        val alert2 = Alert("123", "Title", "Message", 1000L)
        val alert3 = Alert("456", "Title", "Message", 1000L)

        assertEquals(alert1, alert2)
        assertNotEquals(alert1, alert3)
    }

    @Test
    fun `Alert data class hashCode consistency`() {
        val alert1 = Alert("123", "Title", "Message", 1000L)
        val alert2 = Alert("123", "Title", "Message", 1000L)

        assertEquals(alert1.hashCode(), alert2.hashCode())
    }
}
