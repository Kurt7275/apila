package com.lapasan.apila.data.repository

import android.util.Log
import com.google.firebase.firestore.FieldValue
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
            Log.e("RegistrationRepo", "Error initializing Firestore", e)
            null
        }
    }

    companion object {
        // Dynamic cache — populated live from Firestore
        val localRegistrations = mutableListOf<Registration>()
    }

    suspend fun fetchUserRegistrations(userId: String): List<Registration> {
        val db = firestore
        if (db != null) {
            try {
                // Fetch attendance records for this user if any (for instant pass attendance status)
                val attendanceMap = try {
                    val attendanceSnapshot = db.collection("attendance")
                        .whereEqualTo("residentId", userId)
                        .get()
                        .await()
                    attendanceSnapshot.documents.associate {
                        (it.getString("programId") ?: "") to (it.getString("status")?.lowercase() ?: "pending")
                    }
                } catch (e: Exception) {
                    Log.w("RegistrationRepo", "Could not fetch attendance records: ${e.message}")
                    emptyMap()
                }

                val snapshot = db.collection("registrations").get().await()
                val userList = snapshot.documents.filter { doc ->
                    val rId = doc.getString("residentId") ?: doc.getString("userId") ?: ""
                    rId == userId
                }.map { doc ->
                    val rawStatus = doc.getString("status") ?: "Pending"
                    var rawAttendance = doc.getString("attendanceStatus")?.lowercase() ?: "pending"
                    val pId = doc.getString("programId") ?: ""
                    if (rawAttendance == "pending" && attendanceMap.containsKey(pId)) {
                        rawAttendance = attendanceMap[pId] ?: "pending"
                    }
                    val timestamp = doc.getTimestamp("registeredAt")?.toDate()?.time ?: System.currentTimeMillis()
                    Registration(
                        id = doc.id,
                        programId = pId,
                        programTitle = doc.getString("programTitle") ?: "",
                        programCategory = doc.getString("programCategory") ?: "Civic",
                        programVenue = doc.getString("programVenue") ?: "Barangay Lapasan Multi-Purpose Hall",
                        programDateTime = doc.getString("programDateTime") ?: "",
                        userId = userId,
                        residentName = doc.getString("residentName") ?: "",
                        residentPhone = doc.getString("residentPhone") ?: doc.getString("phone") ?: "",
                        residentPurok = doc.getString("residentPurok") ?: doc.getString("purok") ?: "",
                        registeredAt = timestamp,
                        status = rawStatus,
                        attendanceStatus = rawAttendance
                    )
                }
                localRegistrations.removeAll { it.userId == userId }
                localRegistrations.addAll(userList)
                Log.d("RegistrationRepo", "Successfully fetched ${userList.size} registrations for user $userId")
            } catch (e: Exception) {
                Log.e("RegistrationRepo", "Error fetching registrations from Firestore", e)
            }
        }
        return localRegistrations.filter { it.userId == userId }
    }

    suspend fun registerForProgram(program: Program, user: User): Resource<Registration> {
        if (program.isFull) {
            return Resource.Error("Sorry, this program is currently full (0 slots available).")
        }

        // Check if already registered
        val existing = localRegistrations.find {
            it.programId == program.id && it.userId == user.uid && it.isActive
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
            status = Registration.STATUS_PENDING,
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
                
                // Live update: increment enrolled count in programs collection
                db.collection("programs").document(program.id)
                    .update("enrolledCount", FieldValue.increment(1))
                    .await()
                Log.d("RegistrationRepo", "Registration ${newReg.id} recorded live to Firestore")
            } catch (e: Exception) {
                Log.e("RegistrationRepo", "Error recording registration live to Firestore", e)
            }
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
                    .update("status", "Cancelled").await()
                db.collection("programs").document(reg.programId)
                    .update("enrolledCount", FieldValue.increment(-1))
                    .await()
                Log.d("RegistrationRepo", "Registration $registrationId cancelled live in Firestore")
            } catch (e: Exception) {
                Log.e("RegistrationRepo", "Error cancelling registration in Firestore", e)
            }
        }

        return Resource.Success(true)
    }

    fun getActiveRegistrations(userId: String): List<Registration> {
        return localRegistrations.filter {
            it.userId == userId && it.isActive
        }
    }

    fun isUserRegistered(programId: String, userId: String): Boolean {
        return localRegistrations.any { it.programId == programId && it.userId == userId && it.isActive }
    }

    fun getRegistration(programId: String, userId: String): Registration? {
        return localRegistrations.find { it.programId == programId && it.userId == userId && it.isActive }
    }

    fun getRegistrationHistory(userId: String): List<Registration> {
        return localRegistrations.filter { it.userId == userId }
    }
}
