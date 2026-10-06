package com.lapasan.apila.data.model

data class User(
    val uid: String = "",
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val role: String = ROLE_RESIDENT, // "resident" or "personnel"
    val purok: String = "",
    val address: String = "",
    val createdAt: Long = System.currentTimeMillis()
) {
    companion object {
        const val ROLE_RESIDENT = "resident"
        const val ROLE_PERSONNEL = "personnel"
    }

    val isPersonnel: Boolean
        get() = role == ROLE_PERSONNEL
}
