package com.lapasan.apila.data.model

data class DashboardStats(
    val totalPrograms: Int = 0,
    val activePrograms: Int = 0,
    val totalRegistrations: Int = 0,
    val totalAttended: Int = 0,
    val totalAbsent: Int = 0
) {
    val attendanceRate: Int
        get() {
            val evaluated = totalAttended + totalAbsent
            return if (evaluated > 0) {
                ((totalAttended.toFloat() / evaluated.toFloat()) * 100).toInt()
            } else {
                0
            }
        }
}
