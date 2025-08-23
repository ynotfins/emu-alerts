package com.emualerts.util

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.GeoPoint
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object FirestoreProbe {
    private val iso =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

    fun keys(doc: DocumentSnapshot): String =
        doc.data
            ?.keys
            ?.sorted()
            ?.joinToString(", ") ?: "(no fields)"

    fun json(doc: DocumentSnapshot): String {
        val map = doc.data ?: return "{}"
        return JSONObject(map.mapValues { (_, v) -> normalize(v) }).toString(2)
    }

    private fun normalize(v: Any?): Any? =
        when (v) {
            null -> null
            is Timestamp -> iso.format(v.toDate())
            is Date -> iso.format(v)
            is GeoPoint -> mapOf("lat" to v.latitude, "lng" to v.longitude)
            is DocumentReference -> v.path
            is Map<*, *> -> JSONObject(v.mapValues { (_, vv) -> normalize(vv) })
            is List<*> -> JSONArray(v.map { normalize(it) })
            else -> v
        }
}
