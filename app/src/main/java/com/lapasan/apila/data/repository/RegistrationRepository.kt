package com.lapasan.apila.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.data.model.User
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.tasks.await

class RegistrationRepository(
    private val programRepository: ProgramRepository = ProgramRepository()
) {

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    companion object {
        // Seed initial registrations to demonstrate "My Programs" and "History" immediately
        val localRegistrations = mutableListOf(
            // Resident's upcoming registration
            Registration(
                id = "reg_101",
                programId = "prog_001",
                programTitle = "Barangay Lapasan Medical & Dental Mission",
                programCategory = "Health & Wellness",
                programVenue = "Lapasan Covered Court",
                programDateTime = "Oct 15, 2026 • 08:00 AM",
                userId = "demo_resident_001",
                residentName = "Maria Clara Santos",
                residentPhone = "09171234567",
                residentPurok = "Purok 2 - Lapasan Proper",
                registeredAt = System.currentTimeMillis() - 86400000L * 2,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_PENDING
            ),
            // Resident's completed history item (Present)
            Registration(
                id = "reg_102",
                programId = "prog_hist_001",
                programTitle = "Lapasan Coastal Clean-up & Mangrove Planting",
                programCategory = "Community Clean-up & Environment",
                programVenue = "Lapasan Coastal Shoreline",
                programDateTime = "Sep 14, 2026 • 06:00 AM",
                userId = "demo_resident_001",
                residentName = "Maria Clara Santos",
                residentPhone = "09171234567",
                residentPurok = "Purok 2 - Lapasan Proper",
                registeredAt = System.currentTimeMillis() - 86400000L * 20,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_PRESENT
            ),
            // Resident's completed history item (Absent)
            Registration(
                id = "reg_103",
                programId = "prog_hist_002",
                programTitle = "Barangay General Assembly & Budget Hearing",
                programCategory = "General Civic Assembly",
                programVenue = "Barangay Lapasan Gymnasium",
                programDateTime = "Aug 20, 2026 • 02:00 PM",
                userId = "demo_resident_001",
                residentName = "Maria Clara Santos",
                residentPhone = "09171234567",
                residentPurok = "Purok 2 - Lapasan Proper",
                registeredAt = System.currentTimeMillis() - 86400000L * 45,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_ABSENT
            ),
            // Additional participants for program 1 to test admin attendance & participants
            Registration(
                id = "reg_201",
                programId = "prog_001",
                programTitle = "Barangay Medical & Dental Mission",
                programCategory = "Health & Wellness",
                programVenue = "Lapasan Covered Court",
                programDateTime = "Oct 15, 2026 • 08:00 AM",
                userId = "usr_002",
                residentName = "Juan Dela Cruz",
                residentPhone = "09181112233",
                residentPurok = "Purok 1 - Kolambog",
                registeredAt = System.currentTimeMillis() - 86400000L * 3,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_PRESENT
            ),
            Registration(
                id = "reg_202",
                programId = "prog_001",
                programTitle = "Barangay Medical & Dental Mission",
                programCategory = "Health & Wellness",
                programVenue = "Lapasan Covered Court",
                programDateTime = "Oct 15, 2026 • 08:00 AM",
                userId = "usr_003",
                residentName = "Rosalinda Mendoza",
                residentPhone = "09204445566",
                residentPurok = "Purok 6 - Riverside",
                registeredAt = System.currentTimeMillis() - 86400000L * 1,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_PENDING
            ),
            Registration(
                id = "reg_203",
                programId = "prog_001",
                programTitle = "Barangay Medical & Dental Mission",
                programCategory = "Health & Wellness",
                programVenue = "Lapasan Covered Court",
                programDateTime = "Oct 15, 2026 • 08:00 AM",
                userId = "usr_004",
                residentName = "Antonio Silayan",
                residentPhone = "09228889900",
                residentPurok = "Purok 7 - Bitan-ag",
                registeredAt = System.currentTimeMillis() - 86400000L * 4,
                status = Registration.STATUS_CONFIRMED,
                attendanceStatus = Registration.ATTENDANCE_PENDING
            )
        )
    }

    suspend fun registerForProgram(program: Program, user: User): Resource<Registration> {
        // 1. Check if program has available slots
        if (program.isFull) {
            return Resource.Error("Sorry, this program is currently full (0 slots available).")
        }

        // 2. Check if already registered
        val existing = localRegistrations.find {
            it.programId == program.id && it.userId == user.uid && it.status == Registration.STATUS_CONFIRMED
        }
        if (existing != null) {
            return Resource.Error("You are already registered for this program.")
        }

        val newReg = Registration(
            id = "reg_" + System.currentTimeMillis(),
            programId = program.id,
            programTitle = program.title,
            programCategory = program.category,
            programVenue = program.venue,
            programDateTime = "${program.startDate} • ${program.startTime}",
            userId = user.uid,
            residentName = user.fullName,
            residentPhone = user.phone,
            residentPurok = user.purok,
            registeredAt = System.currentTimeMillis(),
            status = Registration.STATUS_CONFIRMED,
            attendanceStatus = Registration.ATTENDANCE_PENDING
        )

        localRegistrations.add(0, newReg)
        programRepository.adjustRegistrationCount(program.id, 1)

        firestore?.let { db ->
            try {
                val firestoreData = hashMapOf(
                    "id" to newReg.id,
                    "residentId" to user.uid,
                    "userId" to user.uid,
                    "residentName" to user.fullName,
                    "programId" to program.id,
                    "programTitle" to program.title,
                    "programCategory" to program.category,
                    "programVenue" to program.venue,
                    "programDateTime" to newReg.programDateTime,
                    "purok" to user.purok,
                    "residentPurok" to user.purok,
                    "phone" to user.phone,
                    "residentPhone" to user.phone,
                    "status" to "Pending",
                    "attendanceStatus" to "pending",
                    "registeredAt" to com.google.firebase.Timestamp.now()
                )
                db.collection("registrations").document(newReg.id).set(firestoreData).await()
            } catch (_: Exception) {}
        }

        return Resource.Success(newReg)
    }

    suspend fun cancelRegistration(registrationId: String): Resource<Boolean> {
        val reg = localRegistrations.find { it.id == registrationId }
            ?: return Resource.Error("Registration not found")

        val index = localRegistrations.indexOf(reg)
        localRegistrations[index] = reg.copy(status = Registration.STATUS_CANCELLED)
        programRepository.adjustRegistrationCount(reg.programId, -1)

        firestore?.let { db ->
            try {
                db.collection("registrations").document(registrationId)
                    .update("status", Registration.STATUS_CANCELLED).await()
            } catch (_: Exception) {}
        }

        return Resource.Success(true)
    }

    fun getActiveRegistrations(userId: String): List<Registration> {
        return localRegistrations.filter {
            it.userId == userId && it.status == Registration.STATUS_CONFIRMED &&
                    (it.attendanceStatus == Registration.ATTENDANCE_PENDING || !it.programDateTime.contains("Sep ") && !it.programDateTime.contains("Aug "))
        }
    }

    fun getRegistrationHistory(userId: String): List<Registration> {
        return localRegistrations.filter {
            it.userId == userId &&
                    (it.attendanceStatus != Registration.ATTENDANCE_PENDING || it.status == Registration.STATUS_CANCELLED || it.programDateTime.contains("Sep ") || it.programDateTime.contains("Aug "))
        }
    }

    fun getRegistrationsForProgram(programId: String): List<Registration> {
        return localRegistrations.filter { it.programId == programId && it.status == Registration.STATUS_CONFIRMED }
    }

    fun isUserRegistered(programId: String, userId: String): Boolean {
        return localRegistrations.any {
            it.programId == programId && it.userId == userId && it.status == Registration.STATUS_CONFIRMED
        }
    }

    fun getRegistration(programId: String, userId: String): Registration? {
        return localRegistrations.find {
            it.programId == programId && it.userId == userId && it.status == Registration.STATUS_CONFIRMED
        }
    }

    suspend fun updateAttendance(registrationId: String, newStatus: String): Resource<Boolean> {
        val index = localRegistrations.indexOfFirst { it.id == registrationId }
        if (index >= 0) {
            val reg = localRegistrations[index].copy(attendanceStatus = newStatus)
            localRegistrations[index] = reg
            firestore?.let { db ->
                try {
                    db.collection("registrations").document(registrationId)
                        .update("attendanceStatus", newStatus).await()
                } catch (_: Exception) {}
            }
            return Resource.Success(true)
        }
        return Resource.Error("Registration not found")
    }
}
