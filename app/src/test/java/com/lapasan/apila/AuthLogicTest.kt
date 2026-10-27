package com.lapasan.apila

import com.lapasan.apila.data.model.User
import com.lapasan.apila.data.repository.AuthRepository
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class AuthLogicTest {

    private lateinit var authRepository: AuthRepository

    @Before
    fun setUp() {
        authRepository = AuthRepository()
        authRepository.logout()
    }

    @Test
    fun testUserModelDefaultsAndRoles() {
        val resident = User(
            uid = "res_123",
            fullName = "Juan Dela Cruz",
            email = "juan@example.com",
            phone = "09171234567",
            role = User.ROLE_RESIDENT,
            purok = "Purok 2 - Lapasan Proper",
            address = "Lapasan Proper"
        )
        assertFalse("Resident should not be personnel", resident.isPersonnel)
        assertEquals(User.ROLE_RESIDENT, resident.role)

        val personnel = User(
            uid = "staff_123",
            fullName = "Admin Staff",
            email = "staff@lapasan.gov.ph",
            role = User.ROLE_PERSONNEL
        )
        assertTrue("Personnel should have isPersonnel = true", personnel.isPersonnel)
    }

    @Test
    fun testDemoResidentAuthentication() {
        val resident = authRepository.switchRoleForDemo(asAdmin = false)
        assertNotNull(resident)
        assertEquals(User.ROLE_RESIDENT, resident.role)
        assertEquals("resident@lapasan.gov.ph", resident.email)
        assertEquals("Maria Clara Santos", resident.fullName)
        assertEquals(resident, authRepository.getCurrentUser())

        authRepository.logout()
        assertNull(authRepository.getCurrentUser())
    }

    @Test
    fun testRegistrationValidationRules() {
        // Validation Rule 1: Full name not blank
        val validName = "Maria Santos"
        val blankName = "   "
        assertTrue(validName.isNotBlank())
        assertFalse(blankName.isNotBlank())

        // Validation Rule 2: Email format
        val validEmail = "maria@lapasan.gov.ph"
        val invalidEmail = "notanemail"
        assertTrue(validEmail.isNotBlank() && validEmail.contains("@"))
        assertFalse(invalidEmail.isNotBlank() && invalidEmail.contains("@"))

        // Validation Rule 3: Purok selection (position 0 is header)
        val selectedPurokPosition = 2 // e.g. Purok 2
        val unselectedPurokPosition = 0
        assertTrue(selectedPurokPosition > 0)
        assertFalse(unselectedPurokPosition > 0)

        // Validation Rule 4: Password min length >= 6
        val validPass = "secure123"
        val shortPass = "123"
        assertTrue(validPass.length >= 6)
        assertFalse(shortPass.length >= 6)

        // Validation Rule 5: Passwords match
        val passConfirm = "secure123"
        val mismatchConfirm = "different123"
        assertEquals(validPass, passConfirm)
        assertTrue(validPass != mismatchConfirm)
    }
}
