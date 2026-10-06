package com.lapasan.apila.data.model

import java.io.Serializable

data class Program(
    val id: String = "",
    val title: String = "",
    val category: String = "General Civic Assembly",
    val description: String = "",
    val venue: String = "Lapasan Covered Court",
    val startDate: String = "",       // e.g. "Oct 12, 2026"
    val startTime: String = "",       // e.g. "08:00 AM"
    val endDate: String = "",         // e.g. "Oct 12, 2026"
    val endTime: String = "",         // e.g. "12:00 PM"
    val registrationDeadline: String = "",
    val maxCapacity: Int = 50,
    val registeredCount: Int = 0,
    val status: String = STATUS_PUBLISHED, // "published", "draft", "closed", "cancelled"
    val createdBy: String = "",
    val createdAt: Long = System.currentTimeMillis()
) : Serializable {

    companion object {
        const val STATUS_DRAFT = "draft"
        const val STATUS_PUBLISHED = "published"
        const val STATUS_CLOSED = "closed"
        const val STATUS_CANCELLED = "cancelled"
    }

    val availableSlots: Int
        get() = (maxCapacity - registeredCount).coerceAtLeast(0)

    val isFull: Boolean
        get() = availableSlots <= 0

    val isRegistrationOpen: Boolean
        get() = status == STATUS_PUBLISHED && !isFull

    val percentOccupied: Int
        get() = if (maxCapacity > 0) {
            ((registeredCount.toFloat() / maxCapacity.toFloat()) * 100).toInt().coerceIn(0, 100)
        } else {
            0
        }
}
