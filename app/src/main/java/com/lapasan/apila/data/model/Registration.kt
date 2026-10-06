package com.lapasan.apila.data.model

import java.io.Serializable

data class Registration(
    val id: String = "",
    val programId: String = "",
    val programTitle: String = "",
    val programCategory: String = "",
    val programVenue: String = "",
    val programDateTime: String = "",
    val userId: String = "",
    val residentName: String = "",
    val residentPhone: String = "",
    val residentPurok: String = "",
    val registeredAt: Long = System.currentTimeMillis(),
    val status: String = STATUS_CONFIRMED, // "confirmed" or "cancelled"
    val attendanceStatus: String = ATTENDANCE_PENDING // "pending", "present", "absent"
) : Serializable {

    companion object {
        const val STATUS_CONFIRMED = "confirmed"
        const val STATUS_CANCELLED = "cancelled"

        const val ATTENDANCE_PENDING = "pending"
        const val ATTENDANCE_PRESENT = "present"
        const val ATTENDANCE_ABSENT = "absent"
    }

    val isActive: Boolean
        get() = status == STATUS_CONFIRMED
}
