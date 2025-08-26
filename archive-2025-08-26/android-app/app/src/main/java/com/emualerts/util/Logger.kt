package com.emualerts.util

import android.os.SystemClock
import android.util.Log
import com.emualerts.BuildConfig
import org.json.JSONArray
import org.json.JSONObject

/**
 * Minimal, debug-only logger.
 * - No logs in release builds.
 * - Timing helper.
 * - Optional JSON pretty printer.
 * - Convenience extensions with class tag.
 */
object Logger {
    @Volatile
    var enabled: Boolean = BuildConfig.DEBUG

    fun d(
        tag: String,
        msg: String,
    ) {
        if (enabled) Log.d(tag, msg)
    }

    fun i(
        tag: String,
        msg: String,
    ) {
        if (enabled) Log.i(tag, msg)
    }

    fun w(
        tag: String,
        msg: String,
    ) {
        if (enabled) Log.w(tag, msg)
    }

    fun e(
        tag: String,
        msg: String,
        t: Throwable? = null,
    ) {
        if (!enabled) return
        if (t != null) Log.e(tag, msg, t) else Log.e(tag, msg)
    }

    /**
     * Time a block. Logs start/end and duration. Rethrows exceptions after logging.
     */
    inline fun <T> time(
        tag: String,
        label: String,
        block: () -> T,
    ): T {
        if (!enabled) return block()
        d(tag, "▶ $label")
        val start = SystemClock.elapsedRealtime()
        return try {
            val result = block()
            val tookMs = SystemClock.elapsedRealtime() - start
            d(tag, "◀ $label (${tookMs}ms)")
            result
        } catch (t: Throwable) {
            val tookMs = SystemClock.elapsedRealtime() - start
            e(tag, "$label failed after ${tookMs}ms", t)
            throw t
        }
    }

    /**
     * Pretty-print JSON if possible; otherwise logs raw.
     */
    fun json(
        tag: String,
        raw: String,
    ) {
        if (!enabled) return
        val text =
            try {
                when {
                    raw.trim().startsWith("{") -> JSONObject(raw).toString(2)
                    raw.trim().startsWith("[") -> JSONArray(raw).toString(2)
                    else -> raw
                }
            } catch (_: Exception) {
                raw
            }
        d(tag, text)
    }
}

/** ---- Convenience extensions (avoid repeating TAGs) ---- */

val Any.classTag: String
    get() = this::class.java.simpleName

fun Any.logD(msg: String) = Logger.d(classTag, msg)

fun Any.logI(msg: String) = Logger.i(classTag, msg)

fun Any.logW(msg: String) = Logger.w(classTag, msg)

fun Any.logE(
    msg: String,
    t: Throwable? = null,
) = Logger.e(classTag, msg, t)
