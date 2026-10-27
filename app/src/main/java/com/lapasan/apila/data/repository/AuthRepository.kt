package com.lapasan.apila.data.repository

import android.content.Context
import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.lapasan.apila.ApilaApplication
import com.lapasan.apila.data.model.User
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class AuthRepository {

    private val firebaseAuth: FirebaseAuth? by lazy {
        try {
            FirebaseAuth.getInstance()
        } catch (_: Throwable) {
            null
        }
    }

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (_: Throwable) {
            null
        }
    }

    companion object {
        private const val PREFS_NAME = "apila_auth_prefs"
        private const val KEY_UID = "user_uid"
        private const val KEY_FULL_NAME = "user_fullName"
        private const val KEY_EMAIL = "user_email"
        private const val KEY_PHONE = "user_phone"
        private const val KEY_ROLE = "user_role"
        private const val KEY_PUROK = "user_purok"
        private const val KEY_ADDRESS = "user_address"
        private const val KEY_CREATED_AT = "user_createdAt"
        private const val KEY_GENDER = "user_gender"
        private const val KEY_BIRTHDATE = "user_birthdate"
        private const val KEY_IS_VERIFIED = "user_is_verified"

        // Only used when Firebase is completely unavailable (JVM unit tests)
        private val demoUsers = mutableMapOf<String, User>(
            "resident@lapasan.gov.ph" to User(
                uid = "demo_resident_001",
                fullName = "Maria Clara Santos",
                email = "resident@lapasan.gov.ph",
                phone = "09171234567",
                role = User.ROLE_RESIDENT,
                purok = "Purok 2 - Lapasan Proper",
                address = "Block 4 Lot 12, Lapasan Proper",
                gender = "Female",
                birthdate = "1995-04-12",
                isVerified = true
            ),
            "admin@lapasan.gov.ph" to User(
                uid = "demo_admin_001",
                fullName = "Hon. Roberto Delos Reyes",
                email = "admin@lapasan.gov.ph",
                phone = "09189876543",
                role = User.ROLE_PERSONNEL,
                purok = "Barangay Hall",
                address = "Barangay Hall, Lapasan, Cagayan de Oro City",
                isVerified = true
            )
        )

        var currentUser: User? = null
    }

    // ── SharedPreferences session cache (for offline resume only) ─────────────

    private fun saveUserToPrefs(user: User) {
        currentUser = user
        try {
            val app = ApilaApplication.instance
            val prefs = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putString(KEY_UID, user.uid)
                .putString(KEY_FULL_NAME, user.fullName)
                .putString(KEY_EMAIL, user.email)
                .putString(KEY_PHONE, user.phone)
                .putString(KEY_ROLE, user.role)
                .putString(KEY_PUROK, user.purok)
                .putString(KEY_ADDRESS, user.address)
                .putString(KEY_GENDER, user.gender)
                .putString(KEY_BIRTHDATE, user.birthdate)
                .putBoolean(KEY_IS_VERIFIED, user.isVerified)
                .putLong(KEY_CREATED_AT, user.createdAt)
                .apply()
        } catch (_: Throwable) {}
    }

    private fun clearUserPrefs() {
        currentUser = null
        try {
            val app = ApilaApplication.instance
            val prefs = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().clear().apply()
        } catch (_: Throwable) {}
    }

    private fun loadUserFromPrefs(): User? {
        try {
            val app = ApilaApplication.instance
            val prefs = app.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val uid = prefs.getString(KEY_UID, null) ?: return null
            return User(
                uid = uid,
                fullName = prefs.getString(KEY_FULL_NAME, "") ?: "",
                email = prefs.getString(KEY_EMAIL, "") ?: "",
                phone = prefs.getString(KEY_PHONE, "") ?: "",
                role = prefs.getString(KEY_ROLE, User.ROLE_RESIDENT) ?: User.ROLE_RESIDENT,
                purok = prefs.getString(KEY_PUROK, "") ?: "",
                address = prefs.getString(KEY_ADDRESS, "") ?: "",
                gender = prefs.getString(KEY_GENDER, "Male") ?: "Male",
                birthdate = prefs.getString(KEY_BIRTHDATE, "") ?: "",
                isVerified = prefs.getBoolean(KEY_IS_VERIFIED, false),
                createdAt = prefs.getLong(KEY_CREATED_AT, System.currentTimeMillis())
            )
        } catch (_: Throwable) {
            return null
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    suspend fun login(email: String, pass: String): Resource<User> {
        val trimmedEmail = email.trim().lowercase()

        val auth = firebaseAuth
        val db = firestore

        // Firebase is available — this is the ONLY path on a real device
        if (auth != null && db != null) {
            return try {
                val authResult = auth.signInWithEmailAndPassword(trimmedEmail, pass).await()
                val uid = authResult.user?.uid
                    ?: return Resource.Error("Login failed. Please try again.")

                val resDoc = try {
                    db.collection("residents").document(uid).get().await()
                } catch (_: Exception) { null }

                // Try users collection first (fast path)
                val userDoc = try {
                    db.collection("users").document(uid).get().await()
                } catch (_: Exception) { null }

                val user = if (userDoc != null && userDoc.exists()) {
                    val base = userDoc.toObject(User::class.java) ?: User(uid = uid, email = trimmedEmail, role = User.ROLE_RESIDENT)
                    val verifiedStatus = resDoc?.getBoolean("isVerified") ?: base.isVerified
                    val genderVal = if (base.gender.isNotBlank()) base.gender else (resDoc?.getString("gender") ?: "Male")
                    val birthdateVal = if (base.birthdate.isNotBlank()) base.birthdate else (resDoc?.getString("birthdate") ?: "")
                    val householdIdVal = if (base.householdId.isNotBlank()) base.householdId else (resDoc?.getString("householdId") ?: "")
                    base.copy(
                        gender = genderVal,
                        birthdate = birthdateVal,
                        householdId = householdIdVal,
                        isVerified = verifiedStatus
                    )
                } else {
                    // No users doc yet — build from residents collection
                    val builtUser = User(
                        uid = uid,
                        email = trimmedEmail,
                        fullName = resDoc?.getString("name") ?: authResult.user?.displayName ?: "Resident",
                        phone = resDoc?.getString("phone") ?: "",
                        purok = resDoc?.getString("purok") ?: "",
                        address = resDoc?.getString("address") ?: "",
                        householdId = resDoc?.getString("householdId") ?: "",
                        gender = resDoc?.getString("gender") ?: "Male",
                        birthdate = resDoc?.getString("birthdate") ?: "",
                        isVerified = resDoc?.getBoolean("isVerified") ?: false,
                        role = User.ROLE_RESIDENT
                    )
                    // Backfill users doc so future logins are instant
                    try { db.collection("users").document(uid).set(builtUser).await() } catch (_: Exception) {}
                    builtUser
                }

                saveUserToPrefs(user)
                Log.d("AuthRepo", "Logged in via Firebase: ${user.fullName} ($uid), verified=${user.isVerified}")
                Resource.Success(user)

            } catch (e: FirebaseAuthInvalidCredentialsException) {
                Resource.Error("Incorrect email or password. Please try again.")
            } catch (e: FirebaseAuthInvalidUserException) {
                Resource.Error("No account found with this email. Please register first.")
            } catch (e: Exception) {
                val msg = e.message ?: ""
                when {
                    msg.contains("network", ignoreCase = true) ||
                    msg.contains("unable to resolve", ignoreCase = true) ||
                    msg.contains("timeout", ignoreCase = true) ->
                        Resource.Error("No internet connection. Please check your network and try again.")
                    msg.contains("password", ignoreCase = true) ||
                    msg.contains("credential", ignoreCase = true) ->
                        Resource.Error("Incorrect email or password. Please try again.")
                    else -> Resource.Error("Login failed. Please try again.")
                }
            }
        }

        // Firebase completely unavailable — JVM unit test / offline demo mode only
        val demoUser = demoUsers[trimmedEmail]
        return if (demoUser != null) {
            saveUserToPrefs(demoUser)
            Resource.Success(demoUser)
        } else {
            Resource.Error("No internet connection. Please connect to use APILA.")
        }
    }

    // ── Registration ──────────────────────────────────────────────────────────

    suspend fun registerResident(
        fullName: String,
        email: String,
        pass: String,
        phone: String,
        purok: String,
        address: String,
        gender: String,
        birthdate: String
    ): Resource<User> {
        val trimmedEmail = email.trim().lowercase()

        val auth = firebaseAuth
        val db = firestore

        // Firebase is available — this is the ONLY path on a real device
        if (auth != null && db != null) {
            return try {
                val authResult = auth.createUserWithEmailAndPassword(trimmedEmail, pass).await()
                val uid = authResult.user?.uid
                    ?: return Resource.Error("Registration failed. Please try again.")

                val newUser = User(
                    uid = uid,
                    fullName = fullName,
                    email = trimmedEmail,
                    phone = phone,
                    role = User.ROLE_RESIDENT,
                    purok = purok,
                    address = address,
                    gender = gender,
                    birthdate = birthdate,
                    isVerified = false
                )

                // Write to both Firestore collections
                db.collection("users").document(uid).set(newUser).await()
                val residentDoc = hashMapOf(
                    "name" to fullName,
                    "email" to trimmedEmail,
                    "phone" to phone,
                    "purok" to purok,
                    "address" to address,
                    "householdId" to "HH-${(100..999).random()}",
                    "gender" to gender,
                    "civilStatus" to "Single",
                    "birthdate" to birthdate,
                    "isVerified" to false,
                    "createdAt" to com.google.firebase.Timestamp.now()
                )
                db.collection("residents").document(uid).set(residentDoc).await()

                saveUserToPrefs(newUser)
                Log.d("AuthRepo", "Registered new resident in Firebase: $fullName ($uid)")
                Resource.Success(newUser)

            } catch (e: FirebaseAuthUserCollisionException) {
                // Email already registered — try signing in with the same password
                try {
                    val authResult = auth.signInWithEmailAndPassword(trimmedEmail, pass).await()
                    val uid = authResult.user?.uid
                        ?: return Resource.Error("An account with this email already exists. Please log in instead.")

                    val existingUser = User(
                        uid = uid,
                        fullName = fullName,
                        email = trimmedEmail,
                        phone = phone,
                        role = User.ROLE_RESIDENT,
                        purok = purok,
                        address = address,
                        gender = gender,
                        birthdate = birthdate,
                        isVerified = false
                    )
                    // Update Firestore with latest info
                    db.collection("users").document(uid).set(existingUser).await()
                    val residentDoc = hashMapOf(
                        "name" to fullName,
                        "email" to trimmedEmail,
                        "phone" to phone,
                        "purok" to purok,
                        "address" to address,
                        "householdId" to "HH-${(100..999).random()}",
                        "gender" to gender,
                        "civilStatus" to "Single",
                        "birthdate" to birthdate,
                        "isVerified" to false,
                        "createdAt" to com.google.firebase.Timestamp.now()
                    )
                    db.collection("residents").document(uid).set(residentDoc).await()
                    saveUserToPrefs(existingUser)
                    Resource.Success(existingUser)
                } catch (_: Exception) {
                    Resource.Error("An account with this email already exists. Please log in instead.")
                }
            } catch (e: Exception) {
                val msg = e.message ?: ""
                when {
                    msg.contains("network", ignoreCase = true) ||
                    msg.contains("unable to resolve", ignoreCase = true) ||
                    msg.contains("timeout", ignoreCase = true) ->
                        Resource.Error("No internet connection. Please check your network and try again.")
                    msg.contains("email", ignoreCase = true) ->
                        Resource.Error("This email address is invalid or already in use.")
                    msg.contains("password", ignoreCase = true) ->
                        Resource.Error("Password must be at least 6 characters.")
                    else -> Resource.Error("Registration failed. Please try again.")
                }
            }
        }

        // Firebase completely unavailable — JVM unit test / offline mode only
        return Resource.Error("No internet connection. Please connect to register.")
    }

    // ── Update Profile ────────────────────────────────────────────────────────

    suspend fun updateUserProfile(
        uid: String,
        fullName: String,
        phone: String,
        purok: String,
        address: String,
        gender: String,
        birthdate: String
    ): Resource<User> {
        val current = currentUser ?: loadUserFromPrefs() ?: User(uid = uid)
        val updatedUser = current.copy(
            fullName = fullName,
            phone = phone,
            purok = purok,
            address = address,
            gender = gender,
            birthdate = birthdate
        )

        val db = firestore
        if (db != null) {
            try {
                // Update Firestore "users"
                db.collection("users").document(uid).set(updatedUser).await()

                // Update Firestore "residents"
                val residentUpdates = mapOf<String, Any>(
                    "name" to fullName,
                    "phone" to phone,
                    "purok" to purok,
                    "address" to address,
                    "gender" to gender,
                    "birthdate" to birthdate,
                    "updatedAt" to com.google.firebase.Timestamp.now()
                )
                db.collection("residents").document(uid).set(residentUpdates, SetOptions.merge()).await()
                Log.d("AuthRepo", "Updated profile in Firestore: $fullName ($uid)")
            } catch (e: Exception) {
                Log.w("AuthRepo", "Error updating profile in Firestore: ${e.message}")
            }
        }

        saveUserToPrefs(updatedUser)
        return Resource.Success(updatedUser)
    }

    // ── Refresh Live User Profile & Verification Status ────────────────────────

    suspend fun refreshUserProfile(uid: String): User? {
        val db = firestore ?: return currentUser
        return try {
            val resDoc = db.collection("residents").document(uid).get().await()
            val current = currentUser ?: loadUserFromPrefs() ?: User(uid = uid)
            if (resDoc.exists()) {
                val isVerified = resDoc.getBoolean("isVerified") ?: current.isVerified
                val gender = resDoc.getString("gender") ?: current.gender
                val birthdate = resDoc.getString("birthdate") ?: current.birthdate
                val householdId = resDoc.getString("householdId") ?: current.householdId
                val name = resDoc.getString("name") ?: current.fullName
                val phone = resDoc.getString("phone") ?: current.phone
                val purok = resDoc.getString("purok") ?: current.purok
                val address = resDoc.getString("address") ?: current.address

                val refreshed = current.copy(
                    fullName = name,
                    phone = phone,
                    purok = purok,
                    address = address,
                    householdId = householdId,
                    gender = gender,
                    birthdate = birthdate,
                    isVerified = isVerified
                )
                saveUserToPrefs(refreshed)
                refreshed
            } else {
                current
            }
        } catch (_: Exception) {
            currentUser
        }
    }

    // ── Session management ────────────────────────────────────────────────────

    fun getCurrentUser(): User? {
        if (currentUser != null) return currentUser
        val restored = loadUserFromPrefs()
        if (restored != null) {
            currentUser = restored
            return restored
        }
        return null
    }

    // ── Demo role switcher (used only by unit tests / demo build) ─────────────

    fun switchRoleForDemo(asAdmin: Boolean): User {
        val user = if (asAdmin) {
            demoUsers["admin@lapasan.gov.ph"] ?: User(
                uid = "demo_admin_001",
                fullName = "Hon. Roberto Delos Reyes",
                email = "admin@lapasan.gov.ph",
                phone = "09189876543",
                role = User.ROLE_PERSONNEL,
                purok = "Barangay Hall",
                address = "Barangay Hall, Lapasan, Cagayan de Oro City",
                isVerified = true
            )
        } else {
            demoUsers["resident@lapasan.gov.ph"] ?: User(
                uid = "demo_resident_001",
                fullName = "Maria Clara Santos",
                email = "resident@lapasan.gov.ph",
                phone = "09171234567",
                role = User.ROLE_RESIDENT,
                purok = "Purok 2 - Lapasan Proper",
                address = "Block 4 Lot 12, Lapasan Proper",
                gender = "Female",
                birthdate = "1995-04-12",
                isVerified = true
            )
        }
        saveUserToPrefs(user)
        // Sync demo resident to Firestore so Admin Web sees them
        if (!asAdmin) {
            syncResidentToFirestore(user)
        }
        return user
    }

    // ── Firestore sync (used only for demo users) ─────────────────────────────

    fun syncResidentToFirestore(user: User) {
        val db = firestore ?: return
        try {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val residentDoc = hashMapOf(
                        "name" to user.fullName,
                        "email" to user.email,
                        "phone" to user.phone,
                        "purok" to user.purok,
                        "address" to user.address,
                        "householdId" to "HH-001",
                        "gender" to user.gender,
                        "civilStatus" to "Single",
                        "birthdate" to user.birthdate,
                        "isVerified" to user.isVerified,
                        "createdAt" to com.google.firebase.Timestamp.now()
                    )
                    db.collection("residents").document(user.uid).set(residentDoc).await()
                    db.collection("users").document(user.uid).set(user).await()
                    Log.d("AuthRepo", "Synced demo resident to Firestore: ${user.uid}")
                } catch (e: Exception) {
                    Log.w("AuthRepo", "Could not sync to Firestore: ${e.message}")
                }
            }
        } catch (_: Throwable) {}
    }

    fun logout() {
        try {
            firebaseAuth?.signOut()
        } catch (_: Exception) {}
        clearUserPrefs()
    }
}
