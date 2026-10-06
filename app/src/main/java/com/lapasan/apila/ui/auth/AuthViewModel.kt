package com.lapasan.apila.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapasan.apila.data.model.User
import com.lapasan.apila.data.repository.AuthRepository
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.launch

class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _loginState = MutableLiveData<Resource<User>>()
    val loginState: LiveData<Resource<User>> = _loginState

    private val _registerState = MutableLiveData<Resource<User>>()
    val registerState: LiveData<Resource<User>> = _registerState

    private val _currentUser = MutableLiveData<User?>()
    val currentUser: LiveData<User?> = _currentUser

    init {
        _currentUser.value = authRepository.getCurrentUser()
    }

    fun login(email: String, pass: String) {
        _loginState.value = Resource.Loading()
        viewModelScope.launch {
            val result = authRepository.login(email, pass)
            if (result is Resource.Success) {
                _currentUser.value = result.data
            }
            _loginState.value = result
        }
    }

    fun register(
        fullName: String,
        email: String,
        pass: String,
        phone: String,
        purok: String,
        address: String
    ) {
        _registerState.value = Resource.Loading()
        viewModelScope.launch {
            val result = authRepository.registerResident(fullName, email, pass, phone, purok, address)
            if (result is Resource.Success) {
                _currentUser.value = result.data
            }
            _registerState.value = result
        }
    }

    fun switchDemoRole(asAdmin: Boolean) {
        val user = authRepository.switchRoleForDemo(asAdmin)
        _currentUser.value = user
        _loginState.value = Resource.Success(user)
    }

    fun logout() {
        authRepository.logout()
        _currentUser.value = null
    }
}
