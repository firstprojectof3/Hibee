package com.dpp

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.util.Calendar

class UsageStatsModule(private val reactCtx: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactCtx) {

    override fun getName(): String = "UsageStatsModule"

    @ReactMethod
    fun checkPermission(promise: Promise) {
        promise.resolve(hasUsageAccessPermission(reactCtx))
    }

    @ReactMethod
    fun showSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactCtx.startActivity(intent)
    }

    /**
     * 오늘 0시부터 현재까지의 앱 사용 기록 조회
     */
    @ReactMethod
    fun getTodayUsage(promise: Promise) {
        if (!hasUsageAccessPermission(reactCtx)) {
            promise.reject("NO_PERMISSION", "Usage access not granted")
            return
        }

        val now = System.currentTimeMillis()
        val startOfDay = Calendar.getInstance().apply {
            timeInMillis = now
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val usm = reactCtx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val events = usm.queryEvents(startOfDay, now) ?: return promise.resolve(Arguments.createArray())
        
        val packageUsageMap = mutableMapOf<String, PackageUsage>()
        
        while (events.hasNextEvent()) {
            val event = UsageEvents.Event()
            if (!events.getNextEvent(event)) break
            
            val packageName = event.packageName ?: continue
            if (!shouldInclude(packageName, 1L)) continue 
            
            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND -> {
                    val usage = packageUsageMap.getOrPut(packageName) {
                        PackageUsage(packageName, 0L, event.timeStamp, event.timeStamp)
                    }
                    usage.foregroundStartTime = event.timeStamp
                    if (usage.firstTimeStamp == 0L || event.timeStamp < usage.firstTimeStamp) {
                        usage.firstTimeStamp = event.timeStamp
                    }
                }
                UsageEvents.Event.MOVE_TO_BACKGROUND -> {
                    val usage = packageUsageMap[packageName] ?: continue
                    if (usage.foregroundStartTime > 0L) {
                        val duration = event.timeStamp - usage.foregroundStartTime
                        usage.totalTime += duration
                        usage.foregroundStartTime = -1L
                    }
                    if (event.timeStamp > usage.lastTimeStamp) {
                        usage.lastTimeStamp = event.timeStamp
                    }
                }
            }
        }
        
        packageUsageMap.values.forEach { usage ->
            if (usage.foregroundStartTime > 0L) {
                val duration = now - usage.foregroundStartTime
                usage.totalTime += duration
                usage.lastTimeStamp = now
            }
        }
        
        val result: WritableArray = Arguments.createArray()
        packageUsageMap.values.forEach { usage ->
            if (usage.totalTime > 0L) {
                val map: WritableMap = Arguments.createMap().apply {
                    putString("packageName", usage.packageName)
                    putDouble("usageTime", usage.totalTime.toDouble() / 1000.0)
                    putDouble("firstTimeStamp", usage.firstTimeStamp.toDouble())
                    putDouble("lastTimeStamp", usage.lastTimeStamp.toDouble())
                }
                result.pushMap(map)
            }
        }
        promise.resolve(result)
    }

    /**
     * SharedPreferences에서 오늘 저장된 총 언락 횟수 가져오기
     */
    @ReactMethod
    fun getUnlockCount(promise: Promise) {
        val prefs = reactCtx.getSharedPreferences("usage_prefs", Context.MODE_PRIVATE)
        val count = prefs.getInt("unlock_count", 0)
        promise.resolve(count)
    }

    /**
     * 언락 횟수 리셋
     */
    @ReactMethod
    fun resetUnlockCount() {
        val prefs = reactCtx.getSharedPreferences("usage_prefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("unlock_count", 0).apply()
    }

    private data class PackageUsage(
        val packageName: String,
        var totalTime: Long,
        var firstTimeStamp: Long,
        var lastTimeStamp: Long,
        var foregroundStartTime: Long = -1L
    )

    private fun shouldInclude(packageName: String?, totalTimeInForegroundMs: Long): Boolean {
        if (packageName.isNullOrBlank()) return false
        if (totalTimeInForegroundMs <= 0L) return false
        if (packageName == "com.android.settings" || packageName == "com.android.vending") return true

        val lower = packageName.lowercase()
        val blacklist = listOf("systemui", "launcher", "keyboard", "bluetooth", "provider")
        return !blacklist.any { lower.contains(it) }
    }

    private fun hasUsageAccessPermission(ctx: Context): Boolean {
        val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), ctx.packageName)
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), ctx.packageName)
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }
}