package com.emualerts

data class Alert(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: Long,
)
