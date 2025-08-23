package com.emualerts

import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
class SignInActivityTest {
    @get:Rule
    val activityRule = ActivityScenarioRule(SignInActivity::class.java)

    @Test
    fun signInActivityLaunches() {
        // Simple test to verify the activity launches without crashing
        activityRule.scenario.onActivity { activity ->
            assert(activity != null)
        }
    }
}
